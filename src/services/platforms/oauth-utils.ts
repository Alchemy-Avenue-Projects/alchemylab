
// This file is deprecated and will be removed.
// Please import from the new oauth directory instead.
// Example: import { generateOAuthUrl, parseOAuthRedirect } from '@/services/platforms/oauth';

import { Platform } from '@/types/platforms';
import { generateOAuthUrl as newGenerateOAuthUrl } from './oauth/url-generator';
import { parseOAuthRedirect as newParseOAuthRedirect } from './oauth/response-parser';

// Re-export the functions to maintain backward compatibility
// Make this an async function to match the return type of newGenerateOAuthUrl
export const generateOAuthUrl = async (platform: Platform): Promise<string> => {
  return newGenerateOAuthUrl(platform);
};

export const parseOAuthRedirect = (): { code: string; state: string; error?: string } => {
  return newParseOAuthRedirect();
};
