
import { Platform } from '@/types/platforms';
import { OAUTH_CONFIG, getRedirectUri } from './config';

/**
 * Generate OAuth URL for various platforms
 */
export const generateOAuthUrl = (platform: Platform): string => {
  const redirectUri = getRedirectUri(platform);
  
  // For debugging
  console.log(`Generated ${platform} redirect URI: ${redirectUri}`);
  
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${OAUTH_CONFIG.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${platform}&scope=ads_management,ads_read,pages_show_list&response_type=code`;
    
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
