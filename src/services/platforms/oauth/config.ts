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

// Extract project ref from Supabase URL
// URL format: https://<project-ref>.supabase.co
const getSupabaseProjectRef = (): string | null => {
  const supabaseUrl = env.supabase.url;
  if (!supabaseUrl) return null;
  
  try {
    const url = new URL(supabaseUrl);
    // Extract project ref from hostname (e.g., "abc123.supabase.co" -> "abc123")
    const hostnameParts = url.hostname.split('.');
    if (hostnameParts.length >= 2 && hostnameParts[1] === 'supabase') {
      return hostnameParts[0];
    }
  } catch (error) {
    console.error('Error parsing Supabase URL:', error);
  }
  
  return null;
};

// Get the appropriate redirect URI based on platform
export const getRedirectUri = (platform: string): string => {
  // For Facebook, use Supabase edge function URL instead of VPS
  if (platform === 'facebook') {
    const projectRef = getSupabaseProjectRef();
    if (projectRef) {
      return `https://${projectRef}.supabase.co/functions/v1/facebook-oauth-callback`;
    }
    // Fallback to VPS if project ref cannot be determined
    console.warn('Could not determine Supabase project ref, falling back to VPS URL');
    return 'https://api.alchemylab.app/facebook-oauth-callback';
  }
  
  // Default redirect URI for most platforms uses the dynamic origin
  const origin = getOrigin();
  return `${origin}/oauth/callback`;
};
