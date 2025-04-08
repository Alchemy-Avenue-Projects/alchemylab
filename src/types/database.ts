
import { Database } from "@/integrations/supabase/types";

// Type-safe table references
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type Ad = Database["public"]["Tables"]["ads"]["Row"];
export type AdAccount = Database["public"]["Tables"]["ad_accounts"]["Row"];
export type AnalyticsSnapshot = Database["public"]["Tables"]["analytics_snapshots"]["Row"];
export type AiSuggestion = Database["public"]["Tables"]["ai_suggestions"]["Row"];
export type AiLearning = Database["public"]["Tables"]["ai_learnings"]["Row"];
export type Asset = Database["public"]["Tables"]["assets"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

// Extended Profile type to include additional fields used in the UI
export interface Profile extends Database["public"]["Tables"]["profiles"]["Row"] {
  company?: string;
  job_title?: string;
  bio?: string;
}

// Enums
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
export type AdPlatform = Database["public"]["Enums"]["ad_platform"];
export type AdType = Database["public"]["Enums"]["ad_type"];
export type SuggestionType = Database["public"]["Enums"]["suggestion_type"];
export type InsightType = Database["public"]["Enums"]["insight_type"];
export type InsightScope = Database["public"]["Enums"]["insight_scope"];
export type OrganizationPlan = Database["public"]["Enums"]["organization_plan"];
