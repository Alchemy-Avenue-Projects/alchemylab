
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
      try {
        // Force a fresh session check
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Failed to get Supabase session:", error);
          throw new Error("Authentication required. Please sign in again.");
        }

        if (!data.session || !data.session.access_token) {
          console.error("No valid session found");
          throw new Error("No active session. Please sign in again.");
        }
      
        const jwt = data.session.access_token;
        const state = encodeURIComponent(JSON.stringify({ jwt }));

        const url = [
          "https://www.facebook.com/v22.0/dialog/oauth?",
          `client_id=${FB_APP_ID}`,
          `redirect_uri=${encodeURIComponent(`${FN_BASE}/facebook-oauth-callback`)}`,
          "scope=ads_read,ads_management",
          "response_type=code",
          `state=${state}`
        ].join("&");

        console.log("Final Facebook OAuth URL:", url);
        
        // This is the key fix: make sure we return a valid URL
        if (!url || !url.includes('facebook.com')) {
          throw new Error("Generated Facebook URL is invalid");
        }
        
        return url;
      } catch (err) {
        console.error("Unexpected error in generateOAuthUrl for Facebook:", err);
        throw err; // Re-throw to allow proper error handling
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
