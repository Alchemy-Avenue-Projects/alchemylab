
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // Replace hardcoded URL with your Supabase project URL
      Deno.env.get('SUPABASE_URL') ?? '',
      // Replace hardcoded anon key with your Supabase anon key
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Extract the auth token from the request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the invitation details from the request body
    const { email, role, organizationId, invitedByEmail, organizationName } = await req.json();
    
    // Validate inputs
    if (!email || !role || !organizationId) {
      console.error("Missing required fields:", { email, role, organizationId });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the current user's session 
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a secure invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days

    // Store the invitation in the database
    const { error: insertError } = await supabaseClient
      .from('team_invitations')
      .insert({
        email,
        role,
        organization_id: organizationId,
        invited_by: user.id,
        token: invitationToken,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error("Error inserting invitation:", insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate the invitation URL that the user will receive
    // This should point to your frontend route that handles accepting invitations
    const inviteUrl = `${req.headers.get('origin')}/auth/accept-invite?token=${invitationToken}`;

    console.log(`Sending invitation to ${email} with role ${role}`);
    console.log(`Invite URL: ${inviteUrl}`);

    // Use Supabase's built-in email service to send the invitation
    // This leverages your custom SMTP configuration
    const { error: emailError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      data: {
        role,
        organization_id: organizationId,
        invitation_token: invitationToken,
      },
      redirectTo: inviteUrl,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation email', details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Invitation sent successfully to ${email} with role ${role}`);
    
    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        email,
        role 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
