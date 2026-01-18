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
    // Handle both GET (from Facebook redirect) and POST (from frontend invoke)
    let code: string;
    let rawSt: string;
    let error: string;
    
    if (req.method === "GET") {
      const url = new URL(req.url);
      code = url.searchParams.get("code") ?? "";
      rawSt = url.searchParams.get("state") ?? "";
      error = url.searchParams.get("error") ?? "";
    } else {
      // POST request from frontend
      const body = await req.json();
      code = body.code ?? "";
      rawSt = body.state ?? "";
      error = body.error ?? "";
    }

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

    // 2.5) Verify nonce to prevent replay attacks
    if (st.nonce) {
      const { data: nonceRecord, error: nonceErr } = await sb
        .from("oauth_nonces")
        .select("*")
        .eq("nonce", st.nonce)
        .eq("user_id", user.id)
        .eq("platform", "facebook")
        .single();

      if (nonceErr || !nonceRecord) {
        console.error("[OAuth] Nonce verification failed:", nonceErr);
        return json({ error: "Invalid or expired OAuth state" }, 401, req.headers.get('Origin') || undefined);
      }

      // Check if nonce has expired
      if (new Date(nonceRecord.expires_at) < new Date()) {
        return json({ error: "OAuth state has expired" }, 401, req.headers.get('Origin') || undefined);
      }

      // Delete the nonce after use (one-time use)
      await sb.from("oauth_nonces").delete().eq("nonce", st.nonce);
    }

    // 3) fetch the organization_id that belongs to this user
    const { data: profile, error: pErr } = await sb
      .from("profiles")                    // ← change if your table is named differently
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (pErr || !profile?.organization_id)
      return json({ error: "User is not linked to any organization" }, 409, req.headers.get('Origin') || undefined);

    const orgId = profile.organization_id as string;

    // 3.5) Check tier limits before proceeding
    const TIER_LIMITS: Record<string, number> = {
      trial: 1,
      starter: 3,
      pro: 7,
      enterprise: Infinity,
    };
    const AD_PLATFORMS = ['facebook', 'google', 'tiktok', 'linkedin'];

    // Get organization plan
    const { data: org, error: orgErr } = await sb
      .from("organizations")
      .select("plan")
      .eq("id", orgId)
      .single();

    if (orgErr || !org) {
      return json({ error: "Could not fetch organization details" }, 500, req.headers.get('Origin') || undefined);
    }

    const planLimit = TIER_LIMITS[org.plan] ?? 1;

    // Count existing ad platform connections
    const { count: existingCount, error: countErr } = await sb
      .from("platform_connections")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("connected", true)
      .in("platform", AD_PLATFORMS);

    if (countErr) {
      console.error("Error counting connections:", countErr);
    }

    const currentConnections = existingCount ?? 0;

    // Check if this is a new connection (not an update)
    const { data: existingConnection } = await sb
      .from("platform_connections")
      .select("id")
      .eq("organization_id", orgId)
      .eq("platform", "facebook")
      .single();

    // If no existing connection and limit reached, reject
    if (!existingConnection && currentConnections >= planLimit) {
      return json({ 
        error: "Tier limit reached",
        message: `Your ${org.plan} plan allows ${planLimit} ad account${planLimit !== 1 ? 's' : ''}. Please upgrade to connect more platforms.`,
        currentCount: currentConnections,
        limit: planLimit,
        plan: org.plan
      }, 403, req.headers.get('Origin') || undefined);
    }

    // 4) Facebook code → token
    const fb = await exchangeCode(code);

    // 5) upsert connection
    // Encrypt token at rest - ENCRYPTION_KEY is required
    const base64Key = Deno.env.get('ENCRYPTION_KEY');
    if (!base64Key) {
      console.error("ENCRYPTION_KEY is not configured - this is required for production");
      return json({ error: "Server configuration error: encryption not configured" }, 500, req.headers.get('Origin') || undefined);
    }
    
    let storedToken = fb.accessToken;
    {
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

    const { data: platformConnection, error: dbErr } = await sb.from("platform_connections").upsert(
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
    ).select().single();
    if (dbErr) throw dbErr;

    // 6) Create corresponding ad_account record
    // Get or create a client for this organization
    const { data: clients, error: clientsError } = await sb
      .from("clients")
      .select("id")
      .eq("organization_id", orgId)
      .limit(1);

    let clientId: string | null = null;
    
    if (clientsError || !clients || clients.length === 0) {
      // Create a default client for this organization
      const { data: orgData } = await sb
        .from("organizations")
        .select("name")
        .eq("id", orgId)
        .single();

      const { data: newClient, error: createClientError } = await sb
        .from("clients")
        .insert({
          organization_id: orgId,
          name: `${orgData?.name || "Default"} Client`
        })
        .select("id")
        .single();

      if (createClientError || !newClient) {
        console.error("Failed to create default client:", createClientError);
        // Continue without creating ad_account - it can be created later
      } else {
        clientId = newClient.id;
      }
    } else {
      clientId = clients[0].id;
    }

    // Create ad_account if we have a client
    if (clientId && platformConnection) {
      const accountIdOnPlatform = platformConnection.account_id || platformConnection.id;
      
      const { error: adAccountError } = await sb.from("ad_accounts").upsert(
        {
          client_id: clientId,
          platform: "facebook" as any,
          account_name: platformConnection.account_name || "Facebook Account",
          account_id_on_platform: accountIdOnPlatform,
          auth_token: storedToken,
          connected_at: new Date().toISOString(),
        },
        { onConflict: "client_id,platform,account_id_on_platform" },
      );

      if (adAccountError) {
        console.error("Failed to create ad_account:", adAccountError);
        // Don't fail the whole operation - platform_connection was created successfully
      }
    }

    // 7) Return JSON response (frontend will handle redirect)
    const origin = req.headers.get('Origin') || undefined;
    return json({ 
      success: true, 
      message: "Facebook connection established successfully",
      platformConnectionId: platformConnection?.id 
    }, 200, origin);

  } catch (e) {
    return json({ error: (e as Error).message ?? "Internal error" }, 500, req.headers.get('Origin') || undefined);
  }
}

serve(handler);
