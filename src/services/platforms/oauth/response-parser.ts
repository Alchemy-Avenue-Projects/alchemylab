
/**
 * Parse OAuth redirect response
 */
export const parseOAuthRedirect = (): { code: string; state: string; error?: string } => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code') || '';
  const state = urlParams.get('state') || '';
  const error = urlParams.get('error') || undefined;
  
  return { code, state, error };
};
