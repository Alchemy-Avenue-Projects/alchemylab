import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IntegrationItem from "./IntegrationItem";
import { usePlatforms } from "@/contexts/PlatformsContext";
import { Platform } from "@/types/platforms";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const IntegrationsTab: React.FC = () => {
  const { connections, isLoading, connectPlatform, disconnectPlatform, refreshConnections } = usePlatforms();
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const { toast } = useToast();
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
  }, [searchParams, setSearchParams]);

  const handleConnect = async (platform: Platform) => {
    try {
      setConnectingPlatform(platform);
      await connectPlatform(platform);
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${platform}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      setDisconnectingId(connectionId);
      await disconnectPlatform(connectionId);
    } catch (error) {
      console.error(`Error disconnecting:`, error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect platform. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleApiKeySubmit = async () => {
    if (!currentPlatform || !apiKey.trim() || !profile?.organization_id) return;
    
    setIsSubmitting(true);
    
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
      
      toast({
        title: 'Connected Successfully',
        description: `${currentPlatform} has been connected using your API key.`,
      });
      
      // Refresh the connections list
      await refreshConnections();
      
      // Close the modal
      setApiKeyModalOpen(false);
      setApiKey("");
      setCurrentPlatform(null);
    } catch (err) {
      console.error('Error saving API key:', err);
      toast({
        title: 'Connection Failed',
        description: 'There was an error connecting with your API key.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find connections by platform type
  const getConnection = (platform: Platform) => {
    return connections.find(conn => conn.platform === platform);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ad Platform Integrations</CardTitle>
          <CardDescription>
            Connect your ad accounts from various platforms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <IntegrationItem 
              name="Facebook Ads"
              status={getConnection('facebook') ? "connected" : "not-connected"}
              account={getConnection('facebook')?.account_name}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('facebook')}
              onDisconnect={getConnection('facebook') ? 
                () => handleDisconnect(getConnection('facebook')!.id) : undefined}
              isLoading={connectingPlatform === 'facebook' || disconnectingId === getConnection('facebook')?.id}
            />
            <IntegrationItem 
              name="Google Ads"
              status={getConnection('google') ? "connected" : "not-connected"}
              account={getConnection('google')?.account_name}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('google')}
              onDisconnect={getConnection('google') ? 
                () => handleDisconnect(getConnection('google')!.id) : undefined}
            />
            <IntegrationItem 
              name="LinkedIn Ads"
              status={getConnection('linkedin') ? "connected" : "not-connected"}
              account={getConnection('linkedin')?.account_name}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('linkedin')}
              onDisconnect={getConnection('linkedin') ? 
                () => handleDisconnect(getConnection('linkedin')!.id) : undefined}
            />
            <IntegrationItem 
              name="TikTok Ads"
              status={getConnection('tiktok') ? "connected" : "not-connected"}
              account={getConnection('tiktok')?.account_name}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('tiktok')}
              onDisconnect={getConnection('tiktok') ? 
                () => handleDisconnect(getConnection('tiktok')!.id) : undefined}
            />
            <IntegrationItem 
              name="Pinterest Ads"
              status={getConnection('pinterest') ? "connected" : "not-connected"}
              account={getConnection('pinterest')?.account_name}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('pinterest')}
              onDisconnect={getConnection('pinterest') ? 
                () => handleDisconnect(getConnection('pinterest')!.id) : undefined}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Analytics Integrations</CardTitle>
          <CardDescription>
            Connect your analytics platforms to import performance data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <IntegrationItem 
              name="Google Analytics 4"
              status={getConnection('google_analytics') ? "connected" : "not-connected"}
              account={getConnection('google_analytics')?.account_name}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('google_analytics')}
              onDisconnect={getConnection('google_analytics') ? 
                () => handleDisconnect(getConnection('google_analytics')!.id) : undefined}
            />
            <IntegrationItem 
              name="Mixpanel"
              status={getConnection('mixpanel') ? "connected" : "not-connected"}
              account={getConnection('mixpanel')?.account_name}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('mixpanel')}
              onDisconnect={getConnection('mixpanel') ? 
                () => handleDisconnect(getConnection('mixpanel')!.id) : undefined}
            />
            <IntegrationItem 
              name="Amplitude"
              status={getConnection('amplitude') ? "connected" : "not-connected"}
              account={getConnection('amplitude')?.account_name}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('amplitude')}
              onDisconnect={getConnection('amplitude') ? 
                () => handleDisconnect(getConnection('amplitude')!.id) : undefined}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Integrations</CardTitle>
          <CardDescription>
            Connect AI services for enhanced capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <IntegrationItem 
              name="OpenAI"
              status={getConnection('openai') ? "connected" : "not-connected"}
              account={getConnection('openai')?.account_name || "API Key: sk-...***"}
              logo="/placeholder.svg"
              onConnect={() => handleConnect('openai')}
              onDisconnect={getConnection('openai') ? 
                () => handleDisconnect(getConnection('openai')!.id) : undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Key Dialog */}
      <Dialog open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect {currentPlatform?.toUpperCase()}</DialogTitle>
            <DialogDescription>
              Enter your API key to connect to {currentPlatform}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${currentPlatform} API key`}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setApiKeyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApiKeySubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IntegrationsTab;
