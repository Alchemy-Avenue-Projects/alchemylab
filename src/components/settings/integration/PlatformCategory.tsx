
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IntegrationItem from "@/components/settings/IntegrationItem";
import { Platform } from "@/types/platforms";
import { PlatformConnection } from "@/types/platforms";

interface PlatformCategoryProps {
  title: string;
  description: string;
  platforms: {
    name: string;
    platform: Platform;
  }[];
  connections: PlatformConnection[];
  onConnect: (platform: Platform) => void;
  onDisconnect: (connectionId: string) => void;
  connectingPlatform: Platform | null;
  disconnectingId: string | null;
}

const PlatformCategory: React.FC<PlatformCategoryProps> = ({
  title,
  description,
  platforms,
  connections,
  onConnect,
  onDisconnect,
  connectingPlatform,
  disconnectingId,
}) => {
  // Find connection by platform type
  const getConnection = (platform: Platform) => {
    return connections.find(conn => conn.platform === platform);
  };

  // Get the appropriate logo for each platform
  const getPlatformLogo = (platform: Platform) => {
    // In a real app, you'd have actual logos for each platform
    // For now, we'll just use placeholder.svg
    return "/placeholder.svg";
  };

  // Show connections for a platform
  const renderPlatformConnections = (platform: Platform) => {
    const platformConnections = connections.filter(conn => conn.platform === platform);
    
    if (platformConnections.length === 0) {
      return (
        <IntegrationItem
          key={platform}
          name={platforms.find(p => p.platform === platform)?.name || platform}
          status="not-connected"
          logo={getPlatformLogo(platform)}
          onConnect={() => onConnect(platform)}
          isLoading={connectingPlatform === platform}
        />
      );
    }
    
    return platformConnections.map(connection => (
      <IntegrationItem
        key={connection.id}
        name={platforms.find(p => p.platform === platform)?.name || platform}
        status="connected"
        account={connection.account_name}
        logo={getPlatformLogo(platform)}
        onDisconnect={() => onDisconnect(connection.id)}
        isLoading={disconnectingId === connection.id}
      />
    ));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {platforms.map((platformItem) => (
            <div key={platformItem.platform} className="space-y-2">
              {renderPlatformConnections(platformItem.platform)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformCategory;
