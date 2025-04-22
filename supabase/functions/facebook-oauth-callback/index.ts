
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
    const url = new URL(req.url);
    const code = url.searchParams.get('code') ?? '';
    const error = url.searchParams.get('error') ?? '';
    const state = url.searchParams.get('state') ?? '{}';

    const parsedState = JSON.parse(state);
    const jwt = parsedState.jwt ?? '';
    const token = req.headers.get('Authorization')?.replace('Bearer ', '') || jwt;

    
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
    
    // Log more debugging information
    logInfo("Auth token status:", { 
      tokenPresent: !!token, 
      tokenLength: token?.length || 0,
      userFound: !!user,
      authError: authError?.message
    });
    
    // If we can't get the user from the token, we'll try to find the connection by auth_code
    if (authError || !user) {
      logInfo("Could not authenticate user from token, looking for existing connection with auth_code");
      
      const { data: existingConnection, error: connectionError } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('auth_code', code)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (connectionError || !existingConnection) {
        logError("Could not find an existing connection with this auth code", connectionError);
        return new Response(
          JSON.stringify({ error: "Authentication required and no existing connection found" }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // IMPORTANT: Use the real app domain that is registered in Facebook Developer Console
      const redirectUri = `https://api.alchemylab.app/facebook-oauth-callback`;
      
      try {
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
          .eq('id', existingConnection.id);
        
        if (updateError) {
          logError("Error updating connection with token", updateError);
          throw updateError;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Facebook connection successful",
            connectionId: existingConnection.id
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (tokenError) {
        logError("Error exchanging code for token", tokenError);
        throw tokenError;
      }
    }
    
    // Get user's organization
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();
    
    if (profileError || !userProfile?.organization_id) {
      logError("Profile error or missing organization", profileError);
      // Use user.id as organization_id if no organization is found
      const organizationId = user.id;
      logInfo("Using user.id as organization_id fallback", { userId: user.id });
      
      // Continue with the user.id as organization_id
      
      // Look for an existing connection with this auth_code
      const { data: existingConnection, error: findError } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('auth_code', code)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      // If we found a connection, update it rather than creating a new one
      let connectionId = '';
      
      if (!findError && existingConnection) {
        connectionId = existingConnection.id;
      } else {
        // No existing connection found, create a new one
        const { data: newConnection, error: createError } = await supabase
          .from('platform_connections')
          .insert({
            platform: state || 'facebook',
            organization_id: organizationId,
            auth_code: code,
            connected_by: user.id,
            connected: false  // Not fully connected yet
          })
          .select()
          .single();
        
        if (createError) {
          logError("Error creating connection", createError);
          throw createError;
        }
        
        connectionId = newConnection.id;
      }
      
      // IMPORTANT: Use the real app domain that is registered in Facebook Developer Console
      const redirectUri = `https://api.alchemylab.app/facebook-oauth-callback`;
      
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
        .eq('id', connectionId);
      
      if (updateError) {
        logError("Error updating connection with token", updateError);
        throw updateError;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Facebook connection successful",
          connectionId: connectionId
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Look for an existing connection with this auth_code
    const { data: existingConnection, error: findError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('auth_code', code)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // If we found a connection, update it rather than creating a new one
    let connectionId = '';
    
    if (!findError && existingConnection) {
      connectionId = existingConnection.id;
    } else {
      // Store the authorization code in the database
      const { data: newConnection, error: storeError } = await supabase
        .from('platform_connections')
        .insert({
          platform: state || 'facebook',
          organization_id: userProfile.organization_id,
          auth_code: code,
          connected_by: user.id,
          connected: false  // Not fully connected yet
        })
        .select()
        .single();

      if (storeError) {
        logError('Error storing authorization code', storeError);
        throw storeError;
      }
      
      connectionId = newConnection.id;
    }
    
    // IMPORTANT: Use the real app domain that is registered in Facebook Developer Console
    const redirectUri = `https://api.alchemylab.app/facebook-oauth-callback`;
    
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
      .eq('id', connectionId);
    
    if (updateError) {
      logError("Error updating connection with token", updateError);
      throw updateError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Facebook connection successful",
        connectionId: connectionId
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
