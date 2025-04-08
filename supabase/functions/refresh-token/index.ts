
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Handle CORS preflight requests
const handlePreflight = () => {
  return new Response(null, { headers: corsHeaders, status: 204 });
};

// Refresh token for each platform
const refreshToken = async (platform: string, refreshToken: string) => {
  const clientId = Deno.env.get(`${platform.toUpperCase()}_CLIENT_ID`) || "";
  const clientSecret = Deno.env.get(`${platform.toUpperCase()}_CLIENT_SECRET`) || "";
  
  if (!clientId || !clientSecret) {
    throw new Error(`Missing credentials for ${platform}`);
  }
  
  let tokenUrl = "";
  let params: Record<string, string> = {};
  
  // Configure refresh token request for each platform
  switch (platform) {
    case 'facebook':
      tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
      params = {
        grant_type: 'fb_exchange_token',
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: refreshToken
      };
      break;
    case 'google':
    case 'google_analytics':
      tokenUrl = 'https://oauth2.googleapis.com/token';
      params = {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      };
      break;
    case 'linkedin':
      tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
      params = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      };
      break;
    case 'tiktok':
      tokenUrl = 'https://ads.tiktok.com/open_api/oauth2/refresh_token/';
      params = {
        app_id: clientId,
        secret: clientSecret,
        refresh_token: refreshToken
      };
      break;
    case 'pinterest':
      tokenUrl = 'https://api.pinterest.com/v5/oauth/token';
      params = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      };
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
  
  // Make token refresh request
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
  }
  
  const tokenData = await response.json();
  
  // Process token response - each platform has different response format
  let accessToken = tokenData.access_token;
  let newRefreshToken = tokenData.refresh_token || refreshToken; // Some platforms don't provide new refresh tokens
  let expiresIn = tokenData.expires_in || 3600;
  
  if (platform === 'tiktok') {
    accessToken = tokenData.data.access_token;
    newRefreshToken = tokenData.data.refresh_token || refreshToken;
    expiresIn = tokenData.data.expires_in || 3600;
  }
  
  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
};

const handleRequest = async (req: Request) => {
  try {
    const { platform, refreshToken: token } = await req.json();
    
    // Validate inputs
    if (!platform || !token) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Refresh token
    const tokenInfo = await refreshToken(platform, token);
    
    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user ID from auth token in request headers
    const authHeader = req.headers.get('Authorization') || '';
    const authToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user's organization from profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();
    
    if (profileError || !userProfile?.organization_id) {
      return new Response(
        JSON.stringify({ error: 'User profile not found or missing organization' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update connection in database
    const { error: updateError } = await supabase
      .from('platform_connections')
      .update({
        auth_token: tokenInfo.accessToken,
        refresh_token: tokenInfo.refreshToken,
        token_expiry: tokenInfo.expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('platform', platform)
      .eq('organization_id', userProfile.organization_id);
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update connection: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        accessToken: tokenInfo.accessToken, 
        refreshToken: tokenInfo.refreshToken,
        expiresAt: tokenInfo.expiresAt
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    
    return new Response(
      JSON.stringify({ error: `${error.message || 'Internal server error'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handlePreflight();
  }
  
  // Handle the actual request
  if (req.method === 'POST') {
    return handleRequest(req);
  }
  
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
