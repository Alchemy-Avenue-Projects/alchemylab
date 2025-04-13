
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

// Add more detailed logging for debugging
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

// Handle CORS preflight requests
const handlePreflight = () => {
  return new Response(null, { headers: corsHeaders, status: 204 });
};

// Exchange auth code for access token
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

// Fetch user's Facebook ad accounts
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
    const state = url.searchParams.get('state') || '';
    
    logInfo("Received OAuth callback", { 
      code: code ? `${code.substring(0, 5)}...` : null,
      error,
      errorReason,
      state
    });
    
    // Check for errors from Facebook
    if (error) {
      logError(`Facebook OAuth error: ${error} - ${errorReason}`);
      // Redirect to the frontend with error
      return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=facebook_auth_failed&reason=${errorReason}`, 302);
    }
    
    // Verify we have a code
    if (!code) {
      logError("Missing authorization code");
      return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=missing_code`, 302);
    }
    
    // Get auth header for user identification
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      logError("Auth error or user not found", authError);
      return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=auth_required`, 302);
    }
    
    logInfo("Authenticated user", { id: user.id, email: user.email });
    
    // Get user's organization from profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError || !userProfile?.organization_id) {
      logError("Profile error or missing organization", profileError);
      return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=missing_organization`, 302);
    }
    
    logInfo("Found user organization", { organizationId: userProfile.organization_id });
    
    // Exchange code for token
    const redirectUri = `${url.origin}/api/auth/callback/facebook`;
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    
    // Fetch ad accounts
    const adAccounts = await fetchAdAccounts(tokenData.accessToken);
    
    if (adAccounts.length === 0) {
      logInfo("No ad accounts found for user");
      return Response.redirect(`${url.origin}/app/settings?tab=integrations&warning=no_ad_accounts`, 302);
    }
    
    // Insert or update connections in platform_connections
    for (const account of adAccounts) {
      const accountId = account.id.replace('act_', '');
      
      logInfo("Processing ad account", { 
        accountId, 
        accountName: account.name,
        status: account.account_status
      });
      
      // First, check if this account connection already exists
      const { data: existingConnection } = await supabase
        .from('platform_connections')
        .select('id')
        .eq('platform', 'facebook')
        .eq('organization_id', userProfile.organization_id)
        .eq('account_id', accountId)
        .maybeSingle();
      
      if (existingConnection) {
        // Update existing connection
        logInfo("Updating existing platform connection", { id: existingConnection.id });
        await supabase
          .from('platform_connections')
          .update({
            auth_token: tokenData.accessToken,
            token_expiry: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConnection.id);
      } else {
        // Create new connection
        logInfo("Creating new platform connection");
        await supabase
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
      }
      
      // Also store in ad_accounts table per requirements
      // Check if the ad account already exists
      const { data: existingAdAccount } = await supabase
        .from('ad_accounts')
        .select('id')
        .eq('platform', 'facebook')
        .eq('account_id_on_platform', accountId)
        .maybeSingle();
      
      if (existingAdAccount) {
        // Update existing ad account
        logInfo("Updating existing ad account", { id: existingAdAccount.id });
        await supabase
          .from('ad_accounts')
          .update({
            auth_token: tokenData.accessToken,
            refresh_token: tokenData.expiresIn ? 'facebook_refresh_not_applicable' : null,
            connected_at: new Date().toISOString(),
            account_name: account.name
          })
          .eq('id', existingAdAccount.id);
      } else {
        // Insert new ad account
        logInfo("Creating new ad account");
        await supabase
          .from('ad_accounts')
          .insert({
            platform: 'facebook',
            account_id_on_platform: accountId,
            account_name: account.name,
            auth_token: tokenData.accessToken,
            client_id: userProfile.organization_id,
            connected_at: new Date().toISOString()
          });
      }
    }
    
    logInfo("Facebook OAuth callback completed successfully");
    // Redirect to success page
    return Response.redirect(`${url.origin}/app/settings?tab=integrations&success=facebook_connected`, 302);
  } catch (error) {
    logError('Facebook OAuth callback error:', error);
    const url = new URL(req.url);
    return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=${encodeURIComponent(error.message || "Unknown error")}`, 302);
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handlePreflight();
  }
  
  // Handle the actual request
  return handleRequest(req);
});
