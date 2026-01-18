import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

// CORS allowlist (comma-separated) configurable via env; defaults to production and localhost
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "https://alchemylab.app,https://www.alchemylab.app,http://localhost:5173,http://127.0.0.1:5173").split(",").map(o => o.trim());

const getCorsHeaders = (origin?: string) => {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  } as Record<string, string>;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Handle CORS preflight requests
const handlePreflight = (origin?: string) => {
  return new Response(null, { headers: getCorsHeaders(origin), status: 204 });
};

// Exchange authorization code for access token
const exchangeCodeForToken = async (platform: string, code: string, redirectUri: string) => {
  const clientId = Deno.env.get(`${platform.toUpperCase()}_CLIENT_ID`) || "";
  const clientSecret = Deno.env.get(`${platform.toUpperCase()}_CLIENT_SECRET`) || "";
  
  if (!clientId || !clientSecret) {
    throw new Error(`Missing credentials for ${platform}`);
  }
  
  let tokenUrl = "";
  let params: Record<string, string> = {};
  
  // Configure token request for each platform
  switch (platform) {
    case 'facebook':
      tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
      params = {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
      };
      break;
    case 'google':
    case 'google_analytics':
      tokenUrl = 'https://oauth2.googleapis.com/token';
      params = {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      };
      break;
    case 'linkedin':
      tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
      params = {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      };
      break;
    case 'tiktok':
      tokenUrl = 'https://ads.tiktok.com/open_api/oauth2/access_token/';
      params = {
        app_id: clientId,
        secret: clientSecret,
        auth_code: code,
        grant_type: 'authorization_code'
      };
      break;
    case 'mixpanel':
      tokenUrl = 'https://mixpanel.com/api/app/oauth/token';
      params = {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      };
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
  
  // Make token request
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token request failed: ${response.status} - ${errorText}`);
  }
  
  const tokenData = await response.json();
  
  // Process token response - each platform has different response format
  let accessToken = tokenData.access_token;
  let refreshToken = tokenData.refresh_token;
  let expiresIn = tokenData.expires_in || 3600;
  
  if (platform === 'tiktok') {
    accessToken = tokenData.data.access_token;
    refreshToken = tokenData.data.refresh_token;
    expiresIn = tokenData.data.expires_in || 3600;
  }
  
  return {
    accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
};

// Get account info for the connected platform
const getAccountInfo = async (platform: string, accessToken: string) => {
  let accountName = "";
  let accountId = "";
  
  try {
    // Get account details from each platform
    switch (platform) {
      case 'facebook':
        const fbResponse = await fetch('https://graph.facebook.com/v18.0/me?fields=name,id', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (fbResponse.ok) {
          const fbData = await fbResponse.json();
          accountName = fbData.name;
          accountId = fbData.id;
        }
        break;
      
      case 'google':
      case 'google_analytics':
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          accountName = googleData.email;
          accountId = googleData.sub;
        }
        break;
      
      // Add other platforms as needed
    }
  } catch (error) {
    console.error(`Error fetching account info for ${platform}:`, error);
    // Continue with empty account info if there's an error
  }
  
  return { accountName, accountId };
};

// Simple AES-GCM encryption helper using a base64 key from env ENCRYPTION_KEY
const encrypt = async (plaintext: string): Promise<string> => {
  const base64Key = Deno.env.get('ENCRYPTION_KEY');
  if (!base64Key) {
    throw new Error('ENCRYPTION_KEY is required for token encryption');
  }
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.length);
  return btoa(String.fromCharCode(...combined));
};

// Tier limits for ad accounts
const TIER_LIMITS: Record<string, number> = { trial: 1, starter: 3, pro: 7, enterprise: Infinity };
const AD_PLATFORMS = ['facebook', 'google', 'tiktok', 'linkedin'];

const handleRequest = async (req: Request) => {
  try {
    const { code, state, redirectUri } = await req.json();
    const origin = req.headers.get('Origin') || undefined;
    const corsHeaders = getCorsHeaders(origin);
    
    // Validate inputs
    if (!code || !state || !redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode state to get the platform (state is base64 JSON with platform info)
    let platform = state; // fallback if state is just a platform name (legacy)
    try {
      const decoded = JSON.parse(atob(state));
      // Platform might be in the state or we infer from context
      platform = decoded.platform || state;
    } catch {
      // state might be plain platform name (legacy flow)
    }
    
    // Exchange code for tokens
    const tokenInfo = await exchangeCodeForToken(platform, code, redirectUri);
    
    // Get account information
    const accountInfo = await getAccountInfo(platform, tokenInfo.accessToken);
    
    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user ID from auth token in request headers
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
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

    // Check tier limits for ad platforms
    if (AD_PLATFORMS.includes(platform)) {
      const { data: org } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', userProfile.organization_id)
        .single();
      
      const planLimit = TIER_LIMITS[org?.plan ?? 'trial'] ?? 1;
      
      const { count: existingCount } = await supabase
        .from('platform_connections')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', userProfile.organization_id)
        .eq('connected', true)
        .in('platform', AD_PLATFORMS);
      
      const { data: existingConnection } = await supabase
        .from('platform_connections')
        .select('id')
        .eq('organization_id', userProfile.organization_id)
        .eq('platform', platform)
        .single();
      
      if (!existingConnection && (existingCount ?? 0) >= planLimit) {
        return new Response(
          JSON.stringify({ error: 'Tier limit reached', message: `Your plan allows ${planLimit} ad account(s). Please upgrade.` }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Store connection in database (upsert to handle reconnections)
    const encAccess = await encrypt(tokenInfo.accessToken);
    const encRefresh = tokenInfo.refreshToken ? await encrypt(tokenInfo.refreshToken) : null;

    const { data: connection, error: upsertError } = await supabase
      .from('platform_connections')
      .upsert({
        platform: platform,
        organization_id: userProfile.organization_id,
        auth_token: encAccess,
        refresh_token: encRefresh,
        token_expiry: tokenInfo.expiresAt,
        account_name: accountInfo.accountName || 'Connected Account',
        account_id: accountInfo.accountId,
        connected_by: user.id,
        connected: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'organization_id,platform' })
      .select()
      .single();
    
    if (upsertError) {
      return new Response(
        JSON.stringify({ error: `Failed to store connection: ${upsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, connection }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    const origin = (error as any)?.origin || undefined;
    const corsHeaders = getCorsHeaders(origin);
    return new Response(
      JSON.stringify({ error: `${(error as any).message || 'Internal server error'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin') || undefined;
    return handlePreflight(origin);
  }
  
  // Handle the actual request
  if (req.method === 'POST') {
    return handleRequest(req);
  }
  
  const origin = req.headers.get('Origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
