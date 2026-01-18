import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PlatformsProvider } from '@/contexts/PlatformsContext';
import App from './App.tsx';
import './index.css';

// Initialize Sentry for production error tracking
// Run: npm install @sentry/react (if not already installed)
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: 'production',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: true }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
    });
  }).catch(() => {
    console.warn('Sentry not available - install @sentry/react for error tracking');
  });
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <PlatformsProvider>
          <App />
        </PlatformsProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

