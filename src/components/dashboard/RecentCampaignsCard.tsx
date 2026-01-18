import { Card, Title, Badge } from "@tremor/react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with real data from campaigns table
const recentCampaigns = [
  {
    id: "1",
    name: "Summer Sale 2026",
    platform: "Meta",
    status: "active",
    spend: 2450,
    impressions: 125000,
    ctr: 2.4,
  },
  {
    id: "2",
    name: "Brand Awareness Q1",
    platform: "Google",
    status: "active",
    spend: 1890,
    impressions: 98000,
    ctr: 1.8,
  },
  {
    id: "3",
    name: "Product Launch - Widget Pro",
    platform: "LinkedIn",
    status: "paused",
    spend: 750,
    impressions: 42000,
    ctr: 3.1,
  },
  {
    id: "4",
    name: "Holiday Retargeting",
    platform: "Meta",
    status: "completed",
    spend: 3200,
    impressions: 210000,
    ctr: 2.9,
  },
];

const statusColors: Record<string, "emerald" | "yellow" | "gray"> = {
  active: "emerald",
  paused: "yellow",
  completed: "gray",
};

const platformColors: Record<string, string> = {
  Meta: "bg-blue-100 text-blue-800",
  Google: "bg-red-100 text-red-800",
  LinkedIn: "bg-sky-100 text-sky-800",
  TikTok: "bg-gray-100 text-gray-800",
};

export function RecentCampaignsCard() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Title>Recent Campaigns</Title>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          View All
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="pb-2 font-medium">Campaign</th>
              <th className="pb-2 font-medium">Platform</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Spend</th>
              <th className="pb-2 font-medium text-right">Impressions</th>
              <th className="pb-2 font-medium text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            {recentCampaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-3">
                  <span className="font-medium">{campaign.name}</span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[campaign.platform]}`}>
                    {campaign.platform}
                  </span>
                </td>
                <td className="py-3">
                  <Badge color={statusColors[campaign.status]} size="sm">
                    {campaign.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">${campaign.spend.toLocaleString()}</td>
                <td className="py-3 text-right">{(campaign.impressions / 1000).toFixed(0)}K</td>
                <td className="py-3 text-right">{campaign.ctr}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
