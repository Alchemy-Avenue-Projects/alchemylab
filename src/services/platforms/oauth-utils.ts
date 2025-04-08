
import { Platform } from '@/types/platforms';

/**
 * Generate OAuth URL for various platforms
 */
export const generateOAuthUrl = (platform: Platform): string => {
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&state=${platform}&scope=ads_management,ads_read`;
    
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/adwords&state=${platform}&access_type=offline&prompt=consent`;
    
    case 'linkedin':
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&state=${platform}&scope=r_ads,r_ads_reporting`;
    
    case 'tiktok':
      return `https://ads.tiktok.com/marketing_api/auth?app_id=${process.env.TIKTOK_CLIENT_ID}&state=${platform}&redirect_uri=${redirectUri}&response_type=code`;
    
    case 'pinterest':
      return `https://www.pinterest.com/oauth/?client_id=${process.env.PINTEREST_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=ads:read,ads:write&state=${platform}`;
    
    case 'google_analytics':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&state=${platform}&access_type=offline&prompt=consent`;
    
    case 'mixpanel':
      return `https://mixpanel.com/oauth2/authorize?client_id=${process.env.MIXPANEL_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&state=${platform}`;
    
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
