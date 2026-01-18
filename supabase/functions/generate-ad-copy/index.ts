// Supabase Edge Function – generate-ad-copy
//--------------------------------------------------
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// ─── ENV ──────────────────────────────────────────
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_API_KEY,
} = Deno.env.toObject();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase env vars");
}

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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  } as Record<string, string>;
};

const json = (body: unknown, status = 200, origin?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCors(origin), "Content-Type": "application/json" },
  });

// ─── Types ──────────────────────────────────────────
interface AdGenerationRequest {
  product: string;
  audience: string;
  location?: string;
  tone?: string;
  cta?: string;
  platform: string[];
  additionalContext?: string;
}

interface AdResult {
  platform: string;
  headline: string;
  body: string;
  primary_text?: string;
  description?: string;
}

// ─── OpenAI Integration ─────────────────────────────
async function generateWithOpenAI(request: AdGenerationRequest): Promise<AdResult[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const platformPrompts = request.platform.map((platform) => {
    let format = "";
    switch (platform.toLowerCase()) {
      case "meta":
      case "facebook":
        format = `For ${platform}:
- Primary Text (up to 125 characters, compelling hook)
- Headline (up to 40 characters)
- Description (up to 30 characters)
- Body (main ad copy, 2-3 sentences)`;
        break;
      case "google":
        format = `For ${platform}:
- Headline 1 (up to 30 characters)
- Headline 2 (up to 30 characters)
- Headline 3 (up to 30 characters)
- Description 1 (up to 90 characters)
- Description 2 (up to 90 characters)`;
        break;
      case "linkedin":
        format = `For ${platform}:
- Headline (up to 70 characters, professional tone)
- Body (up to 600 characters, B2B focused)
- CTA text`;
        break;
      case "tiktok":
        format = `For ${platform}:
- Hook (first 3 seconds, attention-grabbing)
- Body (casual, trendy language)
- CTA (action-oriented)`;
        break;
      default:
        format = `For ${platform}:
- Headline
- Body
- CTA`;
    }
    return format;
  });

  const prompt = `You are an expert digital marketing copywriter. Generate compelling ad copy for the following:

Product/Service: ${request.product}
Target Audience: ${request.audience}
${request.location ? `Location: ${request.location}` : ""}
${request.tone ? `Tone: ${request.tone}` : "Tone: Professional yet engaging"}
${request.cta ? `Call to Action: ${request.cta}` : ""}
${request.additionalContext ? `Additional Context: ${request.additionalContext}` : ""}

Generate ad copy for the following platforms:
${platformPrompts.join("\n\n")}

Respond in JSON format with an array of objects, each containing:
{
  "platform": "platform_name",
  "headline": "...",
  "body": "...",
  "primary_text": "..." (for Meta/Facebook only),
  "description": "..." (for Meta/Facebook only)
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert digital marketing copywriter. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[OpenAI] API error:", error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  // Parse JSON from response (handle markdown code blocks)
  let jsonContent = content;
  if (content.includes("```json")) {
    jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (content.includes("```")) {
    jsonContent = content.replace(/```\n?/g, "");
  }

  try {
    const results = JSON.parse(jsonContent.trim());
    return Array.isArray(results) ? results : [results];
  } catch (parseError) {
    console.error("[OpenAI] JSON parse error:", parseError, "Content:", content);
    throw new Error("Failed to parse OpenAI response");
  }
}

// ─── Fallback Mock Generation ───────────────────────
function generateMock(request: AdGenerationRequest): AdResult[] {
  return request.platform.map((platform) => ({
    platform,
    headline: `Boost your ${request.product} results today`,
    body: `Perfect for ${request.audience}${request.location ? ` in ${request.location}` : ""}. ${request.cta || "Get started now!"}`,
    ...(platform.toLowerCase() === "meta" || platform.toLowerCase() === "facebook"
      ? {
          primary_text: `Looking for a solution for ${request.product}? We have what you need.`,
          description: `Our product is designed for ${request.audience} like you.`,
        }
      : {}),
  }));
}

// ─── Main Handler ───────────────────────────────────
async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("Origin") || undefined;

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCors(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing authorization" }, 401, origin);
    }

    const jwt = authHeader.replace("Bearer ", "");
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authErr } = await sb.auth.getUser(jwt);

    if (authErr || !user) {
      return json({ error: "Invalid authorization" }, 401, origin);
    }

    // Get organization
    const { data: profile } = await sb
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return json({ error: "User not linked to organization" }, 403, origin);
    }

    // Parse request
    const body: AdGenerationRequest = await req.json();

    if (!body.product || !body.audience || !body.platform?.length) {
      return json({ error: "Missing required fields: product, audience, platform" }, 400, origin);
    }

    const startTime = Date.now();
    let results: AdResult[];
    let modelUsed = "mock";
    let tokensUsed = 0;

    // Try OpenAI, fallback to mock
    if (OPENAI_API_KEY) {
      try {
        results = await generateWithOpenAI(body);
        modelUsed = "gpt-4o-mini";
        tokensUsed = 500; // Estimate, actual would come from API response
      } catch (openaiError) {
        console.error("[generate-ad-copy] OpenAI error, using mock:", openaiError);
        results = generateMock(body);
      }
    } else {
      console.log("[generate-ad-copy] No OpenAI key, using mock generation");
      results = generateMock(body);
    }

    const latencyMs = Date.now() - startTime;

    // Log generation to ai_generations table
    await sb.from("ai_generations").insert({
      organization_id: profile.organization_id,
      user_id: user.id,
      generation_type: "ad_copy",
      input_prompt: JSON.stringify(body),
      output_content: results,
      model_used: modelUsed,
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
      status: "success",
    });

    return json({ success: true, results, model: modelUsed, latency_ms: latencyMs }, 200, origin);
  } catch (error) {
    console.error("[generate-ad-copy] Error:", error);
    return json({ error: (error as Error).message || "Internal error" }, 500, origin);
  }
}

serve(handler);
