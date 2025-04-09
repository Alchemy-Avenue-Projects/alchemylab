export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_accounts: {
        Row: {
          account_id_on_platform: string
          account_name: string
          auth_token: string | null
          client_id: string
          connected_at: string
          id: string
          platform: Database["public"]["Enums"]["ad_platform"]
          refresh_token: string | null
        }
        Insert: {
          account_id_on_platform: string
          account_name: string
          auth_token?: string | null
          client_id: string
          connected_at?: string
          id?: string
          platform: Database["public"]["Enums"]["ad_platform"]
          refresh_token?: string | null
        }
        Update: {
          account_id_on_platform?: string
          account_name?: string
          auth_token?: string | null
          client_id?: string
          connected_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["ad_platform"]
          refresh_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type"]
          body_text: string | null
          campaign_id: string
          created_at: string
          cta: string | null
          geo: string | null
          headline: string | null
          id: string
          image_url: string | null
          language: string | null
          video_url: string | null
        }
        Insert: {
          ad_type: Database["public"]["Enums"]["ad_type"]
          body_text?: string | null
          campaign_id: string
          created_at?: string
          cta?: string | null
          geo?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          video_url?: string | null
        }
        Update: {
          ad_type?: Database["public"]["Enums"]["ad_type"]
          body_text?: string | null
          campaign_id?: string
          created_at?: string
          cta?: string | null
          geo?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_learnings: {
        Row: {
          client_id: string | null
          created_at: string
          description: string
          id: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          learned_from_ad_id: string | null
          learned_from_campaign_id: string | null
          scope: Database["public"]["Enums"]["insight_scope"]
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description: string
          id?: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          learned_from_ad_id?: string | null
          learned_from_campaign_id?: string | null
          scope: Database["public"]["Enums"]["insight_scope"]
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string
          id?: string
          insight_type?: Database["public"]["Enums"]["insight_type"]
          learned_from_ad_id?: string | null
          learned_from_campaign_id?: string | null
          scope?: Database["public"]["Enums"]["insight_scope"]
        }
        Relationships: [
          {
            foreignKeyName: "ai_learnings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learnings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ai_learnings_learned_from_ad_id_fkey"
            columns: ["learned_from_ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learnings_learned_from_campaign_id_fkey"
            columns: ["learned_from_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          accepted: boolean | null
          ad_id: string
          applied_at: string | null
          created_at: string
          id: string
          reason: string | null
          suggested_text: string | null
          suggestion_type: Database["public"]["Enums"]["suggestion_type"]
        }
        Insert: {
          accepted?: boolean | null
          ad_id: string
          applied_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          suggested_text?: string | null
          suggestion_type: Database["public"]["Enums"]["suggestion_type"]
        }
        Update: {
          accepted?: boolean | null
          ad_id?: string
          applied_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          suggested_text?: string | null
          suggestion_type?: Database["public"]["Enums"]["suggestion_type"]
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          ad_id: string | null
          campaign_id: string | null
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          ctr: number | null
          custom_kpi_1: number | null
          custom_kpi_2: number | null
          date: string
          id: string
          impressions: number | null
          ltv: number | null
          platform: Database["public"]["Enums"]["ad_platform"]
          revenue: number | null
        }
        Insert: {
          ad_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          ctr?: number | null
          custom_kpi_1?: number | null
          custom_kpi_2?: number | null
          date: string
          id?: string
          impressions?: number | null
          ltv?: number | null
          platform: Database["public"]["Enums"]["ad_platform"]
          revenue?: number | null
        }
        Update: {
          ad_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          ctr?: number | null
          custom_kpi_1?: number | null
          custom_kpi_2?: number | null
          date?: string
          id?: string
          impressions?: number | null
          ltv?: number | null
          platform?: Database["public"]["Enums"]["ad_platform"]
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_snapshots_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          client_id: string
          file_name: string
          id: string
          uploaded_at: string
          uploaded_by: string
          url: string
          usage_count: number | null
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          client_id: string
          file_name: string
          id?: string
          uploaded_at?: string
          uploaded_by: string
          url: string
          usage_count?: number | null
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"]
          client_id?: string
          file_name?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string
          url?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          created_at: string
          current_plan: Database["public"]["Enums"]["organization_plan"]
          id: string
          last_payment_date: string | null
          next_billing_date: string | null
          organization_id: string
          status: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id: string | null
        }
        Insert: {
          created_at?: string
          current_plan: Database["public"]["Enums"]["organization_plan"]
          id?: string
          last_payment_date?: string | null
          next_billing_date?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id?: string | null
        }
        Update: {
          created_at?: string
          current_plan?: Database["public"]["Enums"]["organization_plan"]
          id?: string
          last_payment_date?: string | null
          next_billing_date?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_clients"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "billing_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ad_account_id: string
          budget: number | null
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          name: string
          objective: string | null
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
        }
        Insert: {
          ad_account_id: string
          budget?: number | null
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          name: string
          objective?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"]
        }
        Update: {
          ad_account_id?: string
          budget?: number | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          name?: string
          objective?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          name: string
          organization_id: string
          time_zone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          organization_id: string
          time_zone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          organization_id?: string
          time_zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_clients"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["organization_plan"]
          trial_expiration: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["organization_plan"]
          trial_expiration?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["organization_plan"]
          trial_expiration?: string | null
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          account_id: string | null
          account_name: string | null
          auth_token: string | null
          connected: boolean
          connected_by: string | null
          created_at: string
          error: string | null
          id: string
          organization_id: string
          platform: string
          refresh_token: string | null
          token_expiry: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          auth_token?: string | null
          connected?: boolean
          connected_by?: string | null
          created_at?: string
          error?: string | null
          id?: string
          organization_id: string
          platform: string
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          auth_token?: string | null
          connected?: boolean
          connected_by?: string | null
          created_at?: string
          error?: string | null
          id?: string
          organization_id?: string
          platform?: string
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_clients"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "platform_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_brief_accounts: {
        Row: {
          ad_account_id: string
          created_at: string
          id: string
          product_brief_id: string
        }
        Insert: {
          ad_account_id: string
          created_at?: string
          id?: string
          product_brief_id: string
        }
        Update: {
          ad_account_id?: string
          created_at?: string
          id?: string
          product_brief_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_brief_accounts_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_brief_accounts_product_brief_id_fkey"
            columns: ["product_brief_id"]
            isOneToOne: false
            referencedRelation: "product_briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      product_briefs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          target_audience: string | null
          target_locations: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          target_audience?: string | null
          target_locations?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          target_audience?: string | null
          target_locations?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_clients"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          client_id: string
          created_at: string
          exported_pdf_url: string | null
          generated_by: string
          id: string
          report_date_range_end: string
          report_date_range_start: string
          summary: string | null
          title: string
        }
        Insert: {
          client_id: string
          created_at?: string
          exported_pdf_url?: string | null
          generated_by: string
          id?: string
          report_date_range_end: string
          report_date_range_start: string
          summary?: string | null
          title: string
        }
        Update: {
          client_id?: string
          created_at?: string
          exported_pdf_url?: string | null
          generated_by?: string
          id?: string
          report_date_range_end?: string
          report_date_range_start?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      organization_clients: {
        Row: {
          client_id: string | null
          client_name: string | null
          industry: string | null
          org_id: string | null
          org_name: string | null
          org_plan: Database["public"]["Enums"]["organization_plan"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      ad_platform:
        | "facebook"
        | "google"
        | "tiktok"
        | "linkedin"
        | "taboola"
        | "pinterest"
        | "snapchat"
      ad_type: "image" | "video" | "carousel" | "text_only"
      asset_type: "image" | "video" | "text"
      billing_status: "active" | "trialing" | "cancelled"
      campaign_status: "active" | "paused" | "ended"
      insight_scope: "client" | "organization" | "global"
      insight_type: "positive" | "negative"
      notification_type:
        | "ai_suggestion_ready"
        | "campaign_warning"
        | "account_disconnected"
        | "report_ready"
      organization_plan: "trial" | "basic" | "pro" | "enterprise"
      suggestion_type:
        | "copy_change"
        | "asset_swap"
        | "fatigue_alert"
        | "localization"
      user_role: "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_platform: [
        "facebook",
        "google",
        "tiktok",
        "linkedin",
        "taboola",
        "pinterest",
        "snapchat",
      ],
      ad_type: ["image", "video", "carousel", "text_only"],
      asset_type: ["image", "video", "text"],
      billing_status: ["active", "trialing", "cancelled"],
      campaign_status: ["active", "paused", "ended"],
      insight_scope: ["client", "organization", "global"],
      insight_type: ["positive", "negative"],
      notification_type: [
        "ai_suggestion_ready",
        "campaign_warning",
        "account_disconnected",
        "report_ready",
      ],
      organization_plan: ["trial", "basic", "pro", "enterprise"],
      suggestion_type: [
        "copy_change",
        "asset_swap",
        "fatigue_alert",
        "localization",
      ],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
