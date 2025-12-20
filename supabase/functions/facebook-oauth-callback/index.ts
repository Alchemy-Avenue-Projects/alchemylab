// Supabase Edge Function – facebook-oauth-callback
//--------------------------------------------------
import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// ─── ENV ──────────────────────────────────────────
const {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  FACEBOOK_REDIRECT_URI,
} = Deno.env.toObject();

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing env vars");
}

const REDIRECT_URI =
  FACEBOOK_REDIRECT_URI || "https://api.alchemylab.app/facebook-oauth-callback";

// ─── helpers ──────────────────────────────────────
// CORS allowlist (comma-separated) configurable via env; defaults to production and localhost
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "https://alchemylab.app,https://www.alchemylab.app,http://localhost:5173,http://127.0.0.1:5173").split(",").map(o => o.trim());

const getCors = (origin?: string) => {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin":  allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  } as Record<string, string>;
};
const json = (b: unknown, s = 200, origin?: string) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...getCors(origin), "Content-Type": "application/json" } });

const decodeState = (raw: string) => {
  try { return JSON.parse(atob(decodeURIComponent(raw))); }
  catch { return null; }
};

const exchangeCode = async (code: string) => {
  const u = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  u.searchParams.append("client_id",     FACEBOOK_APP_ID);
  u.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
  u.searchParams.append("redirect_uri",  REDIRECT_URI);
  u.searchParams.append("code",          code);

  const r = await fetch(u.toString());
  if (!r.ok) throw new Error(`FB token exchange failed: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return { accessToken: j.access_token as string, expiresIn: j.expires_in as number };
};

// ─── main ─────────────────────────────────────────
async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: getCors(req.headers.get('Origin') || undefined) });

  try {
    const url   = new URL(req.url);
    const code  = url.searchParams.get("code")   ?? "";
    const rawSt = url.searchParams.get("state")  ?? "";
    const error = url.searchParams.get("error")  ?? "";

    if (error) return json({ error }, 400, req.headers.get('Origin') || undefined);
    if (!code) return json({ error: "Missing authorization code" }, 400, req.headers.get('Origin') || undefined);

    // 1) state → { userId , jwt , ... }
    const st = decodeState(rawSt);
    if (!st || !st.jwt || !st.userId)
      return json({ error: "No user session available" }, 401, req.headers.get('Origin') || undefined);

    // 2) verify Supabase session
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authErr } = await sb.auth.getUser(st.jwt);
    if (authErr || !user || user.id !== st.userId)
      return json({ error: "Invalid user session" }, 401, req.headers.get('Origin') || undefined);

    // 3) fetch the organization_id that belongs to this user
    const { data: profile, error: pErr } = await sb
      .from("profiles")                    // ← change if your table is named differently
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (pErr || !profile?.organization_id)
      return json({ error: "User is not linked to any organization" }, 409, req.headers.get('Origin') || undefined);

    const orgId = profile.organization_id as string;

    // 4) Facebook code → token
    const fb = await exchangeCode(code);

    // 5) upsert connection
    // Encrypt token at rest if ENCRYPTION_KEY is configured
    const base64Key = Deno.env.get('ENCRYPTION_KEY') || '';
    let storedToken = fb.accessToken;
    if (base64Key) {
      const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
      const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt']);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(fb.accessToken);
      const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
      const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(cipherBuf), iv.length);
      storedToken = btoa(String.fromCharCode(...combined));
    }

    const { error: dbErr } = await sb.from("platform_connections").upsert(
      {
        platform:        "facebook",
        organization_id: orgId,             // ✅ FK now points to a real organization
        auth_token:      storedToken,
        token_expiry:    new Date(Date.now() + fb.expiresIn * 1000).toISOString(),
        connected_by:    user.id,
        connected:       true,
        updated_at:      new Date().toISOString(),
      },
      { onConflict: "organization_id,platform" },
    );
    if (dbErr) throw dbErr;

    // 6) redirect back to UI
    // Get frontend URL from environment or use first allowed origin
    const frontendUrl = Deno.env.get("FRONTEND_URL") || ALLOWED_ORIGINS[0];
    const redirectUrl = `${frontendUrl}/app/settings?success=facebook_connected`;
    
    const origin = req.headers.get('Origin') || undefined;
    const corsHeaders = getCors(origin);
    
    return new Response(null, {
      status: 302,
      headers: { 
        ...corsHeaders, 
        Location: redirectUrl 
      },
    });

  } catch (e) {
    return json({ error: (e as Error).message ?? "Internal error" }, 500, req.headers.get('Origin') || undefined);
  }
}

serve(handler);
