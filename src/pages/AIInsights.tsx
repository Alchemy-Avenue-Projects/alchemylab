
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAILearnings } from "@/hooks/useAILearnings";
import { ArrowRight, Lightbulb, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

const AIInsights: React.FC = () => {
  const [scope, setScope] = useState("all");
  const [insightType, setInsightType] = useState("all");
  
  const { useLearnings } = useAILearnings();
  const { data: insights, isLoading, error } = useLearnings({ scope, insightType });

  const renderInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-8 w-8 text-green-500" />;
      case "negative":
        return <TrendingDown className="h-8 w-8 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-8 w-8 text-amber-500" />;
      case "improvement":
        return <CheckCircle className="h-8 w-8 text-blue-500" />;
      default:
        return <Lightbulb className="h-8 w-8 text-primary" />;
    }
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case "global":
        return "Global Insight";
      case "organization":
        return "Organization";
      case "client":
        return "Client-Specific";
      default:
        return scope;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">AI Insights</h1>
        <div className="flex items-center space-x-2">
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Scopes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
          <Select value={insightType} onValueChange={setInsightType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Insights</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Insights</TabsTrigger>
          <TabsTrigger value="ads">Ad Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>
                      Failed to load AI insights. Please try again.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>Retry</Button>
                  </CardContent>
                </Card>
              </div>
            ) : insights?.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardHeader>
                    <CardTitle>No Insights Found</CardTitle>
                    <CardDescription>
                      There are no AI insights matching your current filters.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => {
                      setScope("all");
                      setInsightType("all");
                    }}>Clear Filters</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              insights?.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{insight.insight_type.charAt(0).toUpperCase() + insight.insight_type.slice(1)} Insight</CardTitle>
                        <CardDescription>
                          {format(new Date(insight.created_at), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <div>
                        {renderInsightIcon(insight.insight_type)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{insight.description}</p>
                    {insight.learned_from_campaign_id && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Campaign: {insight.campaigns?.name || "Unknown"}
                        </Badge>
                      </div>
                    )}
                    {insight.learned_from_ad_id && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Ad: {insight.ads?.headline || "Unknown Ad"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Badge variant="secondary" className="text-xs">
                      {getScopeLabel(insight.scope)}
                    </Badge>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="campaigns" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              insights?.filter(insight => insight.learned_from_campaign_id)
                .map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{insight.insight_type.charAt(0).toUpperCase() + insight.insight_type.slice(1)} Insight</CardTitle>
                          <CardDescription>
                            {format(new Date(insight.created_at), "MMM d, yyyy")}
                          </CardDescription>
                        </div>
                        <div>
                          {renderInsightIcon(insight.insight_type)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{insight.description}</p>
                      {insight.learned_from_campaign_id && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Campaign: {insight.campaigns?.name || "Unknown"}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Badge variant="secondary" className="text-xs">
                        {getScopeLabel(insight.scope)}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="ads" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              insights?.filter(insight => insight.learned_from_ad_id)
                .map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{insight.insight_type.charAt(0).toUpperCase() + insight.insight_type.slice(1)} Insight</CardTitle>
                          <CardDescription>
                            {format(new Date(insight.created_at), "MMM d, yyyy")}
                          </CardDescription>
                        </div>
                        <div>
                          {renderInsightIcon(insight.insight_type)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{insight.description}</p>
                      {insight.learned_from_ad_id && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Ad: {insight.ads?.headline || "Unknown Ad"}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Badge variant="secondary" className="text-xs">
                        {getScopeLabel(insight.scope)}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsights;
