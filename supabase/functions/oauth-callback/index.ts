
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID") || "";
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID") || "";
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET") || "";
const TIKTOK_CLIENT_ID = Deno.env.get("TIKTOK_CLIENT_ID") || "";
const TIKTOK_CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET") || "";

const handleCORS = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  return null;
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { code, platform, redirectUri } = await req.json();
    console.log(`Processing OAuth callback for ${platform} with redirect URI: ${redirectUri}`);

    if (!code || !platform) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let clientId, clientSecret, tokenUrl, params;
    
    // Configure client ID and secret based on platform
    switch (platform) {
      case 'facebook':
        clientId = FACEBOOK_APP_ID;
        clientSecret = FACEBOOK_APP_SECRET;
        break;
      case 'google':
      case 'google_analytics':
        clientId = GOOGLE_CLIENT_ID;
        clientSecret = GOOGLE_CLIENT_SECRET;
        break;
      case 'linkedin':
        clientId = LINKEDIN_CLIENT_ID;
        clientSecret = LINKEDIN_CLIENT_SECRET;
        break;
      case 'tiktok':
        clientId = TIKTOK_CLIENT_ID;
        clientSecret = TIKTOK_CLIENT_SECRET;
        break;
      default:
        return new Response(JSON.stringify({ error: `Unsupported platform: ${platform}` }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (!clientId || !clientSecret) {
      console.error(`Missing client credentials for ${platform}`);
      return new Response(JSON.stringify({ error: `Missing client credentials for ${platform}` }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Configure token exchange URLs and parameters
    switch (platform) {
      case 'facebook':
        tokenUrl = 'https://graph.facebook.com/v22.0/oauth/access_token';
        params = {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code
        };
        break;
      case 'google':
      case 'google_analytics':
        tokenUrl = 'https://oauth2.googleapis.com/token';
        params = {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code,
          grant_type: 'authorization_code'
        };
        break;
      case 'linkedin':
        tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
        params = {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code,
          grant_type: 'authorization_code'
        };
        break;
      case 'tiktok':
        tokenUrl = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/';
        params = {
          app_id: clientId,
          secret: clientSecret,
          auth_code: code,
          grant_type: 'authorization_code'
        };
        break;
      default:
        return new Response(JSON.stringify({ error: `Unsupported platform: ${platform}` }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Exchange code for token
    let response;
    
    if (platform === 'tiktok') {
      // TikTok has a different API format
      response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
    } else {
      // Standard OAuth2 format for most platforms
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, value as string);
      }
      
      response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token exchange failed: ${response.status}`, errorText);
      return new Response(JSON.stringify({ error: `Token exchange failed: ${errorText}` }), { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log(`Successfully exchanged code for token for ${platform}`);

    // Format response based on platform
    let result = {};
    switch (platform) {
      case 'facebook':
        // Get account details
        const accountResponse = await fetch(`https://graph.facebook.com/v22.0/me/adaccounts?fields=id,name&access_token=${data.access_token}`);
        if (!accountResponse.ok) {
          console.warn("Could not fetch Facebook ad accounts, but proceeding with connection");
        } else {
          const accountData = await accountResponse.json();
          if (accountData.data && accountData.data.length > 0) {
            result = {
              accessToken: data.access_token,
              expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
              accountId: accountData.data[0].id.replace('act_', ''),
              accountName: accountData.data[0].name
            };
            break;
          }
        }
        // Fallback without account info
        result = {
          accessToken: data.access_token,
          expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString()
        };
        break;
      
      case 'google':
      case 'google_analytics':
        result = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString()
        };
        break;
      
      case 'linkedin':
        result = {
          accessToken: data.access_token,
          expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString()
        };
        break;
      
      case 'tiktok':
        const adAccountsResponse = await fetch('https://business-api.tiktok.com/open_api/v1.3/user/info/', {
          headers: {
            'Access-Token': data.data.access_token
          }
        });
        
        if (!adAccountsResponse.ok) {
          console.warn("Could not fetch TikTok account details, but proceeding with connection");
          result = {
            accessToken: data.data.access_token,
            refreshToken: data.data.refresh_token,
            expiresAt: new Date(Date.now() + (data.data.expires_in || 86400) * 1000).toISOString()
          };
        } else {
          const userInfo = await adAccountsResponse.json();
          result = {
            accessToken: data.data.access_token,
            refreshToken: data.data.refresh_token,
            expiresAt: new Date(Date.now() + (data.data.expires_in || 86400) * 1000).toISOString(),
            accountId: userInfo.data.user_id,
            accountName: userInfo.data.display_name || `TikTok Account`
          };
        }
        break;
      
      default:
        result = {
          accessToken: data.access_token,
          expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null
        };
    }

    console.log(`Successfully formatted response for ${platform}`);
    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing OAuth callback:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
