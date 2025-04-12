import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from "@/components/ui/use-toast"
import { OrganizationProvider } from './contexts/OrganizationContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { PlatformsProvider } from './contexts/PlatformsContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import OAuthCallback from './pages/OAuthCallback';
import AuthRequired from './components/AuthRequired';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import ComingSoon from './pages/ComingSoon';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Logout from './pages/Logout';
import AdAccount from './pages/AdAccount';
import AuthCallback from './pages/api/AuthCallback';

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
        <ThemeProvider
          defaultTheme="system"
          storageKey="alchemy-theme"
        >
          <ToastProvider>
            <AuthProvider>
              <OrganizationProvider>
                <ProfileProvider>
                  <PlatformsProvider>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<PublicLayout />}>
                        <Route index element={<ComingSoon />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="pricing" element={<Pricing />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />
                        <Route path="reset-password" element={<ResetPassword />} />
                        <Route path="verify-email" element={<VerifyEmail />} />
                        <Route path="logout" element={<Logout />} />
                      </Route>

                      {/* App Routes */}
                      <Route path="/app" element={<AuthRequired><AppLayout /></AuthRequired>}>
                        <Route index element={<Dashboard />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="ad-account/:id" element={<AdAccount />} />
                      </Route>

                      {/* OAuth Callback */}
                      <Route path="/oauth/callback" element={<OAuthCallback />} />

                      {/* Catch All - 404 */}
                      <Route path="*" element={<NotFound />} />
                      
                      {/* Add new API route handling */}
                      <Route path="/api/auth/callback/:provider" element={<AuthCallback />} />
                    </Routes>
                  </PlatformsProvider>
                </ProfileProvider>
              </OrganizationProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
