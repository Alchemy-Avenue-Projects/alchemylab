
import { PlatformService } from './PlatformService';
import { PlatformCredentials } from '@/types/platforms';

export class FacebookAdsService extends PlatformService {
  constructor(credentials?: PlatformCredentials) {
    super('facebook', credentials);
  }
  
  async getAccounts(): Promise<any[]> {
    if (!await this.refreshTokenIfNeeded() || !this.credentials) {
      throw new Error('Invalid or expired credentials');
    }
    
    try {
      const response = await fetch(
        'https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status',
        {
          headers: {
            Authorization: `Bearer ${this.credentials.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Facebook ad accounts:', error);
      throw error;
    }
  }
  
  async getCampaigns(accountId: string): Promise<any[]> {
    if (!await this.refreshTokenIfNeeded() || !this.credentials) {
      throw new Error('Invalid or expired credentials');
    }
    
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/act_${accountId}/campaigns?fields=name,objective,status,spend,lifetime_budget`,
        {
          headers: {
            Authorization: `Bearer ${this.credentials.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Facebook campaigns:', error);
      throw error;
    }
  }
  
  async getAnalytics(accountId: string, campaignId?: string): Promise<any> {
    if (!await this.refreshTokenIfNeeded() || !this.credentials) {
      throw new Error('Invalid or expired credentials');
    }
    
    try {
      const endpoint = campaignId 
        ? `https://graph.facebook.com/v18.0/${campaignId}/insights?fields=impressions,clicks,ctr,spend,actions`
        : `https://graph.facebook.com/v18.0/act_${accountId}/insights?fields=impressions,clicks,ctr,spend,actions`;
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${this.credentials.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Facebook analytics:', error);
      throw error;
    }
  }
}
