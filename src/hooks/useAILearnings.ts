
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AiLearning } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { InsightScope, InsightType } from "@/types/database";

type AILearningsFilters = {
  scope: string;
  insightType: string;
};

export const useAILearnings = () => {
  const { profile } = useAuth();
  
  const fetchLearnings = async (filters: AILearningsFilters) => {
    if (!profile?.organization_id) return [];
    
    let query = supabase
      .from("ai_learnings")
      .select("*, campaigns(*), ads(*)")
      .order("created_at", { ascending: false });
    
    // Apply scope filter
    if (filters.scope !== "all") {
      // Type-cast the scope string to the expected enum type
      query = query.eq("scope", filters.scope as InsightScope);
    }
    
    // Apply insight type filter
    if (filters.insightType !== "all") {
      // Type-cast the insight_type string to the expected enum type  
      query = query.eq("insight_type", filters.insightType as InsightType);
    }
    
    // Filter by client_id (organization_id)
    query = query.eq("client_id", profile.organization_id);
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching AI learnings:", error);
      throw error;
    }
    
    return data as (AiLearning & { campaigns: any, ads: any })[];
  };
  
  return {
    useLearnings: (filters: AILearningsFilters) => 
      useQuery({
        queryKey: ["ai-learnings", filters, profile?.organization_id],
        queryFn: () => fetchLearnings(filters),
        enabled: !!profile?.organization_id
      })
  };
};
