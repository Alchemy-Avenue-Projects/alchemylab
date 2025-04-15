
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
      connected: false  // Not fully connected yet
    })
    .select()
    .single();

  if (error) {
    logError('Error storing authorization code', error);
    throw error;
  }

  return data;
};

const exchangeCodeForToken = async (code: string, redirectUri: string) => {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    throw new Error("Missing Facebook app credentials");
  }

  logInfo(`Exchanging code for token with redirect URI: ${redirectUri}`);

  const tokenUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  tokenUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
  tokenUrl.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
  tokenUrl.searchParams.append("redirect_uri", redirectUri);
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
    const { code, error, state } = await req.json();
    
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
    
    // Get the auth token from the request headers
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      logError("Auth error or user not found", authError);
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get user's organization
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();
    
    if (profileError || !userProfile?.organization_id) {
      logError("Profile error or missing organization", profileError);
      return new Response(
        JSON.stringify({ error: "Missing organization" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Store the authorization code in the database
    const storedConnection = await storeAuthorizationCode(
      supabase, 
      code, 
      user,
      userProfile.organization_id
    );
    
    // IMPORTANT: Use the real app domain that is registered in Facebook Developer Console
    const redirectUri = `https://alchemylab.app/api/auth/callback/facebook`;
    
    // Try to exchange the code for a token
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    
    // Update the connection with the token details
    const { error: updateError } = await supabase
      .from('platform_connections')
      .update({
        auth_token: tokenData.accessToken,
        token_expiry: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
        connected: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', storedConnection.id);
    
    if (updateError) {
      logError("Error updating connection with token", updateError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Facebook connection successful",
        connectionId: storedConnection.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    logError('Facebook OAuth callback error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handlePreflight();
  }
  
  return handleRequest(req);
});
