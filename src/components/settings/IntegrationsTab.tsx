import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Platform } from "@/types/platforms";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatforms } from "@/contexts/PlatformsContext";
import PlatformCategory from "./integration/PlatformCategory";
import ApiKeyDialog from "./integration/ApiKeyDialog";
import { toast } from "sonner";

// Define platform categories - Remove Pinterest
const adPlatforms = [
  { name: "Facebook Ads", platform: "facebook" as Platform },
  { name: "Google Ads", platform: "google" as Platform },
  { name: "LinkedIn Ads", platform: "linkedin" as Platform },
  { name: "TikTok Ads", platform: "tiktok" as Platform },
];

const analyticsPlatforms = [
  { name: "Google Analytics 4", platform: "google_analytics" as Platform },
  { name: "Mixpanel", platform: "mixpanel" as Platform },
  { name: "Amplitude", platform: "amplitude" as Platform },
];

const aiPlatforms = [
  { name: "OpenAI", platform: "openai" as Platform },
];

const IntegrationsTab: React.FC = () => {
  const { connections, isLoading, error, connectPlatform, disconnectPlatform, refreshConnections } = usePlatforms();
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    // Check if we've been redirected with platform and modal params
    const platform = searchParams.get('platform') as Platform | null;
    const modal = searchParams.get('modal');
    
    if (platform && modal === 'api-key') {
      setCurrentPlatform(platform);
      setApiKeyModalOpen(true);
      // Clear the query params
      setSearchParams({});
    }
    
    // Check if we have success param
    const success = searchParams.get('success');
    if (success) {
      toast.success('Connection Successful', {
        description: `${success.replace('_', ' ')} was successfully connected`
      });
      refreshConnections();
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleConnect = async (platform: Platform) => {
    if (!profile) {
      toast.error("Authentication Required", { 
        description: "You need to be logged in to connect platforms" 
      });
      return;
    }
    
    try {
      console.log(`Connecting to ${platform}...`);
      setConnectingPlatform(platform);
      
      // Add a debug toast to see if this function is being called
      toast.info(`Connecting to ${platform}...`);
      
      await connectPlatform(platform);
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      toast.error("Connection Failed", {
        description: `Failed to connect to ${platform}. Please try again.`
      });
    } finally {
      // We're keeping the loading state here as the page should redirect
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      setDisconnectingId(connectionId);
      await disconnectPlatform(connectionId);
    } catch (error) {
      console.error(`Error disconnecting:`, error);
      toast.error("Disconnection Failed", {
        description: "Failed to disconnect platform. Please try again."
      });
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleApiKeySubmit = async (apiKey: string) => {
    if (!currentPlatform || !apiKey.trim() || !profile?.organization_id) return;
    
    try {
      // For API key based services, we store the key as the auth_token
      const { error } = await supabase
        .from('platform_connections')
        .insert({
          platform: currentPlatform,
          organization_id: profile.organization_id,
          auth_token: apiKey.trim(),
          connected_by: profile.id,
          account_name: `${currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)} API Key`,
          connected: true
        });
      
      if (error) throw error;
      
      toast.success('Connected Successfully', {
        description: `${currentPlatform} has been connected using your API key.`
      });
      
      // Refresh the connections list
      await refreshConnections();
      
      // Close the modal
      setApiKeyModalOpen(false);
      setCurrentPlatform(null);
    } catch (err) {
      console.error('Error saving API key:', err);
      toast.error('Connection Failed', {
        description: 'There was an error connecting with your API key.'
      });
    }
  };

  if (isLoading && connections.length === 0) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
        <h3 className="font-medium">Error loading integrations</h3>
        <p>{error}</p>
        <button 
          onClick={refreshConnections} 
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <PlatformCategory
        title="Ad Platform Integrations"
        description="Connect your ad accounts from various platforms."
        platforms={adPlatforms}
        connections={connections}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        connectingPlatform={connectingPlatform}
        disconnectingId={disconnectingId}
      />
      
      <PlatformCategory
        title="Analytics Integrations"
        description="Connect your analytics platforms to import performance data."
        platforms={analyticsPlatforms}
        connections={connections}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        connectingPlatform={connectingPlatform}
        disconnectingId={disconnectingId}
      />
      
      <PlatformCategory
        title="AI Integrations"
        description="Connect AI services for enhanced capabilities."
        platforms={aiPlatforms}
        connections={connections}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        connectingPlatform={connectingPlatform}
        disconnectingId={disconnectingId}
      />

      <ApiKeyDialog
        open={apiKeyModalOpen}
        onOpenChange={setApiKeyModalOpen}
        platform={currentPlatform}
        onSubmit={handleApiKeySubmit}
      />
    </>
  );
};

export default IntegrationsTab;
