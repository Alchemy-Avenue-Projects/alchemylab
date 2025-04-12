
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

// Handle CORS preflight requests
const handlePreflight = () => {
  return new Response(null, { headers: corsHeaders, status: 204 });
};

// Exchange auth code for access token
const exchangeCodeForToken = async (code: string, redirectUri: string) => {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    throw new Error("Missing Facebook app credentials");
  }

  const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
  tokenUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
  tokenUrl.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
  tokenUrl.searchParams.append("redirect_uri", redirectUri);
  tokenUrl.searchParams.append("code", code);

  const response = await fetch(tokenUrl.toString());
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
};

// Fetch user's Facebook ad accounts
const fetchAdAccounts = async (accessToken: string) => {
  const url = `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${accessToken}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ad accounts: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.data || [];
};

const handleRequest = async (req: Request) => {
  try {
    // Parse URL and get query parameters
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorReason = url.searchParams.get('error_reason');
    
    // Check for errors from Facebook
    if (error) {
      console.error(`Facebook OAuth error: ${error} - ${errorReason}`);
      // Redirect to the frontend with error
      return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=facebook_auth_failed&reason=${errorReason}`, 302);
    }
    
    // Verify we have a code
    if (!code) {
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
      console.error("Auth error:", authError);
      return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=auth_required`, 302);
    }
    
    // Get user's organization from profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError || !userProfile?.organization_id) {
      console.error("Profile error:", profileError);
      return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=missing_organization`, 302);
    }
    
    // Exchange code for token
    const redirectUri = `${url.origin}/api/auth/callback/facebook`;
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    
    // Fetch ad accounts
    const adAccounts = await fetchAdAccounts(tokenData.accessToken);
    
    // Insert or update connections in platform_connections
    for (const account of adAccounts) {
      const accountId = account.id.replace('act_', '');
      
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
      
      // Also store in ad_accounts table for backward compatibility
      // Check if the ad account already exists
      const { data: existingAdAccount } = await supabase
        .from('ad_accounts')
        .select('id')
        .eq('platform', 'facebook')
        .eq('account_id_on_platform', accountId)
        .maybeSingle();
      
      if (existingAdAccount) {
        // Update existing ad account
        await supabase
          .from('ad_accounts')
          .update({
            auth_token: tokenData.accessToken,
            connected_at: new Date().toISOString()
          })
          .eq('id', existingAdAccount.id);
      } else {
        // Insert new ad account
        await supabase
          .from('ad_accounts')
          .insert({
            platform: 'facebook',
            account_id_on_platform: accountId,
            account_name: account.name,
            auth_token: tokenData.accessToken,
            client_id: userProfile.organization_id
          });
      }
    }
    
    // Redirect to success page
    return Response.redirect(`${url.origin}/app/settings?tab=integrations&success=facebook_connected`, 302);
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    const url = new URL(req.url);
    return Response.redirect(`${url.origin}/app/settings?tab=integrations&error=${encodeURIComponent(error.message)}`, 302);
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
