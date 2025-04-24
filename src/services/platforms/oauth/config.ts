import { env } from '@/utils/env';

// Define our app configuration values using environment variables
export const OAUTH_CONFIG = {
  FACEBOOK_CLIENT_ID: env.facebook.appId,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  LINKEDIN_CLIENT_ID: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
  TIKTOK_CLIENT_ID: import.meta.env.VITE_TIKTOK_CLIENT_ID || ''
};

// Get the current origin, ensuring it's using https if not localhost
export const getOrigin = (): string => {
  const origin = window.location.origin;
  
  // Ensure we're using HTTPS for production by checking if we're not on localhost
  if (!origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.startsWith('https://')) {
    return origin.replace('http://', 'https://');
  }
  
  return origin;
};

// Get the appropriate redirect URI based on platform
export const getRedirectUri = (platform: string): string => {
  // For Facebook, the redirect URI must match exactly what's registered in the Facebook Developer Console
  if (platform === 'facebook') {
    // Make sure this matches exactly what's registered in Facebook Developer Console
    return 'https://api.alchemylab.app/facebook-oauth-callback';
  }
  
  // Default redirect URI for most platforms uses the dynamic origin
  const origin = getOrigin();
  return `${origin}/oauth/callback`;
};
