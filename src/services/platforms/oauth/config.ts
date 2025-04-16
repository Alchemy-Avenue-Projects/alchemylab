
// Define our app configuration values directly since we can't use process.env in the browser
export const OAUTH_CONFIG = {
  FACEBOOK_CLIENT_ID: '9352206568161021',
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID',
  LINKEDIN_CLIENT_ID: 'YOUR_LINKEDIN_CLIENT_ID',
  TIKTOK_CLIENT_ID: 'YOUR_TIKTOK_APP_ID'
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
    // Facebook redirect should go to the api/auth/callback/facebook endpoint
    return `https://alchemylab.app/api/auth/callback/facebook`;
  }
  
  // Default redirect URI for most platforms uses the dynamic origin
  const origin = getOrigin();
  return `${origin}/oauth/callback`;
};
