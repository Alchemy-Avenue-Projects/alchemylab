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

const handleRequest = async (req: Request) => {
  try {
    const { platform, refreshToken: token } = await req.json();
    const origin = req.headers.get('Origin') || undefined;
    const corsHeaders = getCorsHeaders(origin);
    
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
    const encAccess = await encrypt(tokenInfo.accessToken);
    const encRefresh = await encrypt(tokenInfo.refreshToken);

    const { error: updateError } = await supabase
      .from('platform_connections')
      .update({
        auth_token: encAccess,
        refresh_token: encRefresh,
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
    
    // Don't return raw tokens to frontend - only confirm refresh succeeded
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Token refreshed successfully',
        expiresAt: tokenInfo.expiresAt
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
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
