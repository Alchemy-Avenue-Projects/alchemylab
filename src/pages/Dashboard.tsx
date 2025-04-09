
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardAlerts from "@/components/dashboard/DashboardAlerts";
import { AISuggestionsList } from "@/components/dashboard/AISuggestionsList";

// Temporary placeholder component
const PlaceholderCard = ({ title }: { title: string }) => (
  <div className="rounded-lg border bg-card p-4">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">This component will be implemented soon.</p>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button className="alchemy-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      <DashboardAlerts />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PlaceholderCard title="Performance Overview" />
          <PlaceholderCard title="Recent Campaigns" />
          <PlaceholderCard title="Top Performers" />
        </div>

        <div className="space-y-6">
          <AISuggestionsList />
          <PlaceholderCard title="Upcoming Tasks" />
          <PlaceholderCard title="Quick Actions" />
          <PlaceholderCard title="Recent Activity" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
