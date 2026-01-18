import { type FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IntegrationItem from "@/components/settings/IntegrationItem";
import { type Platform } from "@/types/platforms";
import { type PlatformConnection } from "@/types/platforms";
import { 
  Facebook, 
  BarChart3, 
  Brain,
  Linkedin, 
  Twitter, 
  MessageCircle,
  LineChart,
  BarChart, 
  PenSquare,
  BrainCircuit
} from "lucide-react";

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
  tierLimitReached?: boolean;
  tierLimitMessage?: string;
}

const PlatformCategory: FC<PlatformCategoryProps> = ({
  title,
  description,
  platforms,
  connections,
  onConnect,
  onDisconnect,
  connectingPlatform,
  disconnectingId,
  tierLimitReached = false,
  tierLimitMessage,
}) => {
  const getConnection = (platform: Platform) => {
    return connections.find(conn => conn.platform === platform);
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="text-blue-600" />;
      case 'google':
        return <div className="flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full">G</div>;
      case 'linkedin':
        return <Linkedin className="text-blue-700" />;
      case 'tiktok':
        return <MessageCircle className="text-black" />;
      
      case 'google_analytics':
        return <LineChart className="text-blue-500" />;
      case 'mixpanel':
        return <BarChart className="text-purple-600" />;
      case 'amplitude':
        return <BarChart3 className="text-teal-600" />;
      
      case 'openai':
        return <BrainCircuit className="text-green-600" />;
      
      default:
        return <PenSquare className="text-gray-500" />;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {platforms.map((platformItem) => {
            const connection = getConnection(platformItem.platform);
            const isLoading =
              connectingPlatform === platformItem.platform ||
              disconnectingId === connection?.id;

            console.log("Rendering IntegrationItem with props:", {
              name: platformItem.name,
              status: connection ? "connected" : "not-connected",
              account: connection?.account_name,
              isLoading
            });

            const isConnected = !!connection;
            // Only disable if limit reached AND not already connected
            const shouldDisable = tierLimitReached && !isConnected;

            return (
              <IntegrationItem
                key={platformItem.platform}
                name={platformItem.name}
                status={isConnected ? "connected" : "not-connected"}
                account={connection?.account_name}
                icon={getPlatformIcon(platformItem.platform)}
                onConnect={() => onConnect(platformItem.platform)}
                onDisconnect={
                  connection
                    ? () => onDisconnect(connection.id)
                    : undefined
                }
                isLoading={isLoading}
                disabled={shouldDisable}
                disabledReason={shouldDisable ? tierLimitMessage : undefined}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformCategory;
