// Supabase Edge Function – ga4-oauth-callback
// Google Analytics 4 OAuth callback (uses same Google OAuth but different scope)
//--------------------------------------------------
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// ─── ENV ──────────────────────────────────────────
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  GA4_REDIRECT_URI,
} = Deno.env.toObject();

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing env vars");
}

const REDIRECT_URI = GA4_REDIRECT_URI || "https://api.alchemylab.app/ga4-oauth-callback";

// ─── CORS ──────────────────────────────────────────
const ALLOWED_ORIGINS = (
  Deno.env.get("ALLOWED_ORIGINS") ||
  "https://alchemylab.app,https://www.alchemylab.app,http://localhost:5173,http://127.0.0.1:5173"
).split(",").map((o) => o.trim());

const getCors = (origin?: string) => {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  } as Record<string, string>;
};

const json = (body: unknown, status = 200, origin?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCors(origin), "Content-Type": "application/json" },
  });

const decodeState = (raw: string) => {
  try {
    return JSON.parse(atob(decodeURIComponent(raw)));
  } catch {
    return null;
  }
};

// Exchange authorization code for tokens
const exchangeCode = async (code: string) => {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresIn: data.expires_in as number,
  };
};

// ─── Main Handler ─────────────────────────────────
async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("Origin") || undefined;

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCors(origin) });
  }

  try {
    let code: string;
    let rawSt: string;
    let error: string;

    if (req.method === "GET") {
      const url = new URL(req.url);
      code = url.searchParams.get("code") ?? "";
      rawSt = url.searchParams.get("state") ?? "";
      error = url.searchParams.get("error") ?? "";
    } else {
      const body = await req.json();
      code = body.code ?? "";
      rawSt = body.state ?? "";
      error = body.error ?? "";
    }

    if (error) return json({ error }, 400, origin);
    if (!code) return json({ error: "Missing authorization code" }, 400, origin);

    const st = decodeState(rawSt);
    if (!st || !st.jwt || !st.userId) {
      return json({ error: "No user session available" }, 401, origin);
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authErr } = await sb.auth.getUser(st.jwt);
    if (authErr || !user || user.id !== st.userId) {
      return json({ error: "Invalid user session" }, 401, origin);
    }

    // Verify nonce
    if (st.nonce) {
      const { data: nonceRecord, error: nonceErr } = await sb
        .from("oauth_nonces")
        .select("*")
        .eq("nonce", st.nonce)
        .eq("user_id", user.id)
        .eq("platform", "google_analytics")
        .single();

      if (nonceErr || !nonceRecord) {
        return json({ error: "Invalid or expired OAuth state" }, 401, origin);
      }

      if (new Date(nonceRecord.expires_at) < new Date()) {
        return json({ error: "OAuth state has expired" }, 401, origin);
      }

      await sb.from("oauth_nonces").delete().eq("nonce", st.nonce);
    }

    const { data: profile, error: pErr } = await sb
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (pErr || !profile?.organization_id) {
      return json({ error: "User is not linked to any organization" }, 409, origin);
    }

    const orgId = profile.organization_id as string;

    // Exchange code for tokens
    const tokens = await exchangeCode(code);

    // Encrypt token
    const base64Key = Deno.env.get("ENCRYPTION_KEY");
    if (!base64Key) {
      return json({ error: "Server configuration error: encryption not configured" }, 500, origin);
    }

    let storedToken = tokens.accessToken;
    {
      const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
      const key = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt"]);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(tokens.accessToken);
      const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
      const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(cipherBuf), iv.length);
      storedToken = btoa(String.fromCharCode(...combined));
    }

    // Store encrypted refresh token if available
    let storedRefreshToken: string | null = null;
    if (tokens.refreshToken) {
      const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
      const key = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt"]);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(tokens.refreshToken);
      const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
      const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(cipherBuf), iv.length);
      storedRefreshToken = btoa(String.fromCharCode(...combined));
    }

    // Upsert connection (google_analytics is an analytics platform, not ad platform)
    const { data: platformConnection, error: dbErr } = await sb
      .from("platform_connections")
      .upsert(
        {
          platform: "google_analytics",
          organization_id: orgId,
          auth_token: storedToken,
          refresh_token: storedRefreshToken,
          token_expiry: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
          connected_by: user.id,
          connected: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id,platform" }
      )
      .select()
      .single();

    if (dbErr) throw dbErr;

    return json({
      success: true,
      message: "Google Analytics connection established successfully",
      platformConnectionId: platformConnection?.id,
    }, 200, origin);
  } catch (e) {
    console.error("[ga4-oauth-callback] Error:", e);
    return json({ error: (e as Error).message ?? "Internal error" }, 500, origin);
  }
}

serve(handler);
