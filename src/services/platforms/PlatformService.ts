
import { Platform, PlatformCredentials } from '@/types/platforms';
import { supabase } from '@/integrations/supabase/client';

export abstract class PlatformService {
  protected platform: Platform;
  protected credentials?: PlatformCredentials;
  
  constructor(platform: Platform, credentials?: PlatformCredentials) {
    this.platform = platform;
    this.credentials = credentials;
  }
  
  async getAccounts(): Promise<any[]> {
    console.log(`Base getAccounts method called for ${this.platform}`);
    return [];
  }
  
  async getCampaigns(accountId: string): Promise<any[]> {
    console.log(`Base getCampaigns method called for ${this.platform} with account ${accountId}`);
    return [];
  }
  
  async getAnalytics(accountId: string, campaignId?: string): Promise<any> {
    console.log(`Base getAnalytics method called for ${this.platform} with account ${accountId}`);
    return {};
  }
  
  protected async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.credentials) return false;
    
    const now = new Date();
    if (this.credentials.expiresAt && this.credentials.expiresAt > now) {
      return true; // Token is still valid
    }
    
    if (!this.credentials.refreshToken) {
      return false; // Can't refresh without refresh token
    }
    
    try {
      const result = await supabase.functions.invoke('refresh-token', {
        body: {
          platform: this.platform,
          refreshToken: this.credentials.refreshToken
        }
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      this.credentials = {
        ...this.credentials,
        accessToken: result.data.accessToken,
        expiresAt: new Date(result.data.expiresAt)
      };
      
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }
}
