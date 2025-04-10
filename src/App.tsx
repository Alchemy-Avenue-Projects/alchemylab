
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Homepage from "@/pages/Homepage";  // Import Homepage
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Auth from "@/pages/Auth";
import OAuthCallback from "@/pages/OAuthCallback";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Campaigns from "@/pages/Campaigns";
import Analytics from "@/pages/Analytics";
import AIInsights from "@/pages/AIInsights";
import Creator from "@/pages/Creator";
import Media from "@/pages/Media";
import Notifications from "@/pages/Notifications";
import Team from "@/pages/Team";
import Settings from "@/pages/Settings";
import AnalyticsData from './pages/AnalyticsData';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,  // Use Homepage instead of Index
    errorElement: <NotFound />
  },
  {
    path: "/features",
    element: <Features />
  },
  {
    path: "/pricing",
    element: <Pricing />
  },
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/auth/callback",
    element: <OAuthCallback />
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: "campaigns",
        element: <Campaigns />
      },
      {
        path: "analytics",
        element: <Analytics />
      },
      {
        path: "analytics-data",
        element: <AnalyticsData />
      },
      {
        path: "ai-insights",
        element: <AIInsights />
      },
      {
        path: "creator",
        element: <Creator />
      },
      {
        path: "media",
        element: <Media />
      },
      {
        path: "notifications",
        element: <Notifications />
      },
      {
        path: "team",
        element: <Team />
      },
      {
        path: "settings",
        element: <Settings />
      }
    ]
  }
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;

