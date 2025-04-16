
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
  return origin;
};

// Get the appropriate redirect URI based on platform
export const getRedirectUri = (platform: string): string => {
  const origin = getOrigin();
  
  // For Facebook, the redirect URI must match what's registered in the Facebook Developer Console
  if (platform === 'facebook') {
    // Facebook redirect should go to the api/auth/callback/facebook endpoint
    return `${origin}/api/auth/callback/facebook`;
  }
  
  // Default redirect URI for most platforms
  return `${origin}/oauth/callback`;
};
