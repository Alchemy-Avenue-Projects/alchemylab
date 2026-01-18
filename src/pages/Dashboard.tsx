import React, { useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardAlerts from "@/components/dashboard/DashboardAlerts";
import { AISuggestionsList } from "@/components/dashboard/AISuggestionsList";
import { PerformanceOverviewChart } from "@/components/dashboard/PerformanceOverviewChart";
import { RecentCampaignsCard } from "@/components/dashboard/RecentCampaignsCard";
import { TopPerformersCard } from "@/components/dashboard/TopPerformersCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Placeholder for components not yet implemented
const PlaceholderCard = ({ title }: { title: string }) => (
  <div className="rounded-lg border bg-card p-4">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">Coming soon</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Check for auth and redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Please log in to access the dashboard", {
        description: "You need to be logged in to view this page."
      });
      navigate("/auth?mode=login");
    }
    
    // Check for pending OAuth flow
    const pendingCode = sessionStorage.getItem('pendingOAuthCode');
    const pendingPlatform = sessionStorage.getItem('pendingOAuthPlatform');
    
    if (user && pendingCode && pendingPlatform) {
      sessionStorage.removeItem('pendingOAuthCode');
      sessionStorage.removeItem('pendingOAuthPlatform');
      
      toast.info("Resuming platform connection", {
        description: `Continuing with your ${pendingPlatform} connection...`
      });
      
      // Navigate to the appropriate platform callback
      setTimeout(() => {
        navigate(`/api/auth/callback/${pendingPlatform}?code=${pendingCode}&state=${pendingPlatform}`);
      }, 1000);
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
          <PerformanceOverviewChart />
          <RecentCampaignsCard />
        </div>

        <div className="space-y-6">
          <TopPerformersCard />
          <AISuggestionsList />
          <PlaceholderCard title="Quick Actions" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
