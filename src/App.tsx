
import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import { PlatformsProvider } from './contexts/PlatformsContext';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import OAuthCallback from './pages/OAuthCallback';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/api/AuthCallback';
import { Toaster as SonnerToaster } from "./components/ui/sonner";
import AppLayout from '@/components/layout/AppLayout';
import Homepage from './pages/Homepage';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Campaigns from './pages/Campaigns';
import AIInsights from './pages/AIInsights';
import Media from './pages/Media';
import Creator from './pages/Creator';
import Notifications from './pages/Notifications';
import Features from './pages/Features';
import Pricing from './pages/Pricing';

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PlatformsProvider>
            <Toaster />
            <SonnerToaster />
            <Routes>
              {/* Landing Routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              
              {/* App Routes */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="ai-insights" element={<AIInsights />} />
                <Route path="media" element={<Media />} />
                <Route path="creator" element={<Creator />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="team" element={<Team />} />
              </Route>

              {/* OAuth Callback */}
              <Route path="/oauth/callback" element={<OAuthCallback />} />

              {/* Catch All - 404 */}
              <Route path="*" element={<NotFound />} />
              
              {/* Add new API route handling */}
              <Route path="/api/auth/callback/:provider" element={<AuthCallback />} />
            </Routes>
          </PlatformsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

