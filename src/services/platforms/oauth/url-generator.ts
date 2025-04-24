import { Platform } from '@/types/platforms';
import { OAUTH_CONFIG, getRedirectUri } from './config';
import { env } from '@/utils/env';

/**
 * Generate OAuth URL for various platforms
 */
export const generateOAuthUrl = async (platform: Platform, jwt: string): Promise<string> => {
  console.log(`[generateOAuthUrl] Generating URL for ${platform}`);
  
  const redirectUri = getRedirectUri(platform);
  console.log(`[generateOAuthUrl] Redirect URI: ${redirectUri}`);
  
  switch (platform) {
    case "facebook": {
      try {
        console.log(`[generateOAuthUrl] Using Facebook App ID: ${env.facebook.appId}`);
        
        if (!env.facebook.appId) {
          throw new Error("Facebook App ID is not configured");
        }

        const state = encodeURIComponent(JSON.stringify({ 
          jwt,
          timestamp: Date.now(),
          nonce: Math.random().toString(36).substring(2)
        }));

        const oauthURL = [
          'https://www.facebook.com/v22.0/dialog/oauth?',
          `client_id=${env.facebook.appId}`,
          `redirect_uri=${encodeURIComponent(redirectUri)}`,
          'scope=ads_read,ads_management,business_management',
          'response_type=code',
          `state=${state}`
        ].join('&');

        console.log("[generateOAuthUrl] Final Facebook OAuth URL:", oauthURL);
    
        if (!oauthURL || !oauthURL.includes('facebook.com')) {
          throw new Error("Generated Facebook URL is invalid");
        }

        return oauthURL;
      } catch (err) {
        console.error("[generateOAuthUrl] Error generating Facebook URL:", err);
        throw err;
      }
    }
    // Handle other platforms...

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
