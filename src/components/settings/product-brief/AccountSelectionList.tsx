
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlatformConnection } from "@/types/platforms";

interface AccountSelectionListProps {
  connections: PlatformConnection[];
  selectedAccounts: string[];
  productIndex: number;
  onAccountToggle: (productIndex: number, accountId: string) => void;
  onSelectAll: (productIndex: number, select: boolean) => void;
}

const AccountSelectionList: React.FC<AccountSelectionListProps> = ({
  connections,
  selectedAccounts,
  productIndex,
  onAccountToggle,
  onSelectAll,
}) => {
  // Filter connections to only include ad platforms
  const adConnections = connections.filter(conn => 
    ['facebook', 'google', 'linkedin', 'tiktok'].includes(conn.platform)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Apply to Ad Accounts</Label>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSelectAll(productIndex, true)}
            disabled={adConnections.length === 0}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSelectAll(productIndex, false)}
            disabled={adConnections.length === 0 || selectedAccounts.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="grid gap-3">
        {adConnections && adConnections.length > 0 ? (
          adConnections.map(connection => (
            <div key={connection.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`${productIndex}-${connection.id}`}
                checked={selectedAccounts.includes(connection.id)}
                onCheckedChange={() => onAccountToggle(productIndex, connection.id)}
              />
              <label 
                htmlFor={`${productIndex}-${connection.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {connection.account_name || connection.platform} {connection.platform && `(${connection.platform})`}
              </label>
            </div>
          ))
        ) : (
          <Alert variant="warning" className="bg-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-muted-foreground">
              No ad accounts connected. Connect accounts in the Integrations tab.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AccountSelectionList;
