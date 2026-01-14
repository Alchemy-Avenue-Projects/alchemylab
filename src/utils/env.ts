/**
 * Environment variable validation and access
 */

// Required environment variables - app won't work without these
const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

// Optional environment variables - used for specific features
const OPTIONAL_VARS = [
  'VITE_FACEBOOK_APP_ID',
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_LINKEDIN_CLIENT_ID',
  'VITE_TIKTOK_CLIENT_ID',
] as const;

/**
 * Validates that all required environment variables are present
 * @returns true if all required vars are present, false otherwise
 */
export const validateEnv = (): boolean => {
  const missingRequired = REQUIRED_VARS.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables:', missingRequired);
    return false;
  }

  // Check optional vars and warn about missing ones
  const missingOptional = OPTIONAL_VARS.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingOptional.length > 0) {
    console.warn('⚠️ Missing optional environment variables:', missingOptional);
    console.warn('Some features may not work correctly.');
  }

  console.log('✅ All required environment variables are present');
  return true;
};

// Get environment variables with type safety
export const env = {
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined,
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined,
  },
  linkedin: {
    clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID as string | undefined,
  },
  tiktok: {
    clientId: import.meta.env.VITE_TIKTOK_CLIENT_ID as string | undefined,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    publishableKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  },
} as const;
