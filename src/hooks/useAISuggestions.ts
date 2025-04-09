
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AiSuggestion, Ad, SuggestionType } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAISuggestions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch AI suggestions
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ["ai-suggestions", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("ai_suggestions")
        .select("*, ads(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching AI suggestions:", error);
        throw error;
      }

      return data as (AiSuggestion & { ads: Ad })[];
    },
    enabled: !!profile?.organization_id
  });

  // Accept suggestion mutation
  const acceptMutation = useMutation({
    mutationFn: async (suggestion: AiSuggestion) => {
      // First, update the ad with the suggested text
      if (suggestion.suggestion_type === "copy_change") {
        await supabase
          .from("ads")
          .update({ headline: suggestion.suggested_text })
          .eq("id", suggestion.ad_id);
      } else if (suggestion.suggestion_type === "asset_swap") {
        await supabase
          .from("ads")
          .update({ body_text: suggestion.suggested_text })
          .eq("id", suggestion.ad_id);
      }

      // Then, mark the suggestion as accepted
      const { data, error } = await supabase
        .from("ai_suggestions")
        .update({ 
          accepted: true,
          applied_at: new Date().toISOString()
        })
        .eq("id", suggestion.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      toast({
        title: "Success",
        description: "Suggestion applied successfully."
      });
    },
    onError: (error) => {
      console.error("Error accepting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to apply suggestion.",
        variant: "destructive"
      });
    }
  });

  // Reject suggestion mutation
  const rejectMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { data, error } = await supabase
        .from("ai_suggestions")
        .update({ 
          accepted: false,
          applied_at: new Date().toISOString()
        })
        .eq("id", suggestionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
      toast({
        title: "Success",
        description: "Suggestion rejected."
      });
    },
    onError: (error) => {
      console.error("Error rejecting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to reject suggestion.",
        variant: "destructive"
      });
    }
  });

  // Generate new suggestion
  const generateSuggestion = async (adId: string, suggestionType: SuggestionType) => {
    if (!profile?.id || !adId) return null;
    
    try {
      setIsGenerating(true);
      
      // For a real implementation, we would call an OpenAI edge function here
      // This is a mock implementation that creates a placeholder suggestion
      const suggestedText = suggestionType === "copy_change" 
        ? `Improved headline: Try our amazing product today!` 
        : `This is an AI-generated suggestion that would typically come from OpenAI. It's designed to improve your ad performance based on analytics data.`;
      
      const reason = "Based on analytics, this suggestion might improve engagement rates.";
      
      // Insert the new suggestion
      const { data, error } = await supabase
        .from("ai_suggestions")
        .insert({
          ad_id: adId,
          suggestion_type: suggestionType,
          suggested_text: suggestedText,
          reason: reason,
          accepted: null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Refresh suggestions
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
      
      toast({
        title: "Success",
        description: "New suggestion generated."
      });
      
      return data;
    } catch (error) {
      console.error("Error generating suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to generate suggestion.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    suggestions,
    isLoading,
    error,
    isGenerating,
    acceptSuggestion: acceptMutation.mutate,
    rejectSuggestion: rejectMutation.mutate,
    generateSuggestion
  };
};
