
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
              {/* Public Routes */}
              <Route path="/" element={<div>Home Page</div>} />
              
              {/* App Routes */}
              <Route path="/app">
                <Route index element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
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
