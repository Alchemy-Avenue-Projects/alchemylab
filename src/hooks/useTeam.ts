
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type TeamMember = Profile & {
  // Add any additional properties needed for the UI
  isCurrentUser: boolean;
};

// Type for roles that must match the database enum
type UserRole = "admin" | "editor" | "viewer";

export const useTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile: currentUserProfile } = useAuth();
  const [isInviting, setIsInviting] = useState(false);

  // Fetch team members (profiles with the same organization_id)
  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ["team-members", currentUserProfile?.organization_id],
    queryFn: async () => {
      if (!currentUserProfile?.organization_id) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", currentUserProfile.organization_id)
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }

      // Mark the current user
      return data.map(member => ({
        ...member,
        isCurrentUser: member.id === currentUserProfile.id
      })) as TeamMember[];
    },
    enabled: !!currentUserProfile?.organization_id
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      // Ensure we're not updating our own role if we're not an admin
      if (userId === currentUserProfile?.id && currentUserProfile?.role !== "admin") {
        throw new Error("You cannot change your own role");
      }

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
        description: "User role updated successfully."
      });
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive"
      });
    }
  });

  // Mock invite function (in a real app, this would send an email)
  const inviteUser = async (email: string, role: UserRole) => {
    if (!currentUserProfile?.organization_id) {
      toast({
        title: "Error",
        description: "You must be part of an organization to invite users.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsInviting(true);
      
      // This is a placeholder - in a real app, you'd likely:
      // 1. Create a record in an 'invitations' table
      // 2. Send an email with a signup link containing the invitation token
      // 3. When the user signs up, they'd be automatically added to the org
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email}. They'll receive instructions to join.`
      });
      
      // For demo purposes, let's pretend the user accepted right away
      // Add a placeholder profile
      await supabase.from("profiles").insert({
        id: crypto.randomUUID(), // In reality, this would be created when they sign up
        email: email,
        full_name: email.split('@')[0], // Just use the part before @ as name
        organization_id: currentUserProfile.organization_id,
        role: role
      });
      
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  return {
    teamMembers,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutate,
    isUpdating: updateRoleMutation.isPending,
    inviteUser,
    isInviting
  };
};
