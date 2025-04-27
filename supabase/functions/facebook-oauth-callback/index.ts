// facebook-oauth-callback  – Supabase Edge Function
//───────────────────────────────────────────────────
import { serve }          from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient }   from "https://esm.sh/@supabase/supabase-js@2.43.0";

// ───── ENV ─────────────────────────────────────────
const {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  FACEBOOK_REDIRECT_URI,
} = Deno.env.toObject();

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing environment vars (FACEBOOK_APP_ID, …)");
}

const REDIRECT_URI = FACEBOOK_REDIRECT_URI
  ?? "https://api.alchemylab.app/facebook-oauth-callback";

// ───── Helpers ─────────────────────────────────────
const cors = {
  "Access-Control-Allow-Origin":  "https://alchemylab.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const log = {
  info : (m: string, d?: unknown) => console.log (`INFO : ${m}`, d ?? ""),
  warn : (m: string, d?: unknown) => console.warn (`WARN : ${m}`, d ?? ""),
  error: (m: string, d?: unknown) => console.error(`ERROR: ${m}`, d ?? ""),
};

// FB code → long-lived token
async function fbExchange(code: string) {
  const u = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  u.searchParams.append("client_id",     FACEBOOK_APP_ID);
  u.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
  u.searchParams.append("redirect_uri",  REDIRECT_URI);
  u.searchParams.append("code",          code);

  const r = await fetch(u.toString());
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`FB token exchange failed: ${r.status} – ${t}`);
  }
  return await r.json() as { access_token: string; expires_in: number };
}

// decode `state=` the same way it was created on the client
function decodeState(raw: string) {
  try {
    const urlDecoded = decodeURIComponent(raw);
    const jsonStr    = atob(urlDecoded);           // ← base-64 → json
    return JSON.parse(jsonStr) as {
      userId?: string;
      jwt?: string;          // new field
      accessToken?: string;  // old field (fallback)
      timestamp?: number;
      nonce?: string;
    };
  } catch (_e) {
    return {};
  }
}

// ───── Main handler ───────────────────────────────
async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const url    = new URL(req.url);
    const code   = url.searchParams.get("code")  ?? "";
    const state  = url.searchParams.get("state") ?? "";
    const errStr = url.searchParams.get("error");

    log.info("OAuth callback", { code: code.slice(0, 6) + "...", errStr });

    if (errStr)          return json({ error: errStr }, 400);
    if (!code)           return json({ error: "Missing authorisation code" }, 400);

    /* ── 1️⃣  Recover Supabase JWT from state ───────────────────────── */
    const st  = decodeState(state);
    const jwt = st.jwt || st.accessToken || "";

    if (!jwt)            return json({ error: "No user session available" }, 401);
    if (!st.timestamp || Date.now() - st.timestamp > 5 * 60_000)
      return json({ error: "State parameter expired" }, 400);

    /* ── 2️⃣  Verify user session in Supabase ───────────────────────── */
    const sb = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user }, error: authErr } = await sb.auth.getUser(jwt);

    if (authErr || !user || (st.userId && st.userId !== user.id)) {
      log.warn("Invalid or mismatched Supabase session", authErr);
      return json({ error: "Invalid user session" }, 401);
    }

    /* ── 3️⃣  Exchange FB code → access-token ──────────────────────── */
    const fb = await fbExchange(code);
    log.info("FB token obtained", { expires_in: fb.expires_in });

    /* ── 4️⃣  Upsert connection in DB ──────────────────────────────── */
    const { error: dbErr } = await sb.from("platform_connections").upsert({
      platform        : "facebook",
      organization_id : user.id,                     // ⇦ adapt if you have org table
      auth_token      : fb.access_token,
      token_expiry    : new Date(Date.now() + fb.expires_in * 1000).toISOString(),
      connected_by    : user.id,
      connected       : true,
      updated_at      : new Date().toISOString(),
    }, { onConflict: "organization_id,platform" });

    if (dbErr) throw dbErr;

    /* ── 5️⃣  Redirect back to the UI ──────────────────────────────── */
    return new Response(null, {
      status : 302,
      headers: { ...cors, Location: "https://alchemylab.app/app/settings?success=facebook_connected" },
    });

  } catch (e) {
    log.error("Unhandled", e);
    return json({ error: (e as Error).message ?? "Internal error" }, 500);
  }
}

// ───── Start edge function server ─────────────────
serve(handler);
