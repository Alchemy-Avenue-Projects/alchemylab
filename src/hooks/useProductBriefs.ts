
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductBrief } from '@/types/creator';
import { useAuth } from '@/contexts/AuthContext';

export const useProductBriefs = () => {
  const [productBriefs, setProductBriefs] = useState<ProductBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductBriefs = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('product_briefs')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Parse dos and donts if they exist
        const formattedBriefs = data.map(brief => ({
          ...brief,
          dos: brief.dos ? JSON.parse(brief.dos) : [],
          donts: brief.donts ? JSON.parse(brief.donts) : []
        }));
        
        setProductBriefs(formattedBriefs);
      } catch (err) {
        console.error('Error fetching product briefs:', err);
        setError('Failed to load product briefs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductBriefs();
  }, [user?.id]);

  const getProductBriefById = async (id: string): Promise<ProductBrief | null> => {
    try {
      const { data, error } = await supabase
        .from('product_briefs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Parse dos and donts if they exist
      return {
        ...data,
        dos: data.dos ? JSON.parse(data.dos) : [],
        donts: data.donts ? JSON.parse(data.donts) : []
      };
    } catch (err) {
      console.error('Error fetching product brief by ID:', err);
      return null;
    }
  };

  return { productBriefs, isLoading, error, getProductBriefById };
};
