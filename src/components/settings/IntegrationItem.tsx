
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface IntegrationItemProps {
  name: string;
  status: "connected" | "not-connected";
  account?: string;
  logo: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  isLoading?: boolean;
}

const IntegrationItem: React.FC<IntegrationItemProps> = ({ 
  name, 
  status, 
  account, 
  logo,
  onConnect,
  onDisconnect,
  isLoading = false
}) => {
  const handleConnect = () => {
    try {
      if (onConnect) {
        onConnect();
      }
    } catch (error) {
      console.error(`Error connecting to ${name}:`, error);
      toast.error(`Connection Error`, {
        description: `Failed to connect to ${name.toLowerCase()}. Please try again.`
      });
    }
  };

  const handleDisconnect = () => {
    try {
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error(`Error disconnecting from ${name}:`, error);
      toast.error(`Disconnection Error`, {
        description: `Failed to disconnect from ${name.toLowerCase()}. Please try again.`
      });
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border rounded-md bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-4 overflow-hidden">
          <img src={logo} alt={name} className="h-6 w-6 object-contain" />
        </div>
        <div>
          <div className="font-medium">{name}</div>
          {account && <div className="text-sm text-muted-foreground">{account}</div>}
        </div>
      </div>
      {status === "connected" ? (
        <div className="flex items-center">
          <Badge variant="outline" className="text-green-500 border-green-200 mr-2">Connected</Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Disconnecting...
              </>
            ) : "Disconnect"}
          </Button>
        </div>
      ) : (
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : "Connect"}
        </Button>
      )}
    </div>
  );
};

export default IntegrationItem;
