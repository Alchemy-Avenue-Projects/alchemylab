import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import AISuggestionsList from "@/components/dashboard/AISuggestionsList";

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
          <PerformanceOverview />
          <RecentCampaigns />
          <TopPerformers />
        </div>

        <div className="space-y-6">
          <AISuggestionsList />
          <UpcomingTasks />
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
