// Environment variable validation
export const validateEnv = () => {
  const requiredVars = [
    'VITE_FACEBOOK_APP_ID',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    // Additional platform client IDs (optional per deployment, but validate for safety)
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_LINKEDIN_CLIENT_ID',
    'VITE_TIKTOK_CLIENT_ID'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    return false;
  }

  console.log('✅ All required environment variables are present');
  return true;
};

// Get environment variables with type safety
export const env = {
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID as string,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    publishableKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  },
} as const; 
