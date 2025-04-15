
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

  // Log full token URL for debugging
  logInfo(`Full token URL: ${tokenUrl.toString()}`);

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

const fetchAdAccounts = async (accessToken: string) => {
  logInfo("Fetching ad accounts");
  
  const url = `https://graph.facebook.com/v22.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${accessToken}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    logError(`Failed to fetch ad accounts: ${response.status}`, errorText);
    throw new Error(`Failed to fetch ad accounts: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  logInfo(`Successfully fetched ${data.data?.length || 0} ad accounts`);
  return data.data || [];
};

const handleRequest = async (req: Request) => {
  try {
    // Parse URL and get query parameters
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorReason = url.searchParams.get('error_reason');
    const state = url.searchParams.get('state') || 'facebook';
    
    logInfo("Received OAuth callback", { 
      code: code ? `${code.substring(0, 5)}...` : null,
      error,
      errorReason,
      state,
      origin: url.origin,
      fullUrl: req.url
    });
    
    if (error) {
      logError(`Facebook OAuth error: ${error} - ${errorReason}`);
      return new Response(
        JSON.stringify({ error: errorReason || error }),
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
      // Continue as anonymous for now
      logInfo("Proceeding without authenticated user");
    } else {
      logInfo("Authenticated user", { id: user.id, email: user.email });
    }
    
    // IMPORTANT: Use the real app domain that is registered in Facebook Developer Console
    // For Facebook, we need to use the exact same redirect URI that was used in the initial request
    // This MUST match what's in your Facebook App settings
    const redirectUri = `https://alchemylab.app/api/auth/callback/facebook`;
    
    logInfo(`Using redirect URI: ${redirectUri}`);
    
    // Exchange the authorization code for a token
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    
    if (!tokenData || !tokenData.accessToken) {
      logError("Failed to get access token");
      return new Response(
        JSON.stringify({ error: "Failed to get access token" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    logInfo("Successfully obtained access token");
    
    // If we have a user, save the connection
    if (user) {
      // Get user's organization
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();
      
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
      
      logInfo("Found user organization", { organizationId: userProfile.organization_id });
      
      // Fetch ad accounts
      const adAccounts = await fetchAdAccounts(tokenData.accessToken);
      
      if (adAccounts.length === 0) {
        logInfo("No ad accounts found for user");
        // Continue anyway, but with a warning
      }
      
      // Process each ad account (or at least save the connection if no ad accounts)
      if (adAccounts.length > 0) {
        for (const account of adAccounts) {
          const accountId = account.id.replace('act_', '');
          
          logInfo("Processing ad account", { 
            accountId, 
            accountName: account.name,
            status: account.account_status
          });
          
          const { data: existingConnection, error: connectionError } = await supabase
            .from('platform_connections')
            .select('id')
            .eq('platform', 'facebook')
            .eq('organization_id', userProfile.organization_id)
            .eq('account_id', accountId)
            .maybeSingle();
          
          if (connectionError) {
            logError("Error checking for existing connection", connectionError);
          }
          
          if (existingConnection) {
            logInfo("Updating existing platform connection", { id: existingConnection.id });
            const { error: updateError } = await supabase
              .from('platform_connections')
              .update({
                auth_token: tokenData.accessToken,
                token_expiry: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', existingConnection.id);
              
            if (updateError) {
              logError("Error updating connection", updateError);
            }
          } else {
            logInfo("Creating new platform connection");
            const { error: insertError } = await supabase
              .from('platform_connections')
              .insert({
                platform: 'facebook',
                organization_id: userProfile.organization_id,
                auth_token: tokenData.accessToken,
                token_expiry: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
                account_id: accountId,
                account_name: account.name,
                connected_by: user.id,
                connected: true
              });
              
            if (insertError) {
              logError("Error creating connection", insertError);
            }
          }
        }
      } else {
        // No ad accounts, but still save the connection with just the token
        logInfo("No ad accounts found, saving platform connection with just the token");
        const { error: insertError } = await supabase
          .from('platform_connections')
          .insert({
            platform: 'facebook',
            organization_id: userProfile.organization_id,
            auth_token: tokenData.accessToken,
            token_expiry: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
            connected_by: user.id,
            connected: true,
            account_name: "Facebook Account"
          });
          
        if (insertError) {
          logError("Error creating connection", insertError);
        }
      }
    }
    
    logInfo("Facebook OAuth callback completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Facebook connection successful", 
        adAccountsCount: user ? (await fetchAdAccounts(tokenData.accessToken)).length : 0 
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
