
import { PlatformService } from './PlatformService';
import { PlatformCredentials } from '@/types/platforms';

export class OpenAIService extends PlatformService {
  constructor(credentials?: PlatformCredentials) {
    super('openai', credentials);
  }
  
  // Implement OpenAI-specific methods here
}
