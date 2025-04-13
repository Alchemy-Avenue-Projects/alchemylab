export type MarketingPlatform = 
  | 'facebook'
  | 'google'
  | 'linkedin'
  | 'tiktok';

export type AnalyticsPlatform = 
  | 'google_analytics'
  | 'mixpanel'
  | 'amplitude';

export type AIPlatform = 
  | 'openai';

export type Platform = MarketingPlatform | AnalyticsPlatform | AIPlatform;

// Define a type for our database platform_connections table
export interface PlatformConnection {
  id: string;
  platform: string;
  organization_id: string;
  auth_token?: string;
  refresh_token?: string;
  token_expiry?: string;
  account_name?: string;
  account_id?: string;
  connected: boolean;
  connected_by?: string;
  created_at: string;
  updated_at: string;
  error?: string;
  name?: string; // For UI purposes
}

export interface PlatformAuthConfig {
  platform: Platform;
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret?: string;
  scopes: string[];
  redirectUri: string;
}

export interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  accountId?: string;
}
