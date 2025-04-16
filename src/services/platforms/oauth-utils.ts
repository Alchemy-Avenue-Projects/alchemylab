
import { Platform } from '@/types/platforms';

// Define our app configuration values directly since we can't use process.env in the browser
const CONFIG = {
  FACEBOOK_CLIENT_ID: '9352206568161021',
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID',
  LINKEDIN_CLIENT_ID: 'YOUR_LINKEDIN_CLIENT_ID',
  TIKTOK_CLIENT_ID: 'YOUR_TIKTOK_APP_ID'
};

/**
 * Generate OAuth URL for various platforms
 */
export const generateOAuthUrl = (platform: Platform): string => {
  // Get the current origin, ensuring it's using https if not localhost
  const origin = window.location.origin;
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
  
  // Default redirect URI for most platforms
  let redirectUri = `${origin}/oauth/callback`;
  
  // For Facebook, the redirect URI must match what's registered in the Facebook Developer Console
  if (platform === 'facebook') {
    // Facebook redirect should go to the api/auth/callback/facebook endpoint
    redirectUri = `${origin}/api/auth/callback/facebook`;
    console.log(`Generated Facebook redirect URI: ${redirectUri}`);
  }
  
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${CONFIG.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${platform}&scope=ads_management,ads_read,pages_show_list&response_type=code`;
    
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CONFIG.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/adwords&state=${platform}&access_type=offline&prompt=consent`;
    
    case 'linkedin':
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CONFIG.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${platform}&scope=r_ads,r_ads_reporting`;
    
    case 'tiktok':
      return `https://ads.tiktok.com/marketing_api/auth?app_id=${CONFIG.TIKTOK_CLIENT_ID}&state=${platform}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    
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
