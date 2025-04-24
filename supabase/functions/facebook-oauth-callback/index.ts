import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID") || "";
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const REDIRECT_URI = Deno.env.get("FACEBOOK_REDIRECT_URI") || "https://api.alchemylab.app/facebook-oauth-callback";

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

const storeAuthorizationCode = async (supabase: any, code: string, user: any, organizationId: string) => {
  const { data, error } = await supabase
    .from('platform_connections')
    .insert({
      platform: 'facebook',
      organization_id: organizationId,
      auth_code: code,
      connected_by: user.id,
      connected: false
    })
    .select()
    .single();

  if (error) {
    logError('Error storing authorization code', error);
    throw error;
  }

  return data;
};

const exchangeCodeForToken = async (code: string) => {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    throw new Error("Missing Facebook app credentials");
  }

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
    const url = new URL(req.url);
    const code = url.searchParams.get('code') ?? '';
    const error = url.searchParams.get('error') ?? '';
    const state = url.searchParams.get('state') ?? '{}';

    logInfo("Received OAuth callback", { 
      code: code ? `${code.substring(0, 5)}...` : null,
      error,
      state
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

    // Parse the state parameter to get user information
    let userId: string | null = null;
    let accessToken: string | null = null;
    
    try {
      const stateData = JSON.parse(atob(state));
      userId = stateData.userId;
      accessToken = stateData.accessToken;
    } catch (err) {
      logError("Error parsing state parameter", err);
      return new Response(
        JSON.stringify({ error: "Invalid state parameter" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.id !== userId) {
      logError("Invalid user session", { authError, userId, user });
      return new Response(
        JSON.stringify({ error: "Invalid user session" }),
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
      const { data: connection, error: storeError } = await supabase
        .from('platform_connections')
        .insert({
          platform: 'facebook',
          organization_id: user.id,
          auth_token: tokenData.accessToken,
          token_expiry: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
          connected_by: user.id,
          connected: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (storeError) {
        logError("Error storing connection", storeError);
        throw storeError;
      }
      
      // Redirect to the success page
      return new Response(
        null,
        { 
          status: 302,
          headers: { 
            ...corsHeaders,
            'Location': `${window.location.origin}/app/settings?success=facebook_connected`
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
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve((req) => {
  if (req.method === 'OPTIONS') {
    return handlePreflight();
  }
  return handleRequest(req);
});
