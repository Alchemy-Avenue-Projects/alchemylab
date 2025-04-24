import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Temporarily allow all origins for debugging
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID");
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const REDIRECT_URI = Deno.env.get("FACEBOOK_REDIRECT_URI") || "https://api.alchemylab.app/facebook-oauth-callback";

// Validate required environment variables
if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing required environment variables");
}

const logInfo = (message: string, data?: any) => {
  if (data) {
    console.log(`INFO: ${message}`, data);
  } else {
    console.log(`INFO: ${message}`);
  }
};

const logError = (message: string, error?: any) => {
  if (error) {
    console.error(`ERROR: ${message}`, error);
  } else {
    console.error(`ERROR: ${message}`);
  }
};

const handlePreflight = () => {
  return new Response(null, { headers: corsHeaders, status: 204 });
};

const exchangeCodeForToken = async (code: string) => {
  logInfo(`Exchanging code for token with redirect URI: ${REDIRECT_URI}`);

  const tokenUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  tokenUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
  tokenUrl.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
  tokenUrl.searchParams.append("redirect_uri", REDIRECT_URI);
  tokenUrl.searchParams.append("code", code);

  const response = await fetch(tokenUrl.toString());
  
  if (!response.ok) {
    const errorText = await response.text();
    logError(`Token exchange failed: ${response.status}`, errorText);
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  logInfo("Successfully exchanged code for token", { 
    tokenType: data.token_type, 
    expiresIn: data.expires_in 
  });
  
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
};

const handleRequest = async (req: Request) => {
  try {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return handlePreflight();
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code') ?? '';
    const error = url.searchParams.get('error') ?? '';
    const state = url.searchParams.get('state') ?? '';
    
    logInfo("Received OAuth callback", { 
      code: code ? `${code.substring(0, 5)}...` : null,
      error,
      state: state ? `${state.substring(0, 20)}...` : null
    });
    
    if (error) {
      logError(`Facebook OAuth error: ${error}`);
      return new Response(
        JSON.stringify({ error: error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!code) {
      logError("Missing authorization code");
      return new Response(
        JSON.stringify({ error: "Missing authorization code" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Parse the state parameter
    let stateData;
    try {
      const decodedState = decodeURIComponent(state).replace(/#.*$/, ''); // Remove Facebook's #_=_ suffix
      stateData = JSON.parse(atob(decodedState));
      logInfo("Parsed state data", stateData);
    } catch (err) {
      logError("Error parsing state parameter", err);
      return new Response(
        JSON.stringify({ error: "Invalid state parameter format" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate state data
    if (!stateData.accessToken || !stateData.timestamp || !stateData.nonce) {
      logError("Missing required state parameters", stateData);
      return new Response(
        JSON.stringify({ error: "Invalid state parameter: missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate timestamp (5 minute window)
    const now = Date.now();
    if (now - stateData.timestamp > 5 * 60 * 1000) {
      logError("State parameter expired", { now, timestamp: stateData.timestamp });
      return new Response(
        JSON.stringify({ error: "State parameter expired" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Get user from the access token
    const { data: { user }, error: authError } = await supabase.auth.getUser(stateData.accessToken);
    
    if (authError || !user) {
      logError("Invalid user session", { authError });
      return new Response(
        JSON.stringify({ error: "Invalid user session", details: authError?.message }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    try {
      // Exchange the code for a token
      const tokenData = await exchangeCodeForToken(code);
      
      // Store the connection
      const { error: storeError } = await supabase
        .from('platform_connections')
        .upsert({
          platform: 'facebook',
          organization_id: user.id,
          auth_token: tokenData.accessToken,
          token_expiry: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
          connected_by: user.id,
          connected: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'platform,organization_id'
        });

      if (storeError) {
        logError("Error storing connection", storeError);
        throw storeError;
      }
      
      // Redirect to success page
      return new Response(
        null,
        { 
          status: 302,
          headers: { 
            ...corsHeaders,
            'Location': 'https://alchemylab.app/app/settings?tab=integrations&success=facebook_connected'
          }
        }
      );
    } catch (err) {
      logError("Error processing connection", err);
      return new Response(
        JSON.stringify({ error: err.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (err) {
    logError("Unhandled error in OAuth callback", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handleRequest);
