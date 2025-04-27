// facebook-oauth-callback – Supabase Edge Function
//-------------------------------------------------
import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// ─────────── ENV ───────────
const {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
  FACEBOOK_REDIRECT_URI,
} = Deno.env.toObject();

const REDIRECT_URI = FACEBOOK_REDIRECT_URI ??
  "https://api.alchemylab.app/facebook-oauth-callback";

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !SUPABASE_URL || !SERVICE_KEY)
  throw new Error("Missing env vars");

// ─────────── CORS ──────────
const cors = {
  "Access-Control-Allow-Origin": "https://alchemylab.app",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// quick helpers
const ok   = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const info = (m: string, d?: unknown) => console.log(`INFO : ${m}`, d ?? "");
const err  = (m: string, d?: unknown) => console.error(`ERROR: ${m}`, d ?? "");

// ───────── FB: code ➜ token ─────────
async function fbToken(code: string) {
  const u = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  u.searchParams.append("client_id",     FACEBOOK_APP_ID!);
  u.searchParams.append("client_secret", FACEBOOK_APP_SECRET!);
  u.searchParams.append("redirect_uri",  REDIRECT_URI);
  u.searchParams.append("code",          code);

  const r = await fetch(u.toString());
  if (!r.ok) throw new Error(`FB token exchange failed ${r.status}`);

  const j = await r.json();
  return { access: j.access_token as string, exp: j.expires_in as number };
}

// ─────────── MAIN ───────────
async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const url   = new URL(req.url);
    const code  = url.searchParams.get("code")  ?? "";
    const state = url.searchParams.get("state") ?? "";
    const error = url.searchParams.get("error") ?? "";

    if (error) return ok({ error }, 400);
    if (!code) return ok({ error: "Missing authorization code" }, 400);

    // ── 1 · recover JWT from state
    let jwt = "";
    try {
      jwt = JSON.parse(decodeURIComponent(state)).jwt ?? "";
    } catch { /* ignore */ }

    if (!jwt) return ok({ error: "No user session available" }, 401);

    // ── 2 · verify user
    const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
    if (authErr || !user) return ok({ error: "Invalid user session" }, 401);

    // ── 2.5 · fetch organization_id  (FIXED QUERY)
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)       // ← primary-key of profiles
      .single();

    if (profErr)         return ok({ error: "Could not fetch profile" }, 500);
    if (!profile?.organization_id)
                         return ok({ error: "User has no organization" }, 400);

    // ── 3 · FB token
    const fb = await fbToken(code);

    // ── 4 · upsert connection
    const { error: dbErr } = await supabase.from("platform_connections")
      .upsert({
        platform:        "facebook",
        organization_id: profile.organization_id,   // ✅ correct FK
        auth_token:      fb.access,
        token_expiry:    new Date(Date.now() + fb.exp * 1000).toISOString(),
        connected_by:    user.id,
        connected:       true,
        updated_at:      new Date().toISOString(),
      }, { onConflict: "organization_id,platform" });

    if (dbErr) throw dbErr;

    // ── 5 · redirect back
    return new Response(null, {
      status : 302,
      headers: { ...cors, Location: "https://alchemylab.app/app/settings?success=facebook_connected" },
    });

  } catch (e) {
    err("Unhandled", e);
    return ok({ error: (e as Error).message ?? "Internal error" }, 500);
  }
}

serve(handler);
