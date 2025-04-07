
import React from "react";
import { AlertCircle, ArrowUpRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdAccount, AnalyticsSnapshot, Campaign } from "@/types/database";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface DashboardAlertsProps {
  lowCtrCampaigns: AnalyticsSnapshot[];
  staleAccounts: AdAccount[];
  campaigns: (Campaign & { ad_accounts: AdAccount })[];
}

const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ 
  lowCtrCampaigns, 
  staleAccounts,
  campaigns
}) => {
  // No alerts to show
  if (lowCtrCampaigns.length === 0 && staleAccounts.length === 0) {
    return null;
  }

  // Find campaign names for the low CTR campaigns
  const campaignMap = campaigns.reduce<Record<string, Campaign & { ad_accounts: AdAccount }>>(
    (acc, campaign) => {
      acc[campaign.id] = campaign;
      return acc;
    }, 
    {}
  );

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
          Alerts Requiring Attention
        </CardTitle>
        <CardDescription>
          Issues that might need your attention to improve performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowCtrCampaigns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Low-Performing Campaigns</h4>
            <div className="space-y-2">
              {lowCtrCampaigns.map((snapshot) => {
                const campaign = campaignMap[snapshot.campaign_id!];
                return campaign ? (
                  <div key={snapshot.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="mr-2 text-xs">
                          CTR: {snapshot.ctr}%
                        </Badge>
                        <span>Last updated: {format(new Date(snapshot.date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/campaigns`} className="flex items-center">
                        <span className="mr-1">View</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
        
        {staleAccounts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Accounts Needing Reconnection</h4>
            <div className="space-y-2">
              {staleAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Badge className="mr-2 capitalize text-xs">
                        {account.platform}
                      </Badge>
                      <span>Last connected: {format(new Date(account.connected_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reconnect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardAlerts;
