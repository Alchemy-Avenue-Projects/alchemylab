  import { Platform } from '@/types/platforms';
import { OAUTH_CONFIG, getRedirectUri } from './config';
const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const FN_BASE   = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate OAuth URL for various platforms
 */
export const generateOAuthUrl = async (platform: Platform): Promise<string> => {
  const redirectUri = getRedirectUri(platform);
  
  // For debugging
  console.log(`Generated ${platform} redirect URI: ${redirectUri}`);
  
  switch (platform) {
    case "facebook": {
      console.log("[generateOAuthUrl] Entering Facebook flow");

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        console.log("[generateOAuthUrl] Session fetch result:", data);

        if (sessionError) {
          console.error("❌ Supabase session error:", sessionError);
          throw new Error("Authentication required. Please sign in again.");
        }

        const session = data?.session;

        if (!session || !session.access_token) {
          console.error("❌ No valid session found:", session);
          throw new Error("No active session. Please sign in again.");
        }

        const jwt = session.access_token;
        const state = encodeURIComponent(JSON.stringify({ jwt }));

        const redirectUri = encodeURIComponent(`${FN_BASE}/facebook-oauth-callback`);
        const oauthURL = [
          'https://www.facebook.com/v22.0/dialog/oauth?',
          `client_id=${FB_APP_ID}`,
          `redirect_uri=${redirectUri}`,
          'scope=ads_read,ads_management',
          'response_type=code',
          `state=${state}`
        ].join('&');

        console.log("✅ Facebook OAuth URL generated:", oauthURL);
        return oauthURL;

      } catch (err) {
        console.error("🔥 Unexpected error in Facebook generateOAuthUrl:", err);
        throw err;
      }
    }

    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CONFIG.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/adwords&state=${platform}&access_type=offline&prompt=consent`;
    
    case 'linkedin':
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${OAUTH_CONFIG.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${platform}&scope=r_ads,r_ads_reporting`;
    
    case 'tiktok':
      return `https://ads.tiktok.com/marketing_api/auth?app_id=${OAUTH_CONFIG.TIKTOK_CLIENT_ID}&state=${platform}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    
    case 'google_analytics':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CONFIG.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&state=${platform}&access_type=offline&prompt=consent`;
    
    case 'mixpanel':
    case 'amplitude':
    case 'openai':
      // These platforms use API keys instead of OAuth
      return '';
    
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};
