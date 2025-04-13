
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {platforms.map((platformItem) => (
            <IntegrationItem
              key={platformItem.platform}
              name={platformItem.name}
              status={getConnection(platformItem.platform) ? "connected" : "not-connected"}
              account={getConnection(platformItem.platform)?.account_name}
              logo={getPlatformLogo(platformItem.platform)}
              onConnect={() => onConnect(platformItem.platform)}
              onDisconnect={
                getConnection(platformItem.platform)
                  ? () => onDisconnect(getConnection(platformItem.platform)!.id)
                  : undefined
              }
              isLoading={
                connectingPlatform === platformItem.platform ||
                disconnectingId === getConnection(platformItem.platform)?.id
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformCategory;
