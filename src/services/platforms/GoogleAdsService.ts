
import { PlatformService } from './PlatformService';
import { PlatformCredentials } from '@/types/platforms';

export class GoogleAdsService extends PlatformService {
  constructor(credentials?: PlatformCredentials) {
    super('google', credentials);
  }
  
  async getAccounts(): Promise<any[]> {
    if (!await this.refreshTokenIfNeeded() || !this.credentials) {
      throw new Error('Invalid or expired credentials');
    }
    
    // Google Ads API requires using an edge function since it needs a server-side implementation
    try {
      const result = await fetch('/api/google-ads/accounts', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      });
      
      if (!result.ok) {
        throw new Error(`Google Ads API error: ${result.status}`);
      }
      
      const data = await result.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching Google Ads accounts:', error);
      throw error;
    }
  }
  
  async getCampaigns(accountId: string): Promise<any[]> {
    if (!await this.refreshTokenIfNeeded() || !this.credentials) {
      throw new Error('Invalid or expired credentials');
    }
    
    try {
      const result = await fetch(`/api/google-ads/campaigns?accountId=${accountId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      });
      
      if (!result.ok) {
        throw new Error(`Google Ads API error: ${result.status}`);
      }
      
      const data = await result.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching Google Ads campaigns:', error);
      throw error;
    }
  }
  
  async getAnalytics(accountId: string, campaignId?: string): Promise<any> {
    if (!await this.refreshTokenIfNeeded() || !this.credentials) {
      throw new Error('Invalid or expired credentials');
    }
    
    try {
      const endpoint = campaignId
        ? `/api/google-ads/analytics?accountId=${accountId}&campaignId=${campaignId}`
        : `/api/google-ads/analytics?accountId=${accountId}`;
      
      const result = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      });
      
      if (!result.ok) {
        throw new Error(`Google Ads API error: ${result.status}`);
      }
      
      const data = await result.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching Google Ads analytics:', error);
      throw error;
    }
  }
}
