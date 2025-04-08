
import { useState, useEffect } from 'react';
import { Platform, PlatformCredentials } from '@/types/platforms';
import { PlatformService } from '@/services/platforms/PlatformService';
import { PlatformServiceFactory } from '@/services/platforms/PlatformServiceFactory';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePlatformService = (platform: Platform, connectionId?: string) => {
  const [service, setService] = useState<PlatformService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const loadCredentials = async () => {
      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        let query = supabase
          .from('platform_connections')
          .select('*')
          .eq('platform', platform)
          .eq('organization_id', profile.organization_id);
          
        if (connectionId) {
          query = query.eq('id', connectionId);
        }
        
        const { data, error: fetchError } = await query.single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setService(PlatformServiceFactory.getService(platform));
          return;
        }

        const credentials: PlatformCredentials = {
          accessToken: data.auth_token,
          refreshToken: data.refresh_token,
          expiresAt: data.token_expiry ? new Date(data.token_expiry) : undefined,
          accountId: data.account_id
        };

        setService(PlatformServiceFactory.getService(platform, credentials));
      } catch (err) {
        console.error(`Error loading ${platform} credentials:`, err);
        setError(`Failed to load ${platform} credentials.`);
        // Create a service without credentials
        setService(PlatformServiceFactory.getService(platform));
      } finally {
        setIsLoading(false);
      }
    };

    loadCredentials();
  }, [platform, connectionId, profile?.organization_id]);

  return { service, isLoading, error };
};
