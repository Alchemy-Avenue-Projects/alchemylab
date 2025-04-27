/**
 * src/services/platforms/oauth/url-generator.ts
 *
 * One place that builds the OAuth “Authorize” URL for every platform.
 * – Pulls the currently-signed-in Supabase session itself (so you never have
 *   to thread `jwt` or `userId` through the component tree manually).
 * – Puts *both* `userId` (UUID) and `jwt` (access token) in the `state`
 *   payload so the edge-function can verify the callback.
 */

import { supabase }        from "@/integrations/supabase/client";
import { Platform }        from "@/types/platforms";
import { OAUTH_CONFIG, getRedirectUri } from "./config";
import { env }             from "@/utils/env";

// ────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────
const makeState = (userId: string, jwt: string) =>
  btoa(
    JSON.stringify({
      userId,
      jwt,
      timestamp: Date.now(),
      nonce: crypto.randomUUID?.() ?? Math.random().toString(36),
    }),
  );

// ────────────────────────────────────────────────────────────
// main
// ────────────────────────────────────────────────────────────
export const generateOAuthUrl = async (platform: Platform): Promise<string> => {
  // 1️⃣  Get the current Supabase session
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();

  if (sessionErr || !session || !session.user || !session.access_token) {
    throw new Error("Not signed in – session missing or invalid");
  }

  const userId = session.user.id;
  const jwt    = session.access_token;
  const state  = makeState(userId, jwt);
  const redirectUri = getRedirectUri(platform);

  switch (platform) {
    // ──────────────  FACEBOOK  ──────────────
    case "facebook": {
      if (!env.facebook.appId) {
        throw new Error("FACEBOOK_APP_ID is not configured");
      }

      const facebookUrl = [
        "https://www.facebook.com/v22.0/dialog/oauth?",
        `client_id=${env.facebook.appId}`,
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        "scope=ads_read,ads_management,business_management",
        "response_type=code",
        `state=${encodeURIComponent(state)}`,
      ].join("&");

      console.log("[generateOAuthUrl] Facebook →", facebookUrl);
      return facebookUrl;
    }

    // ──────────────  GOOGLE ADS  ──────────────
    case "google":
      return [
        "https://accounts.google.com/o/oauth2/v2/auth?",
        `client_id=${OAUTH_CONFIG.GOOGLE_CLIENT_ID}`,
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        "response_type=code",
        "scope=https://www.googleapis.com/auth/adwords",
        `state=${encodeURIComponent(state)}`,
        "access_type=offline",
        "prompt=consent",
      ].join("&");

    // ──────────────  LINKEDIN  ──────────────
    case "linkedin":
      return [
        "https://www.linkedin.com/oauth/v2/authorization?",
        "response_type=code",
        `client_id=${OAUTH_CONFIG.LINKEDIN_CLIENT_ID}`,
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        `state=${encodeURIComponent(state)}`,
        "scope=r_ads,r_ads_reporting",
      ].join("&");

    // ──────────────  TIKTOK  ──────────────
    case "tiktok":
      return [
        "https://ads.tiktok.com/marketing_api/auth?",
        `app_id=${OAUTH_CONFIG.TIKTOK_CLIENT_ID}`,
        `state=${encodeURIComponent(state)}`,
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        "response_type=code",
      ].join("&");

    // ──────────────  GA4  ──────────────
    case "google_analytics":
      return [
        "https://accounts.google.com/o/oauth2/v2/auth?",
        `client_id=${OAUTH_CONFIG.GOOGLE_CLIENT_ID}`,
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        "response_type=code",
        "scope=https://www.googleapis.com/auth/analytics.readonly",
        `state=${encodeURIComponent(state)}`,
        "access_type=offline",
        "prompt=consent",
      ].join("&");

    // ──────────────  API-Key platforms – no OAuth  ──────────────
    case "mixpanel":
    case "amplitude":
    case "openai":
      return "";

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};
