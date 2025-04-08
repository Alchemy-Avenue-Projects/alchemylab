
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Campaigns from "@/pages/Campaigns";
import Analytics from "@/pages/Analytics";
import AIInsights from "@/pages/AIInsights";
import Media from "@/pages/Media";
import Creator from "@/pages/Creator";
import Notifications from "@/pages/Notifications";
import Team from "@/pages/Team";
import Settings from "@/pages/Settings";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/ai-insights" element={<AIInsights />} />
                <Route path="/media" element={<Media />} />
                <Route path="/creator" element={<Creator />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/team" element={<Team />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
