import React from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  LineChart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardAlerts from "@/components/dashboard/DashboardAlerts";
import AISuggestionCard from "@/components/dashboard/AISuggestionCard";
import { useQueryClient } from "@tanstack/react-query";

const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { 
    suggestionOfTheDay,
    activeCampaigns,
    campaignAnalytics,
    alerts,
    isSuggestionLoading,
    isCampaignsLoading,
    isAnalyticsLoading,
    accountsData
  } = useDashboardData();

  const refreshSuggestions = () => {
    queryClient.invalidateQueries({ queryKey: ["ai-suggestion-of-the-day"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Last 30 days</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>Yesterday</DropdownMenuItem>
              <DropdownMenuItem>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem>This month</DropdownMenuItem>
              <DropdownMenuItem>Last month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="alchemy-gradient">Download Report</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Spend"
          value="$12,543.21"
          change={8.2}
          positive={true}
          isLoading={isAnalyticsLoading}
        />
        <StatCard 
          title="Total Conversions"
          value="1,823"
          change={-2.1}
          positive={false}
          isLoading={isAnalyticsLoading}
        />
        <StatCard 
          title="Average CPA"
          value="$6.88"
          change={-12.5}
          positive={true}
          isLoading={isAnalyticsLoading}
        />
        <StatCard 
          title="CTR"
          value="2.4%"
          change={0.5}
          positive={true}
          isLoading={isAnalyticsLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {isSuggestionLoading ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Suggestion of the Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-24 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-alchemy-600 border-t-transparent rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ) : suggestionOfTheDay ? (
            <AISuggestionCard 
              suggestion={suggestionOfTheDay} 
              onSuggestionUpdate={refreshSuggestions}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <LineChart className="h-4 w-4 mr-2 text-alchemy-600" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No AI suggestions available at the moment. As your campaigns gather more data, 
                  AlchemyLab will analyze performance and provide optimization recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <DashboardAlerts 
            lowCtrCampaigns={alerts.lowCtrCampaigns}
            staleAccounts={alerts.staleAccounts || []}
            campaigns={activeCampaigns}
          />
        </div>
      </div>
      
      <Tabs defaultValue="accounts">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="accounts">Ad Accounts</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AdAccountCard 
              title="Facebook Ads"
              accountName="Marketing Agency"
              status="Connected"
              icon={<Facebook className="text-blue-600" />}
              metrics={{
                spend: "$5,432.10",
                impressions: "1.2M",
                clicks: "45.3K"
              }}
            />
            <AdAccountCard 
              title="LinkedIn Ads"
              accountName="Marketing Agency"
              status="Connected"
              icon={<Linkedin className="text-blue-700" />}
              metrics={{
                spend: "$3,210.45",
                impressions: "320K",
                clicks: "12.1K"
              }}
            />
            <AdAccountCard 
              title="Instagram Ads"
              accountName="Marketing Agency"
              status="Connected"
              icon={<Instagram className="text-pink-600" />}
              metrics={{
                spend: "$2,876.32",
                impressions: "950K",
                clicks: "38.7K"
              }}
            />
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 h-full min-h-[200px]">
              <Button variant="ghost" className="h-12 w-12 rounded-full">
                <Plus className="h-6 w-6" />
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">Connect New Ad Account</p>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns" className="animate-fade-in">
          <div className="grid grid-cols-1 gap-4">
            <CampaignCard 
              title="Summer Sale Promotion"
              platform="Facebook"
              status="Active"
              spent="$2,134.50"
              budget="$5,000"
              performance={85}
              metrics={{
                impressions: "650K",
                clicks: "23.4K",
                conversions: "342",
                cpa: "$6.24"
              }}
            />
            <CampaignCard 
              title="Product Launch"
              platform="LinkedIn"
              status="Active"
              spent="$1,876.25"
              budget="$3,000"
              performance={62}
              metrics={{
                impressions: "210K",
                clicks: "8.2K",
                conversions: "124",
                cpa: "$15.13"
              }}
            />
            <CampaignCard 
              title="Brand Awareness"
              platform="Instagram"
              status="Paused"
              spent="$987.50"
              budget="$2,500"
              performance={39}
              metrics={{
                impressions: "420K",
                clicks: "18.7K",
                conversions: "92",
                cpa: "$10.73"
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecommendationCard 
              title="Budget Reallocation"
              description="Your Facebook campaign 'Summer Sale' is performing 32% better than other campaigns. Consider reallocating budget from underperforming campaigns."
              impact="High"
              platform="Facebook"
              icon={<TrendingUp />}
            />
            <RecommendationCard 
              title="Ad Creative Fatigue"
              description="Your 'Product Launch' ad set is showing signs of creative fatigue with CTR dropping 18% in the last week. Consider refreshing creatives."
              impact="Medium"
              platform="LinkedIn"
              icon={<SearchX />}
            />
            <RecommendationCard 
              title="Audience Targeting"
              description="Expanding your Instagram audience targeting to include 'Small Business Owners' could increase your reach by 45% based on similar campaign performance."
              impact="Medium"
              platform="Instagram"
              icon={<MousePointerClick />}
            />
            <RecommendationCard 
              title="Ad Copy Improvement"
              description="Our AI analysis suggests your LinkedIn ad copy could be optimized for better conversion. Try our AI-generated alternative."
              impact="High"
              platform="LinkedIn"
              icon={<Lightbulb />}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  positive: boolean;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, positive, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 flex items-center">
            <div className="animate-pulse bg-muted/50 h-6 w-20 rounded"></div>
          </div>
          <div className="flex items-center mt-1">
            <div className="animate-pulse bg-muted/50 h-4 w-12 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          <span className={`flex items-center text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
            {positive ? (
              <ArrowUpRight className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">vs previous period</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface AdAccountCardProps {
  title: string;
  accountName: string;
  status: "Connected" | "Disconnected" | "Issue";
  icon: React.ReactNode;
  metrics: {
    spend: string;
    impressions: string;
    clicks: string;
  };
}

const AdAccountCard: React.FC<AdAccountCardProps> = ({ title, accountName, status, icon, metrics }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{accountName}</CardDescription>
            </div>
          </div>
          <Badge variant={status === "Connected" ? "outline" : "destructive"} className={status === "Connected" ? "text-green-500 border-green-200" : ""}>
            {status === "Connected" && <BadgeCheck className="h-3 w-3 mr-1" />}
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Spend</span>
            <span className="font-medium">{metrics.spend}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Impressions</span>
            <span className="font-medium">{metrics.impressions}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Clicks</span>
            <span className="font-medium">{metrics.clicks}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" className="w-full text-sm">View Details</Button>
      </CardFooter>
    </Card>
  );
};

interface CampaignCardProps {
  title: string;
  platform: string;
  status: "Active" | "Paused" | "Completed";
  spent: string;
  budget: string;
  performance: number;
  metrics: {
    impressions: string;
    clicks: string;
    conversions: string;
    cpa: string;
  };
}

const CampaignCard: React.FC<CampaignCardProps> = ({ title, platform, status, spent, budget, performance, metrics }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{platform}</CardDescription>
          </div>
          <Badge variant={status === "Active" ? "outline" : status === "Paused" ? "secondary" : "default"} 
            className={status === "Active" ? "text-green-500 border-green-200" : ""}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Budget spent: {spent}</span>
              <span>Total: {budget}</span>
            </div>
            <Progress value={performance} className="h-2" />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Impressions</span>
              <span className="font-medium">{metrics.impressions}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Clicks</span>
              <span className="font-medium">{metrics.clicks}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Conversions</span>
              <span className="font-medium">{metrics.conversions}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">CPA</span>
              <span className="font-medium">{metrics.cpa}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button variant="ghost" className="flex-1 text-sm">Edit</Button>
        <Button variant="outline" className="flex-1 text-sm">View Details</Button>
      </CardFooter>
    </Card>
  );
};

interface RecommendationCardProps {
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  platform: string;
  icon: React.ReactNode;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ title, description, impact, platform, icon }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-alchemy-100 text-alchemy-600 flex items-center justify-center">
              {icon}
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={
              impact === "High" 
                ? "text-red-500 border-red-200" 
                : impact === "Medium" 
                  ? "text-amber-500 border-amber-200" 
                  : "text-green-500 border-green-200"
            }
          >
            {impact} Impact
          </Badge>
        </div>
        <CardDescription className="mt-2">{platform}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{description}</p>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button variant="ghost" className="flex-1 text-sm">Dismiss</Button>
        <Button className="flex-1 text-sm alchemy-gradient">Apply</Button>
      </CardFooter>
    </Card>
  );
};

export default Dashboard;
