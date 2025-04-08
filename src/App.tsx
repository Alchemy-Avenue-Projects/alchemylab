
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
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

// Marketing website pages
import LandingLayout from "@/components/layout/LandingLayout";
import Homepage from "@/pages/Homepage";
import Pricing from "@/pages/Pricing";
import Features from "@/pages/Features";
import Auth from "@/pages/Auth";
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

// Route guard for authenticated routes
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

// Redirect authenticated users away from public routes
function RedirectIfAuthenticated({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/app" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Marketing Pages wrapped with LandingLayout */}
      <Route element={
        <RedirectIfAuthenticated>
          <LandingLayout>
            <Outlet />
          </LandingLayout>
        </RedirectIfAuthenticated>
      }>
        <Route path="/" element={<Homepage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
      </Route>
      
      <Route path="/auth" element={
        <RedirectIfAuthenticated>
          <Auth />
        </RedirectIfAuthenticated>
      } />
      
      {/* App Pages - Protected by authentication */}
      <Route path="/app" element={
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai-insights" element={<AIInsights />} />
        <Route path="media" element={<Media />} />
        <Route path="creator" element={<Creator />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
