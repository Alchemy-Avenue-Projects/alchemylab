import { Card, Title, AreaChart, TabGroup, TabList, Tab, TabPanels, TabPanel } from "@tremor/react";
import { useState } from "react";

// Mock data - will be replaced with real data from analytics_snapshots
const performanceData = [
  { date: "Jan 1", Spend: 1200, Impressions: 45000, Clicks: 890, Conversions: 45 },
  { date: "Jan 2", Spend: 1350, Impressions: 52000, Clicks: 1020, Conversions: 52 },
  { date: "Jan 3", Spend: 1100, Impressions: 41000, Clicks: 780, Conversions: 38 },
  { date: "Jan 4", Spend: 1450, Impressions: 58000, Clicks: 1150, Conversions: 61 },
  { date: "Jan 5", Spend: 1600, Impressions: 63000, Clicks: 1280, Conversions: 72 },
  { date: "Jan 6", Spend: 1380, Impressions: 54000, Clicks: 1050, Conversions: 55 },
  { date: "Jan 7", Spend: 1520, Impressions: 59000, Clicks: 1180, Conversions: 63 },
];

const valueFormatter = (number: number, type: string) => {
  if (type === "currency") {
    return `$${Intl.NumberFormat("us").format(number)}`;
  }
  return Intl.NumberFormat("us").format(number);
};

export function PerformanceOverviewChart() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const metrics = [
    { name: "Spend", color: "indigo", type: "currency" },
    { name: "Impressions", color: "cyan", type: "number" },
    { name: "Clicks", color: "amber", type: "number" },
    { name: "Conversions", color: "emerald", type: "number" },
  ];

  const selectedMetric = metrics[selectedIndex];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Title>Performance Overview</Title>
        <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
          <TabList variant="solid" className="w-fit">
            <Tab>Spend</Tab>
            <Tab>Impressions</Tab>
            <Tab>Clicks</Tab>
            <Tab>Conversions</Tab>
          </TabList>
        </TabGroup>
      </div>
      
      <AreaChart
        className="h-72 mt-4"
        data={performanceData}
        index="date"
        categories={[selectedMetric.name]}
        colors={[selectedMetric.color]}
        valueFormatter={(value) => valueFormatter(value, selectedMetric.type)}
        showLegend={false}
        showGridLines={true}
        curveType="monotone"
      />

      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Spend</p>
          <p className="text-xl font-semibold">$9,600</p>
          <p className="text-xs text-green-600">+12.3%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Impressions</p>
          <p className="text-xl font-semibold">372K</p>
          <p className="text-xs text-green-600">+8.7%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Clicks</p>
          <p className="text-xl font-semibold">7,350</p>
          <p className="text-xs text-green-600">+15.2%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Conversions</p>
          <p className="text-xl font-semibold">386</p>
          <p className="text-xs text-green-600">+22.1%</p>
        </div>
      </div>
    </Card>
  );
}
