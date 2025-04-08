
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IntegrationItemProps {
  name: string;
  status: "connected" | "not-connected";
  account?: string;
  logo: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const IntegrationItem: React.FC<IntegrationItemProps> = ({ 
  name, 
  status, 
  account, 
  logo,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="flex justify-between items-center p-4 border rounded-md">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-4">
          <img src={logo} alt={name} className="h-6 w-6" />
        </div>
        <div>
          <div className="font-medium">{name}</div>
          {account && <div className="text-sm text-muted-foreground">{account}</div>}
        </div>
      </div>
      {status === "connected" ? (
        <div className="flex items-center">
          <Badge variant="outline" className="text-green-500 border-green-200 mr-2">Connected</Badge>
          <Button variant="outline" size="sm" onClick={onDisconnect}>Disconnect</Button>
        </div>
      ) : (
        <Button className="alchemy-gradient" onClick={onConnect}>Connect</Button>
      )}
    </div>
  );
};

export default IntegrationItem;
