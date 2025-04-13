
import { Platform } from '@/types/platforms';

// Define our app configuration values directly since we can't use process.env in the browser
const CONFIG = {
  FACEBOOK_CLIENT_ID: '9352206568161021',
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID',
  LINKEDIN_CLIENT_ID: 'YOUR_LINKEDIN_CLIENT_ID',
  TIKTOK_CLIENT_ID: 'YOUR_TIKTOK_APP_ID',
  PINTEREST_CLIENT_ID: 'YOUR_PINTEREST_CLIENT_ID'
};

/**
 * Generate OAuth URL for various platforms
 */
export const generateOAuthUrl = (platform: Platform): string => {
  // Use a central redirect URI to handle all OAuth callbacks
  const redirectUri = `${window.location.origin}/oauth/callback`;
  
  // For Facebook, we'll use a direct callback to our API route
  const facebookRedirectUri = `${window.location.origin}/api/auth/callback/facebook`;
  
  switch (platform) {
    case 'facebook':
      // Direct Facebook OAuth flow using our custom API route - updated to v22.0
      return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${CONFIG.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(facebookRedirectUri)}&state=${platform}&scope=ads_management,ads_read`;
    
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CONFIG.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/adwords&state=${platform}&access_type=offline&prompt=consent`;
    
    case 'linkedin':
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CONFIG.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${platform}&scope=r_ads,r_ads_reporting`;
    
    case 'tiktok':
      return `https://ads.tiktok.com/marketing_api/auth?app_id=${CONFIG.TIKTOK_CLIENT_ID}&state=${platform}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    
    case 'pinterest':
      return `https://www.pinterest.com/oauth/?client_id=${CONFIG.PINTEREST_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=ads:read,ads:write&state=${platform}`;
    
    case 'google_analytics':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CONFIG.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&state=${platform}&access_type=offline&prompt=consent`;
    
    case 'mixpanel':
      // For now, we'll just return an empty string as this would need a real client ID
      return '';
    
    case 'amplitude':
      // Amplitude uses API keys instead of OAuth
      return '';
    
    case 'openai':
      // OpenAI uses API keys instead of OAuth
      return '';
    
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

/**
 * Parse OAuth redirect response
 */
export const parseOAuthRedirect = (): { code: string; state: string; error?: string } => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code') || '';
  const state = urlParams.get('state') || '';
  const error = urlParams.get('error') || undefined;
  
  return { code, state, error };
};
