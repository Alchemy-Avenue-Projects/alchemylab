
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserRole } from "@/types/roles";

// Extend the Profile type to include invitation_status for new users
type InvitationStatus = "pending" | "accepted" | "rejected";

export const useTeam = () => {
  const queryClient = useQueryClient();
  const { profile: currentUserProfile, user } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Fetch team members
  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ["team-members", currentUserProfile?.organization_id],
    queryFn: async () => {
      if (!currentUserProfile?.organization_id) {
        return [];
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", currentUserProfile.organization_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }

      // Add a flag to indicate the current user
      return data.map(member => ({
        ...member,
        isCurrentUser: member.id === currentUserProfile.id
      }));
    },
    enabled: !!currentUserProfile?.organization_id
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member role updated successfully.");
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error updating role:", error);
      toast.error("Failed to update team member role.");
      setIsUpdating(false);
    }
  });

  // Invite user mutation - using the edge function
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      setIsInviting(true);
      console.log("Starting invitation process for:", email, "with role:", role);

      // Check if user and organization_id are available
      if (!currentUserProfile?.organization_id) {
        console.error("Missing organization_id in user profile");
        throw new Error("Organization not found. Please set up your organization first.");
      }

      if (!user?.email) {
        console.error("Missing user email");
        throw new Error("User not authenticated properly");
      }

      console.log("Organization ID:", currentUserProfile.organization_id);
      console.log("Current user email:", user.email);

      // Check if the user already exists in this organization
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .eq("organization_id", currentUserProfile.organization_id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing user:", checkError);
        throw new Error("Failed to check if user already exists");
      }

      if (existingUser) {
        console.error("User already exists in this organization:", existingUser);
        throw new Error(`User with email ${email} already exists in this organization`);
      }

      // Get organization name if available
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", currentUserProfile.organization_id)
        .maybeSingle();

      if (orgError) {
        console.error("Error fetching organization:", orgError);
        throw new Error("Failed to fetch organization details");
      }

      const organizationName = organization?.name || "Your Organization";
      console.log("Organization name:", organizationName);

      // Call our edge function to send the invitation email
      console.log("Calling invite-team-member edge function...");
      const { data, error } = await supabase.functions.invoke("invite-team-member", {
        body: {
          email,
          role,
          organizationId: currentUserProfile.organization_id,
          invitedByEmail: user.email,
          organizationName
        }
      });

      if (error) {
        console.error("Error from invite-team-member function:", error);
        throw new Error(error.message || "Failed to send invitation");
      }

      console.log("Invitation successfully sent:", data);
      return { email, role, ...data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success(`Team member invitation has been sent to ${data?.email || 'the provided email address'}.`);
      setIsInviting(false);
    },
    onError: (error: any) => {
      console.error("Error inviting user:", error);
      toast.error(error.message || "Failed to invite team member.");
      setIsInviting(false);
    }
  });

  return {
    teamMembers,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutate,
    isUpdating,
    inviteUser: inviteUserMutation.mutate,
    isInviting
  };
};
