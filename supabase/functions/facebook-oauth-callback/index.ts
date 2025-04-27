// facebook-oauth-callback  –  Supabase Edge Function
//---------------------------------------------------
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// ───────────────────────────────────────────────────
// ENV
// ───────────────────────────────────────────────────
const FACEBOOK_APP_ID      = Deno.env.get("FACEBOOK_APP_ID");
const FACEBOOK_APP_SECRET  = Deno.env.get("FACEBOOK_APP_SECRET");
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const REDIRECT_URI         = Deno.env.get("FACEBOOK_REDIRECT_URI") ||
                             "https://api.alchemylab.app/facebook-oauth-callback";

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing required environment variables");
}

// ───────────────────────────────────────────────────
// CORS + helpers
// ───────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://alchemylab.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const logInfo  = (m: string, d?: unknown) => console.log(`INFO : ${m}`, d ?? "");
const logError = (m: string, d?: unknown) => console.error(`ERROR: ${m}`, d ?? "");

const handlePreflight = () =>
  new Response(null, { status: 204, headers: corsHeaders });

// ───────────────────────────────────────────────────
// FB helper – code ▶ token
// ───────────────────────────────────────────────────
async function exchangeCodeForToken(code: string) {
  logInfo("Exchanging code for token", { REDIRECT_URI });

  const u = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  u.searchParams.append("client_id",     FACEBOOK_APP_ID);
  u.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
  u.searchParams.append("redirect_uri",  REDIRECT_URI);
  u.searchParams.append("code",          code);

  const r = await fetch(u.toString());
  if (!r.ok) {
    const tx = await r.text();
    throw new Error(`Token exchange failed: ${r.status} – ${tx}`);
  }

  const j = await r.json();
  return {
    accessToken : j.access_token as string,
    expiresIn   : j.expires_in   as number,
  };
}

// ───────────────────────────────────────────────────
// MAIN handler
// ───────────────────────────────────────────────────
async function handleRequest(req: Request): Promise<Response> {
  try {
    const url   = new URL(req.url);
    const code  = url.searchParams.get("code")   ?? "";
    const state = url.searchParams.get("state")  ?? "";
    const error = url.searchParams.get("error")  ?? "";

    logInfo("OAuth callback", { code: code.slice(0, 6) + "...", error });

    if (error)          return json({ error }, 400);
    if (!code)          return json({ error: "Missing authorization code" }, 400);

    // ── 1)  Recover Supabase JWT *exactly* as your front-end sends it
    let jwt = "";
    try {
      const s = JSON.parse(decodeURIComponent(state));
      jwt = s.jwt            // ←  sent by your React code
         || s.accessToken    // ←  keep fallback so we can rename later
         || "";
    } catch (e) {
      logError("Cannot decode state JSON", e);
    }

    if (!jwt)  return json({ error: "No user session available" }, 401);

    // ── 2)  Verify user
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);

    if (authErr || !user) {
      logError("Supabase JWT invalid", authErr);
      return json({ error: "Invalid user session" }, 401);
    }

    // ── 3)  Exchange FB code ▶ token
    const fb = await exchangeCodeForToken(code);

    // ── 4)  Upsert / store
    const { error: dbErr } = await supabase.from("platform_connections")
      .upsert({
        platform:        "facebook",
        organization_id: user.id,          // TODO: use real org-id if you have it
        auth_token:      fb.accessToken,
        token_expiry:    new Date(Date.now() + fb.expiresIn * 1000).toISOString(),
        connected_by:    user.id,
        connected:       true,
        updated_at:      new Date().toISOString(),
      }, { onConflict: "organization_id,platform" });

    if (dbErr) throw dbErr;

    // ── 5)  Redirect back to UI
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: "https://alchemylab.app/app/settings?success=facebook_connected" },
    });

  } catch (err) {
    logError("Unhandled", err);
    return json({ error: (err as Error).message ?? "Internal error" }, 500);
  }
}

serve(req => req.method === "OPTIONS" ? handlePreflight() : handleRequest(req));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
