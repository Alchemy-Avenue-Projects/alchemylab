
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IntegrationItem from "./IntegrationItem";
import { usePlatforms } from "@/contexts/PlatformsContext";
import { Platform } from "@/types/platforms";
import { Loader2 } from "lucide-react";

const IntegrationsTab: React.FC = () => {
  const { connections, isLoading, connectPlatform, disconnectPlatform } = usePlatforms();

  const handleConnect = (platform: Platform) => {
    connectPlatform(platform);
  };

  const handleDisconnect = (connectionId: string) => {
    disconnectPlatform(connectionId);
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
    </>
  );
};

export default IntegrationsTab;
