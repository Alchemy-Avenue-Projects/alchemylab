
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, PlatformConnection } from '@/types/platforms';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateOAuthUrl } from '@/services/platforms/oauth';
import { toast } from 'sonner';

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
  const { profile, session } = useAuth();
  const { toast: uiToast } = useToast();

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
      uiToast({
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
      console.log(`Starting OAuth flow for ${platform}...`);
      
      // Check for valid session before proceeding
      if (!session || !session.access_token) {
        toast.error("Authentication Required", { 
          description: "You need to be logged in with an active session to connect platforms" 
        });
        return;
      }
      
      // For platforms that use API keys instead of OAuth
      if (platform === 'openai' || platform === 'amplitude' || platform === 'mixpanel') {
        // Redirect to the settings page with a query param to show the API key form
        window.location.href = `/app/settings?platform=${platform}&modal=api-key`;
        return;
      }
      
      // Generate the OAuth URL for this platform
      try {
        const oauthUrl = await generateOAuthUrl(platform);
        
        if (!oauthUrl) {
          throw new Error(`OAuth URL generation failed for ${platform}`);
        }
        
        console.log(`Opening OAuth URL for ${platform}: ${oauthUrl}`);
        
        // Show a toast before redirecting
        toast.info("Redirecting to authentication page", {
          description: `Please complete the ${platform} authentication to continue.`
        });
        
        // Add a small delay before redirecting to ensure toast is shown
        setTimeout(() => {
          // Redirect to the OAuth URL
          window.location.href = oauthUrl;
        }, 500);
      } catch (error) {
        console.error(`Error generating OAuth URL for ${platform}:`, error);
        throw new Error(`Failed to generate OAuth URL: ${error.message}`);
      }
      
    } catch (err) {
      console.error(`Error connecting to ${platform}:`, err);
      setError(`Failed to connect to ${platform}: ${err.message}`);
      toast.error(`Connection Error`, {
        description: `Failed to connect to ${platform}: ${err.message}`
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

      toast.success('Platform disconnected', {
        description: 'Platform disconnected successfully.'
      });
    } catch (err) {
      console.error('Error disconnecting platform:', err);
      setError('Failed to disconnect platform.');
      toast.error('Error', {
        description: 'Failed to disconnect platform: ' + err.message
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
