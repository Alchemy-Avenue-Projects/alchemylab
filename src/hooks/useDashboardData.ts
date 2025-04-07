
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AiSuggestion, AnalyticsSnapshot, Campaign, AdAccount } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";

export const useDashboardData = () => {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;

  // Fetch AI suggestion of the day
  const suggestionsQuery = useQuery({
    queryKey: ["ai-suggestion-of-the-day", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      // Get recent AI suggestions that haven't been accepted yet
      const { data, error } = await supabase
        .from("ai_suggestions")
        .select("*, ads(campaign_id, campaigns(*))")
        .eq("accepted", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching AI suggestion:", error);
        throw error;
      }

      return data as AiSuggestion & {
        ads: {
          campaign_id: string;
          campaigns: Campaign;
        };
      } | null;
    },
    enabled: !!organizationId,
  });

  // Fetch active campaigns
  const campaignsQuery = useQuery({
    queryKey: ["active-campaigns", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("campaigns")
        .select("*, ad_accounts(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return data as (Campaign & { ad_accounts: AdAccount })[];
    },
    enabled: !!organizationId,
  });

  // Fetch analytics data for active campaigns
  const analyticsQuery = useQuery({
    queryKey: ["campaign-analytics", organizationId, campaignsQuery.data?.map(c => c.id).join()],
    queryFn: async () => {
      if (!organizationId || !campaignsQuery.data?.length) return [];

      const campaignIds = campaignsQuery.data.map(c => c.id);
      
      // Get the most recent analytics snapshot for each campaign
      const { data, error } = await supabase
        .from("analytics_snapshots")
        .select("*")
        .in("campaign_id", campaignIds)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching analytics:", error);
        throw error;
      }

      // Group analytics by campaign and get most recent for each
      const latestByCampaign = data.reduce((acc, curr) => {
        if (!acc[curr.campaign_id] || new Date(curr.date) > new Date(acc[curr.campaign_id].date)) {
          acc[curr.campaign_id] = curr;
        }
        return acc;
      }, {} as Record<string, AnalyticsSnapshot>);

      return Object.values(latestByCampaign);
    },
    enabled: !!organizationId && !!campaignsQuery.data?.length,
  });

  // Fetch ad account connection status
  const accountsQuery = useQuery({
    queryKey: ["ad-accounts", organizationId],
    queryFn: async () => {
      if (!organizationId) return { accounts: [], staleAccounts: [] };

      const { data, error } = await supabase
        .from("ad_accounts")
        .select("*")
        .order("connected_at", { ascending: false });

      if (error) {
        console.error("Error fetching ad accounts:", error);
        throw error;
      }

      // Check for accounts that haven't been updated in 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const staleAccounts = data.filter(account => 
        new Date(account.connected_at) < thirtyDaysAgo
      );

      return {
        accounts: data,
        staleAccounts
      };
    },
    enabled: !!organizationId,
  });

  // Identify campaigns with CTR < 1%
  const lowCtrCampaigns = analyticsQuery.data?.filter(
    snapshot => snapshot.ctr !== null && snapshot.ctr < 1
  ) || [];

  return {
    suggestionOfTheDay: suggestionsQuery.data,
    isSuggestionLoading: suggestionsQuery.isLoading,
    
    activeCampaigns: campaignsQuery.data || [],
    isCampaignsLoading: campaignsQuery.isLoading,
    
    campaignAnalytics: analyticsQuery.data || [],
    isAnalyticsLoading: analyticsQuery.isLoading,
    
    accountsData: accountsQuery.data || { accounts: [], staleAccounts: [] },
    isAccountsLoading: accountsQuery.isLoading,
    
    alerts: {
      lowCtrCampaigns,
      staleAccounts: accountsQuery.data?.staleAccounts || []
    }
  };
};
