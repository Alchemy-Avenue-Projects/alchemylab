// Supabase Edge Function: facebook-oauth-callback
//-------------------------------------------------
import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// ─────────────────────────────────── ENV
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

// ─────────────────────────────────── helpers
const cors = {
  "Access-Control-Allow-Origin": "https://alchemylab.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const decodeState = (raw: string) => {
  try {
    // ① decodeURIComponent()   ② atob()   ③ JSON.parse()
    return JSON.parse(atob(decodeURIComponent(raw)));
  } catch (_e) {
    return null;
  }
};

const exchangeCode = async (code: string) => {
  const u = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  u.searchParams.append("client_id", FACEBOOK_APP_ID);
  u.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
  u.searchParams.append("redirect_uri", REDIRECT_URI);
  u.searchParams.append("code", code);

  const r = await fetch(u.toString());
  if (!r.ok) throw new Error(`FB token exchange failed: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return { accessToken: j.access_token as string, expiresIn: j.expires_in as number };
};

// ─────────────────────────────────── main
async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const url   = new URL(req.url);
    const code  = url.searchParams.get("code")   ?? "";
    const state = url.searchParams.get("state")  ?? "";
    const error = url.searchParams.get("error")  ?? "";

    if (error)   return json({ error }, 400);
    if (!code)   return json({ error: "Missing authorization code" }, 400);

    // 1️⃣ Recover state payload
    const s = decodeState(state);
    if (!s || !s.jwt || !s.userId) return json({ error: "No user session available" }, 401);

    // 2️⃣ Verify Supabase JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(s.jwt);
    if (authErr || !user || user.id !== s.userId) return json({ error: "Invalid user session" }, 401);

    // 3️⃣ Exchange FB code → token
    const fb = await exchangeCode(code);

    // 4️⃣ Upsert connection (uses *user.id* for organization_id for now)
    const { error: dbErr } = await supabase.from("platform_connections").upsert(
      {
        platform:        "facebook",
        organization_id: user.id,     // ✅ point to *profiles.organization_id* later
        auth_token:      fb.accessToken,
        token_expiry:    new Date(Date.now() + fb.expiresIn * 1000).toISOString(),
        connected_by:    user.id,
        connected:       true,
        updated_at:      new Date().toISOString(),
      },
      { onConflict: "organization_id,platform" },
    );
    if (dbErr) throw dbErr;

    // 5️⃣ Redirect back to the app
    return new Response(null, {
      status: 302,
      headers: { ...cors, Location: "https://alchemylab.app/app/settings?success=facebook_connected" },
    });

  } catch (e) {
    return json({ error: (e as Error).message ?? "Internal error" }, 500);
  }
}

serve(handler);
