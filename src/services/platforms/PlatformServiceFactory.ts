
import { Platform, PlatformCredentials } from '@/types/platforms';
import { PlatformService } from './PlatformService';
import { FacebookAdsService } from './FacebookAdsService';
import { GoogleAdsService } from './GoogleAdsService';
import { TikTokAdsService } from './TikTokAdsService';
import { LinkedInAdsService } from './LinkedInAdsService';
// Remove PinterestAdsService import
import { GoogleAnalyticsService } from './GoogleAnalyticsService';
import { MixpanelService } from './MixpanelService'; 
import { AmplitudeService } from './AmplitudeService';
import { OpenAIService } from './OpenAIService';

export class PlatformServiceFactory {
  static getService(platform: Platform, credentials?: PlatformCredentials): PlatformService {
    switch (platform) {
      case 'facebook':
        return new FacebookAdsService(credentials);
      case 'google':
        return new GoogleAdsService(credentials);
      case 'tiktok':
        return new TikTokAdsService(credentials);
      case 'linkedin':
        return new LinkedInAdsService(credentials);
      // Remove case for 'pinterest'
      case 'google_analytics':
        return new GoogleAnalyticsService(credentials);
      case 'mixpanel':
        return new MixpanelService(credentials);
      case 'amplitude':
        return new AmplitudeService(credentials);
      case 'openai':
        return new OpenAIService(credentials);
      default:
        throw new Error(`Service for platform ${platform} not implemented yet`);
    }
  }
}
