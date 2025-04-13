import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, PlatformConnection } from '@/types/platforms';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateOAuthUrl } from '@/services/platforms/oauth-utils';

interface PlatformsContextType {
  connections: PlatformConnection[];
  isLoading: boolean;
  error: string | null;
  connectPlatform: (platform: Platform) => Promise<void>;
  disconnectPlatform: (connectionId: string) => Promise<void>;
  refreshConnections: () => Promise<void>;
}

const PlatformsContext = createContext<PlatformsContextType | undefined>(undefined);

export const PlatformsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const refreshConnections = async () => {
    if (!profile?.organization_id) {
      setConnections([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('organization_id', profile.organization_id);

      if (fetchError) {
        throw fetchError;
      }

      // Convert the data to PlatformConnection[]
      const typedConnections: PlatformConnection[] = data || [];
      
      setConnections(typedConnections.map(conn => ({
        ...conn,
        name: conn.account_name || `${conn.platform} Connection`
      })));
    } catch (err) {
      console.error('Error fetching platform connections:', err);
      setError('Failed to load platform connections.');
      toast({
        title: 'Error',
        description: 'Failed to load platform connections.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshConnections();
  }, [profile?.organization_id]);

  const connectPlatform = async (platform: Platform) => {
    try {
      // Generate the OAuth URL for this platform
      const oauthUrl = generateOAuthUrl(platform);
      
      if (!oauthUrl) {
        // For platforms that use API keys instead of OAuth
        if (platform === 'openai' || platform === 'amplitude') {
          // Redirect to the settings page with a query param to show the API key form
          window.location.href = `/app/settings?platform=${platform}&modal=api-key`;
          return;
        }
        
        throw new Error(`OAuth URL generation failed for ${platform}`);
      }
      
      // Redirect to the OAuth URL for all platforms (including Facebook)
      window.location.href = oauthUrl;
    } catch (err) {
      console.error(`Error connecting to ${platform}:`, err);
      setError(`Failed to connect to ${platform}.`);
      toast({
        title: 'Connection Error',
        description: `Failed to connect to ${platform}.`,
        variant: 'destructive',
      });
    }
  };

  const disconnectPlatform = async (connectionId: string) => {
    if (!profile?.organization_id) return;

    try {
      const { error: deleteError } = await supabase
        .from('platform_connections')
        .delete()
        .eq('id', connectionId)
        .eq('organization_id', profile.organization_id);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setConnections(prevConnections => 
        prevConnections.filter(conn => conn.id !== connectionId)
      );

      toast({
        title: 'Disconnected',
        description: 'Platform disconnected successfully.',
      });
    } catch (err) {
      console.error('Error disconnecting platform:', err);
      setError('Failed to disconnect platform.');
      toast({
        title: 'Error',
        description: 'Failed to disconnect platform.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PlatformsContext.Provider
      value={{
        connections,
        isLoading,
        error,
        connectPlatform,
        disconnectPlatform,
        refreshConnections,
      }}
    >
      {children}
    </PlatformsContext.Provider>
  );
};

export const usePlatforms = () => {
  const context = useContext(PlatformsContext);
  if (context === undefined) {
    throw new Error('usePlatforms must be used within a PlatformsProvider');
  }
  return context;
};
