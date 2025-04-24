import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, PlatformConnection } from '@/types/platforms';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { env, validateEnv } from '@/utils/env';

// Validate environment variables on startup
validateEnv();

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
    console.log("[PlatformsContext] connectPlatform() called");

    try {
      console.log("[connectPlatform] Called for platform:", platform);
      console.log(`Starting OAuth flow for ${platform}...`);

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[connectPlatform] Supabase session error:", sessionError.message);
        throw new Error("Failed to get session");
      }

      if (!currentSession || !currentSession.user || !currentSession.access_token) {
        console.error("❌ No valid Supabase session or missing user/access_token");
        toast.error("Authentication Required", {
          description: "You need to be logged in to connect platforms"
        });
        return;
      }

      console.log("✅ Valid Supabase session found for user:", currentSession.user.id);

      // Skip OAuth for API key platforms
      if (platform === 'openai' || platform === 'amplitude' || platform === 'mixpanel') {
        window.location.href = `/app/settings?platform=${platform}&modal=api-key`;
        return;
      }

      if (platform === 'facebook') {
        console.log("🔍 Checking Facebook App ID:", env.facebook.appId);
        
        if (!env.facebook.appId) {
          console.error("❌ Missing Facebook App ID");
          toast.error("Configuration Error", {
            description: "Facebook App ID is not configured"
          });
          return;
        }

        // Construct the Facebook OAuth URL manually
        const redirectUri = 'https://api.alchemylab.app/facebook-oauth-callback';
        const scopes = 'ads_management,ads_read,business_management';
        const state = btoa(JSON.stringify({ 
          userId: currentSession.user.id,
          accessToken: currentSession.access_token,
          timestamp: Date.now(), // Add timestamp to prevent replay attacks
          nonce: Math.random().toString(36).substring(2) // Add nonce for additional security
        }));

        const facebookAuthUrl = new URL('https://www.facebook.com/v22.0/dialog/oauth');
        facebookAuthUrl.searchParams.append('client_id', env.facebook.appId);
        facebookAuthUrl.searchParams.append('redirect_uri', redirectUri);
        facebookAuthUrl.searchParams.append('scope', scopes);
        facebookAuthUrl.searchParams.append('state', state);
        facebookAuthUrl.searchParams.append('response_type', 'code');

        console.log("🔍 Facebook OAuth URL:", {
          clientId: env.facebook.appId,
          redirectUri,
          scopes,
          state: state.substring(0, 10) + '...'
        });

        console.log("✅ Redirecting to Facebook OAuth URL:", facebookAuthUrl.toString());
        
        // Add a small delay to ensure logs are visible
        await new Promise(resolve => setTimeout(resolve, 100));
        
        window.location.href = facebookAuthUrl.toString();
        return;
      }

      // Handle other platforms as needed
      toast.error("Not Implemented", {
        description: `${platform} integration is not implemented yet.`
      });

    } catch (err: any) {
      console.error(`❌ General error during connectPlatform(${platform}):`, err);
      setError(`Failed to connect to ${platform}: ${err.message}`);
      toast.error("Connection Error", {
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
    console.error("❌ usePlatforms was used outside of PlatformsProvider");
    throw new Error('usePlatforms must be used within a PlatformsProvider');
  }
  return context;
};
