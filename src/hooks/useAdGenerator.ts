import { useState } from 'react';
import { GenerateAdPayload, AdResult } from '@/types/creator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useAdGenerator = () => {
  const [results, setResults] = useState<AdResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAds = async (payload: GenerateAdPayload) => {
    try {
      setIsGenerating(true);
      
      console.log('[useAdGenerator] Generating ads with payload:', payload);
      
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to generate ads');
        return [];
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-ad-copy', {
        body: {
          product: payload.product,
          audience: payload.audience,
          location: payload.location,
          tone: payload.tone,
          cta: payload.cta,
          platform: payload.platform,
          additionalContext: payload.additionalContext,
        },
      });

      if (error) {
        console.error('[useAdGenerator] Edge function error:', error);
        throw new Error(error.message || 'Failed to generate ads');
      }

      if (!data?.success || !data?.results) {
        throw new Error(data?.error || 'Invalid response from ad generator');
      }

      const generatedResults: AdResult[] = data.results;
      
      setResults(generatedResults);
      
      const modelInfo = data.model === 'mock' ? ' (demo mode)' : '';
      toast.success(`Ad copy generated successfully${modelInfo}!`);
      
      return generatedResults;
    } catch (error) {
      console.error('[useAdGenerator] Error generating ads:', error);
      toast.error('Failed to generate ad copy', {
        description: (error as Error).message,
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return { generateAds, results, isGenerating, clearResults };
};
