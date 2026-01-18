import { Card, Title, BarList, Flex, Text } from "@tremor/react";

// Mock data - will be replaced with real data from ads/campaigns tables
const topPerformers = [
  { name: "Summer Sale Banner A", value: 4.2, platform: "Meta" },
  { name: "Product Demo Video", value: 3.8, platform: "Meta" },
  { name: "Retargeting Carousel", value: 3.5, platform: "Meta" },
  { name: "Brand Search Campaign", value: 3.2, platform: "Google" },
  { name: "Industry Thought Leadership", value: 2.9, platform: "LinkedIn" },
];

const formatValue = (value: number) => `${value}% CTR`;

export function TopPerformersCard() {
  return (
    <Card className="p-4">
      <Title>Top Performers</Title>
      <Text className="text-muted-foreground mt-1">By click-through rate this week</Text>
      
      <Flex className="mt-4">
        <Text className="text-sm font-medium">Ad Creative</Text>
        <Text className="text-sm font-medium">CTR</Text>
      </Flex>
      
      <BarList
        data={topPerformers}
        valueFormatter={formatValue}
        className="mt-2"
        color="indigo"
      />
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Average CTR</span>
          <span className="font-medium">3.5%</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-muted-foreground">Industry Benchmark</span>
          <span className="font-medium text-green-600">+1.2% above</span>
        </div>
      </div>
    </Card>
  );
}
