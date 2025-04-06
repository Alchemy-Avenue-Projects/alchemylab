
import React from "react";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data for charts
const performanceData = [
  { name: 'Jan 1', facebook: 4000, instagram: 2400, google: 2400 },
  { name: 'Jan 8', facebook: 3000, instagram: 1398, google: 2210 },
  { name: 'Jan 15', facebook: 2000, instagram: 9800, google: 2290 },
  { name: 'Jan 22', facebook: 2780, instagram: 3908, google: 2000 },
  { name: 'Jan 29', facebook: 1890, instagram: 4800, google: 2181 },
  { name: 'Feb 5', facebook: 2390, instagram: 3800, google: 2500 },
  { name: 'Feb 12', facebook: 3490, instagram: 4300, google: 2100 },
];

const conversionData = [
  { name: 'Jan 1', value: 12 },
  { name: 'Jan 8', value: 19 },
  { name: 'Jan 15', value: 3 },
  { name: 'Jan 22', value: 5 },
  { name: 'Jan 29', value: 2 },
  { name: 'Feb 5', value: 3 },
  { name: 'Feb 12', value: 10 },
];

const channelData = [
  { name: 'Facebook', value: 400, color: '#4267B2' },
  { name: 'Instagram', value: 300, color: '#C13584' },
  { name: 'Google', value: 300, color: '#4285F4' },
  { name: 'LinkedIn', value: 200, color: '#0077B5' },
  { name: 'TikTok', value: 100, color: '#000000' },
];

const deviceData = [
  { name: 'Mobile', value: 400, color: '#7C3AED' },
  { name: 'Desktop', value: 300, color: '#3B82F6' },
  { name: 'Tablet', value: 150, color: '#EC4899' },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button className="alchemy-gradient">Generate Report</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Impressions"
          value="2.4M"
          change={12.3}
          positive={true}
        />
        <StatCard 
          title="Total Clicks"
          value="156K"
          change={8.5}
          positive={true}
        />
        <StatCard 
          title="Conversions"
          value="3,254"
          change={-3.2}
          positive={false}
        />
        <StatCard 
          title="Average CPA"
          value="$12.45"
          change={-5.8}
          positive={true}
        />
      </div>
      
      <Tabs defaultValue="performance">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <TabsList className="mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 mb-4">
            <Select defaultValue="all-platforms">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-platforms">All Platforms</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="google">Google Ads</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="all-campaigns">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-campaigns">All Campaigns</SelectItem>
                <SelectItem value="campaign-1">Summer Sale</SelectItem>
                <SelectItem value="campaign-2">Product Launch</SelectItem>
                <SelectItem value="campaign-3">Brand Awareness</SelectItem>
                <SelectItem value="campaign-4">Retargeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="performance" className="mt-0 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Ad Performance by Channel</CardTitle>
              <CardDescription>
                Compare performance metrics across different advertising platforms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="facebook"
                      stackId="1"
                      stroke="#4267B2"
                      fill="#4267B2"
                      opacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="instagram"
                      stackId="1"
                      stroke="#C13584"
                      fill="#C13584"
                      opacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="google"
                      stackId="1"
                      stroke="#4285F4"
                      fill="#4285F4"
                      opacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Detailed Analysis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversions" className="mt-0 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Conversions Over Time</CardTitle>
              <CardDescription>
                Track how your conversions have changed over the selected period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conversionData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" opacity={0.8} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Conversion Funnel
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="mt-0 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution by Channel</CardTitle>
                <CardDescription>
                  See how your budget is spent across different platforms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribution by Device</CardTitle>
                <CardDescription>
                  Understand which devices your audience is using.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, positive }) => {
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

export default Analytics;
