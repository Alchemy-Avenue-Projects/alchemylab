
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCampaigns } from "@/hooks/useCampaigns";

const AnalyticsData: React.FC = () => {

  const [reportTitle, setReportTitle] = useState("Analytics Report");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const {
    analyticsData,
    isLoading,
    error,
    filters,
    setFilters,
    generateReport,
    refetch
  } = useAnalytics();

  const { campaigns, isLoading: isLoadingCampaigns } = useCampaigns();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setFilters({
        ...filters,
        dateRange: {
          startDate: range.from,
          endDate: range.to
        }
      });
    }
  };

  const handlePlatformChange = (platform: string) => {
    setFilters({
      ...filters,
      platform
    });
  };

  const handleCampaignChange = (campaignId: string) => {
    setFilters({
      ...filters,
      campaignId: campaignId === "all-campaigns" ? null : campaignId
    });
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const result = await generateReport(reportTitle);
      if (result) {
        toast.success("Your report has been generated and saved.");
      } else {
        throw new Error("Failed to generate report");
      }
    } catch (error) {
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatData = () => {
    if (!analyticsData) return [];

    interface GroupedData {
      date: string;
      ctr: number;
      impressions: number;
      clicks: number;
      conversions: number;
      cost: number;
      revenue: number;
    }

    // Group data by date
    const groupedByDate = analyticsData.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          ctr: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          cost: 0,
          revenue: 0
        };
      }

      // Sum metrics
      acc[date].impressions += item.impressions || 0;
      acc[date].clicks += item.clicks || 0;
      acc[date].ctr = acc[date].impressions > 0 ? (acc[date].clicks / acc[date].impressions) * 100 : 0;
      acc[date].conversions += item.conversions || 0;
      acc[date].cost += item.cost || 0;
      acc[date].revenue += item.revenue || 0;

      return acc;
    }, {} as Record<string, GroupedData>);

    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const formattedData = formatData();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold">Analytics</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was an error loading the analytics data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            date={{
              from: filters.dateRange.startDate,
              to: filters.dateRange.endDate
            }}
            onDateChange={handleDateRangeChange}
          />
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            className="alchemy-gradient"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || !analyticsData || analyticsData.length === 0}
          >
            {isGeneratingReport ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <Select
            value={filters.platform}
            onValueChange={handlePlatformChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-platforms">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="google">Google Ads</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            value={filters.campaignId || "all-campaigns"}
            onValueChange={handleCampaignChange}
            disabled={isLoadingCampaigns}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-campaigns">All Campaigns</SelectItem>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                CTR and impressions over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : formattedData.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No data available for the selected filters.</p>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), "MMM d")}
                      />
                      <YAxis
                        yAxisId="left"
                        tickFormatter={(value) => `${value.toFixed(2)}%`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "ctr") return [`${Number(value).toFixed(2)}%`, "CTR"];
                          if (name === "impressions") return [value, "Impressions"];
                          return [value, name];
                        }}
                        labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ctr"
                        name="CTR"
                        stroke="#8884d8"
                        yAxisId="left"
                      />
                      <Line
                        type="monotone"
                        dataKey="impressions"
                        name="Impressions"
                        stroke="#82ca9d"
                        yAxisId="right"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversions</CardTitle>
              <CardDescription>
                Conversion metrics over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : formattedData.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No data available for the selected filters.</p>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), "MMM d")}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                      />
                      <Legend />
                      <Bar
                        dataKey="conversions"
                        name="Conversions"
                        fill="#8b5cf6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Cost</CardTitle>
              <CardDescription>
                Revenue and cost metrics over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : formattedData.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No data available for the selected filters.</p>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), "MMM d")}
                      />
                      <YAxis
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                        labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        fill="#3b82f6"
                        stroke="#3b82f6"
                        fillOpacity={0.8}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        name="Cost"
                        fill="#ef4444"
                        stroke="#ef4444"
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsData;
