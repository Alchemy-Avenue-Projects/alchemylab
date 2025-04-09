
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsSnapshot } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type AnalyticsFilters = {
  platform: string;
  campaignId: string | null;
  dateRange: DateRange;
};

export const useAnalytics = () => {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<AnalyticsFilters>({
    platform: "all-platforms",
    campaignId: null,
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date()
    }
  });

  const { data: analyticsData, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics", filters, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return [];
      }

      // Start building the query
      let query = supabase
        .from("analytics_snapshots")
        .select("*, campaigns(*)")
        .gte("date", filters.dateRange.startDate.toISOString().split("T")[0])
        .lte("date", filters.dateRange.endDate.toISOString().split("T")[0]);

      // Get campaigns belonging to the organization
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id")
        .order("created_at", { ascending: false });

      if (campaigns && campaigns.length > 0) {
        const campaignIds = campaigns.map(c => c.id);
        
        // Filter by campaign IDs to only show data for this organization's campaigns
        query = query.in("campaign_id", campaignIds);
        
        // Apply platform filter if selected
        if (filters.platform !== "all-platforms") {
          query = query.eq("platform", filters.platform);
        }
        
        // Apply campaign filter if selected
        if (filters.campaignId) {
          query = query.eq("campaign_id", filters.campaignId);
        }
      } else {
        // No campaigns in organization, return empty array
        return [];
      }

      const { data, error } = await query.order("date", { ascending: true });

      if (error) {
        console.error("Error fetching analytics:", error);
        throw error;
      }

      return data as (AnalyticsSnapshot & { campaigns: any })[];
    },
    enabled: !!profile?.organization_id
  });

  const generateReport = async (title: string) => {
    if (!profile?.id || !analyticsData) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("reports")
        .insert({
          title,
          generated_by: profile.id,
          client_id: profile.organization_id, // Using organization_id as client_id
          summary: `Analytics report from ${filters.dateRange.startDate.toLocaleDateString()} to ${filters.dateRange.endDate.toLocaleDateString()}`,
          report_date_range_start: filters.dateRange.startDate.toISOString().split("T")[0],
          report_date_range_end: filters.dateRange.endDate.toISOString().split("T")[0],
          exported_pdf_url: "https://example.com/report.pdf" // Placeholder, would be set by a backend function
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating report:", error);
      return null;
    }
  };

  return {
    analyticsData,
    isLoading,
    error,
    filters,
    setFilters,
    generateReport,
    refetch
  };
};
