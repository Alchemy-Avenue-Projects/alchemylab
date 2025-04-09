
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/roles";

// Extend the Profile type to include invitation_status for new users
type InvitationStatus = "pending" | "accepted" | "rejected";

export const useTeam = () => {
  const queryClient = useQueryClient();
  const { profile: currentUserProfile } = useAuth();
  const { toast } = useToast();
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
      toast({
        title: "Success",
        description: "Team member role updated successfully."
      });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update team member role.",
        variant: "destructive"
      });
      setIsUpdating(false);
    }
  });

  // Invite user mutation (simplified for demo purposes)
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: UserRole }) => {
      setIsInviting(true);
      
      // In a real app, you would send an invitation email with a sign-up link
      // For demo purposes, we'll just create a profile entry directly

      // Check if the user already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        throw new Error(`User with email ${email} already exists`);
      }

      // Create a new profile (simplified)
      // Since the database schema doesn't have invitation_status field yet,
      // we're omitting it from the insert operation and just creating the required fields
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          email,
          role,
          organization_id: currentUserProfile?.organization_id,
          // Note: We're using an UUID v4 for the id as it should be a reference to auth.users
          // In a real app, you would handle this differently with a proper invitation system
          id: crypto.randomUUID()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({
        title: "Invitation Sent",
        description: "Team member invitation has been sent successfully."
      });
      setIsInviting(false);
    },
    onError: (error: any) => {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite team member.",
        variant: "destructive"
      });
      setIsInviting(false);
    }
  });

  return {
    teamMembers,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutate,
    isUpdating,
    inviteUser: ({ email, role }: { email: string; role: string }) => 
      inviteUserMutation.mutate({ email, role: role as UserRole }),
    isInviting
  };
};
