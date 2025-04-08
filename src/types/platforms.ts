
export type MarketingPlatform = 
  | 'facebook'
  | 'google'
  | 'linkedin'
  | 'tiktok'
  | 'pinterest';

export type AnalyticsPlatform = 
  | 'google_analytics'
  | 'mixpanel'
  | 'amplitude';

export type AIPlatform = 
  | 'openai';

export type Platform = MarketingPlatform | AnalyticsPlatform | AIPlatform;

export interface PlatformConnection {
  id: string;
  platform: Platform;
  name: string;
  connected: boolean;
  accountName?: string;
  accountId?: string;
  authToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  lastSync?: Date;
  error?: string;
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
