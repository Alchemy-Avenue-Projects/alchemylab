
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, PlatformConnection } from '@/types/platforms';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateOAuthUrl } from '@/services/platforms/oauth/url-generator';
import { toast } from 'sonner';
if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
  console.warn("⚠️ Missing VITE_FACEBOOK_APP_ID in .env — Facebook OAuth may not work.");
}

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

    try {
      console.log("[connectPlatform] Calling generateOAuthUrl...");
      const jwt = currentSession.access_token;
      const oauthUrl = await generateOAuthUrl(platform, jwt);

      console.log("[connectPlatform] Received OAuth URL:", oauthUrl);

      if (!oauthUrl || !oauthUrl.includes('http')) {
        throw new Error("Invalid or empty OAuth URL");
      }

      toast.info("Redirecting to authentication page", {
        description: `Please complete the ${platform} authentication to continue.`
      });

      // Delay for UX and toast visibility
      setTimeout(() => {
        if (oauthUrl && typeof oauthUrl === 'string') {
          console.log(`[connectPlatform] Redirecting to ${oauthUrl}`);
          window.location.href = oauthUrl;
        } else {
          console.error("❌ OAuth URL missing or invalid");
          toast.error("OAuth URL Error", {
            description: `Failed to redirect to ${platform} authentication.`
          });
        }
      }, 500);

    } catch (oauthErr) {
      console.error(`❌ Error generating OAuth URL for ${platform}:`, oauthErr);
      toast.error("OAuth URL Error", {
        description: `Failed to start ${platform} authentication.`
      });
    }

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
