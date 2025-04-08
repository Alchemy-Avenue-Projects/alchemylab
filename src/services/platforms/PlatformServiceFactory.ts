
import { Platform, PlatformCredentials } from '@/types/platforms';
import { PlatformService } from './PlatformService';
import { FacebookAdsService } from './FacebookAdsService';
import { GoogleAdsService } from './GoogleAdsService';

export class PlatformServiceFactory {
  static getService(platform: Platform, credentials?: PlatformCredentials): PlatformService {
    switch (platform) {
      case 'facebook':
        return new FacebookAdsService(credentials);
      case 'google':
        return new GoogleAdsService(credentials);
      // Implement other platforms similarly
      default:
        throw new Error(`Service for platform ${platform} not implemented yet`);
    }
  }
}
