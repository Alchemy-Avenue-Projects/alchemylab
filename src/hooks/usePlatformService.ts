
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
    let cancelled = false;
    
    const loadCredentials = async () => {
      if (!profile?.organization_id) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        
        let query = supabase
          .from('platform_connections')
          .select('*')
          .eq('platform', platform)
          .eq('organization_id', profile.organization_id);
          
        if (connectionId) {
          query = query.eq('id', connectionId);
        }
        
        const { data, error: fetchError } = await query.maybeSingle();

        if (cancelled) return;

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          if (!cancelled) {
            setService(PlatformServiceFactory.getService(platform));
            setIsLoading(false);
          }
          return;
        }

        const credentials: PlatformCredentials = {
          accessToken: data.auth_token || '',
          refreshToken: data.refresh_token,
          expiresAt: data.token_expiry ? new Date(data.token_expiry) : undefined,
          accountId: data.account_id
        };

        if (!cancelled) {
          setService(PlatformServiceFactory.getService(platform, credentials));
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Error loading ${platform} credentials:`, err);
          setError(`Failed to load ${platform} credentials.`);
          // Create a service without credentials
          setService(PlatformServiceFactory.getService(platform));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCredentials();
    
    return () => {
      cancelled = true;
    };
  }, [platform, connectionId, profile?.organization_id]);

  return { service, isLoading, error };
};
