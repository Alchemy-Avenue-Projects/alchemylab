
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdAccount } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";

export const useAdAccounts = () => {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;

  const { data: adAccounts = [], isLoading, error } = useQuery({
    queryKey: ["ad-accounts", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("ad_accounts")
        .select("*")
        .order("connected_at", { ascending: false });

      if (error) {
        console.error("Error fetching ad accounts:", error);
        throw error;
      }

      return data as AdAccount[];
    },
    enabled: !!organizationId,
  });

  return {
    adAccounts,
    isLoading,
    error
  };
};
