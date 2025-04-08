
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign, AdAccount, Ad } from "@/types/database";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type CampaignWithAccount = Campaign & { ad_accounts: AdAccount };

export const useCampaigns = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;
  
  // Filters
  const [filters, setFilters] = useState({
    platform: "all-platforms",
    status: "all-status",
    search: ""
  });

  // Fetch all campaigns with their ad accounts
  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ["campaigns", organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from("campaigns")
        .select("*, ad_accounts(*)");
      
      // Apply filters
      if (filters.platform !== "all-platforms") {
        query = query.eq("ad_accounts.platform", filters.platform);
      }
      
      if (filters.status !== "all-status") {
        query = query.eq("status", filters.status.toLowerCase());
      }
      
      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return data as CampaignWithAccount[];
    },
    enabled: !!organizationId,
  });

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (newCampaign: Omit<Campaign, "id" | "created_at" | "created_by">) => {
      if (!profile?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          ...newCampaign,
          created_by: profile.id,
        })
        .select("*, ad_accounts(*)")
        .single();

      if (error) throw error;
      return data as CampaignWithAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created successfully");
    },
    onError: (error) => {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    }
  });

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select("*, ad_accounts(*)")
        .single();

      if (error) throw error;
      return data as CampaignWithAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign updated successfully");
    },
    onError: (error) => {
      console.error("Error updating campaign:", error);
      toast.error("Failed to update campaign");
    }
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    }
  });

  // Fetch ads for a campaign
  const fetchAdsForCampaign = async (campaignId: string) => {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Error fetching ads:", error);
      throw error;
    }

    return data as Ad[];
  };

  return {
    campaigns,
    isLoading,
    error,
    filters,
    setFilters,
    createCampaign: createMutation.mutate,
    updateCampaign: updateMutation.mutate,
    deleteCampaign: deleteMutation.mutate,
    fetchAdsForCampaign,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
