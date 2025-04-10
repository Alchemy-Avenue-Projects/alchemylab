
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
    console.log("Starting invite-team-member function");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
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
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the invitation details from the request body
    const requestBody = await req.json();
    console.log("Request body:", requestBody);
    
    const { email, role, organizationId, invitedByEmail, organizationName } = requestBody;
    
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

    console.log("Authenticated user:", user.id);

    // Verify the organization exists
    const { data: orgData, error: orgError } = await supabaseClient
      .from('organizations')
      .select('id, name')
      .eq('id', organizationId)
      .maybeSingle();
      
    if (orgError) {
      console.error("Error checking organization:", orgError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify organization', details: orgError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!orgData) {
      console.error("Organization not found:", organizationId);
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a secure invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days

    console.log("Created invitation token:", invitationToken);

    // Check if team_invitations table exists, create it if not
    const { error: tableCheckError } = await supabaseClient.rpc('create_team_invitations_table_if_not_exists');
    
    if (tableCheckError) {
      console.log("Error checking/creating team_invitations table:", tableCheckError);
      console.log("Attempting to create table directly...");
      
      // Try to create the table directly if the RPC fails
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.team_invitations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL,
          role TEXT NOT NULL,
          organization_id UUID NOT NULL,
          invited_by UUID NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
      `;
      
      const { error: createError } = await supabaseClient.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error("Failed to create team_invitations table:", createError);
        // Continue anyway - the insert will fail if table doesn't exist
      }
    }

    // Store the invitation in the database
    console.log("Storing invitation in database...");
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
    console.log(`Organization: ${organizationName}`);
    console.log(`Invited by: ${invitedByEmail}`);

    // Use Supabase's built-in email service to send the invitation
    // This leverages your custom SMTP configuration
    const { error: emailError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      data: {
        role,
        organization_id: organizationId,
        invitation_token: invitationToken,
        organization_name: organizationName
      },
      redirectTo: inviteUrl,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      
      // Try to send a fallback email if the admin invite fails
      try {
        console.log("Sending manual email notification...");
        // Implement your fallback email logic here if needed
      } catch (fallbackError) {
        console.error("Fallback email also failed:", fallbackError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send invitation email', 
          details: emailError.message,
          note: 'The invitation was created in the database, but email delivery failed. Make sure your SMTP settings are correctly configured in Supabase.'
        }),
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
