
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductBrief } from '@/types/creator';
import { useAuth } from '@/contexts/AuthContext';
import { AiLearning, InsightType } from '@/types/database';

// Updated interface to match the structure we want to return
interface EnhancedProductBrief extends Omit<ProductBrief, 'dos' | 'donts'> {
  dos: string[];
  donts: string[];
}

export const useProductBriefs = (clientId?: string) => {
  const [productBriefs, setProductBriefs] = useState<EnhancedProductBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductBriefs = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // 1. Fetch product briefs
        const { data: briefData, error: briefError } = await supabase
          .from('product_briefs')
          .select('*')
          .eq('user_id', user.id);

        if (briefError) throw briefError;
        
        // 2. If we have briefs, fetch associated AI learnings for each brief
        const enhancedBriefs = await Promise.all(
          briefData.map(async (brief) => {
            // Use clientId from parameter if provided, otherwise use user.id
            const filterClientId = clientId || brief.user_id;
            
            // Fetch all AI learnings related to this client
            const { data: learningsData, error: learningsError } = await supabase
              .from('ai_learnings')
              .select('*')
              .eq('client_id', filterClientId);
              
            if (learningsError) {
              console.error('Error fetching AI learnings:', learningsError);
              return {
                ...brief,
                dos: [],
                donts: []
              };
            }
            
            // Categorize learnings into dos and donts
            const dos = learningsData
              ?.filter(learning => learning.insight_type === 'positive')
              .map(learning => learning.description) || [];
              
            const donts = learningsData
              ?.filter(learning => learning.insight_type === 'negative')
              .map(learning => learning.description) || [];
            
            // Return enhanced brief with dos and donts
            return {
              ...brief,
              dos,
              donts
            };
          })
        );
        
        setProductBriefs(enhancedBriefs);
      } catch (err) {
        console.error('Error fetching product briefs:', err);
        setError('Failed to load product briefs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductBriefs();
  }, [user?.id, clientId]);

  const getProductBriefById = async (id: string): Promise<EnhancedProductBrief | null> => {
    try {
      // 1. Fetch the product brief
      const { data: briefData, error: briefError } = await supabase
        .from('product_briefs')
        .select('*')
        .eq('id', id)
        .single();

      if (briefError) throw briefError;
      
      // 2. Fetch associated AI learnings
      const filterClientId = clientId || briefData.user_id;
      
      const { data: learningsData, error: learningsError } = await supabase
        .from('ai_learnings')
        .select('*')
        .eq('client_id', filterClientId);
        
      if (learningsError) {
        console.error('Error fetching AI learnings:', learningsError);
        return {
          ...briefData,
          dos: [],
          donts: []
        };
      }
      
      // Categorize learnings into dos and donts
      const dos = learningsData
        ?.filter(learning => learning.insight_type === 'positive')
        .map(learning => learning.description) || [];
        
      const donts = learningsData
        ?.filter(learning => learning.insight_type === 'negative')
        .map(learning => learning.description) || [];
      
      // Return enhanced brief with dos and donts
      return {
        ...briefData,
        dos,
        donts
      };
    } catch (err) {
      console.error('Error fetching product brief by ID:', err);
      return null;
    }
  };

  return { productBriefs, isLoading, error, getProductBriefById };
};
