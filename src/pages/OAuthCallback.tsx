import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { parseOAuthRedirect } from '@/services/platforms/oauth';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Decode state parameter to extract platform and other info
const decodeState = (state: string): { platform?: string; userId?: string; jwt?: string; nonce?: string } | null => {
  try {
    const decoded = JSON.parse(atob(decodeURIComponent(state)));
    return decoded;
  } catch {
    return null;
  }
};

// Map platform to its edge function name
const getEdgeFunctionName = (platform: string): string => {
  const functionMap: Record<string, string> = {
    facebook: 'facebook-oauth-callback',
    google: 'google-oauth-callback',
    tiktok: 'tiktok-oauth-callback',
    google_analytics: 'ga4-oauth-callback',
    linkedin: 'oauth-callback', // fallback to generic
  };
  return functionMap[platform] || 'oauth-callback';
};

const OAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your connection...');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { provider } = useParams<{ provider: string }>();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the code and state from URL params
        const { code, state, error } = parseOAuthRedirect();
        
        console.log('[OAuthCallback] Received:', { 
          code: code ? `${code.substring(0, 10)}...` : 'missing',
          state: state ? `${state.substring(0, 20)}...` : 'missing',
          error,
          provider
        });
        
        if (error) {
          setStatus('error');
          setMessage(`Authentication error: ${error}`);
          toast.error('Authentication error', { description: error });
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Invalid callback parameters.');
          toast.error('Connection failed', { description: 'No authorization code found in the URL' });
          return;
        }

        if (!state) {
          setStatus('error');
          setMessage('Missing state parameter.');
          toast.error('Connection failed', { description: 'Missing state information' });
          return;
        }

        // Decode state to get platform info
        const decodedState = decodeState(state);
        
        // For new OAuth flow, state is base64 JSON. For old flow, state might be platform name
        const platform = provider || (decodedState ? 
          (state.includes('facebook') ? 'facebook' : 
           state.includes('google') ? 'google' : 
           state.includes('tiktok') ? 'tiktok' : 'unknown') : state);

        // Try to determine platform from URL path if not in state
        const urlPlatform = window.location.pathname.split('/').find(p => 
          ['facebook', 'google', 'tiktok', 'linkedin', 'google_analytics'].includes(p)
        );
        
        const finalPlatform = urlPlatform || provider || 'facebook'; // Default to facebook for now
        
        console.log('[OAuthCallback] Determined platform:', finalPlatform);

        // Call the platform-specific edge function
        // The edge function handles token exchange AND database storage
        const edgeFunctionName = getEdgeFunctionName(finalPlatform);
        console.log(`[OAuthCallback] Calling edge function: ${edgeFunctionName}`);
        
        // Build redirectUri - must match what was used in OAuth initiation
        const redirectUri = `${window.location.origin}/oauth/callback`;
        
        const { data, error: exchangeError } = await supabase.functions.invoke(edgeFunctionName, {
          body: { code, state, redirectUri }
        });

        if (exchangeError) {
          console.error('[OAuthCallback] Edge function error:', exchangeError);
          throw new Error(exchangeError.message || 'Failed to exchange authorization code');
        }

        if (!data?.success) {
          const errorMsg = data?.error || data?.message || 'Connection failed';
          throw new Error(errorMsg);
        }

        console.log('[OAuthCallback] Success:', data);

        // Edge function already saved to database, just show success
        setStatus('success');
        setMessage(`Successfully connected to ${finalPlatform}!`);
        toast.success('Connection successful', {
          description: `Successfully connected to ${finalPlatform}`
        });
        
        // Redirect back to settings
        setTimeout(() => {
          navigate('/app/settings?tab=integrations&success=' + finalPlatform);
        }, 1500);
      } catch (err: any) {
        console.error('[OAuthCallback] Error:', err);
        setStatus('error');
        setMessage(err.message || 'Failed to complete the connection process. Please try again.');
        toast.error('Connection failed', {
          description: err.message || 'An unexpected error occurred'
        });
      }
    };

    handleOAuthCallback();
  }, [navigate, profile, provider]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'loading' ? 'Connecting Platform' : 
             status === 'success' ? 'Connection Successful' : 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {status === 'loading' && (
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          )}
          <p className="text-center">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
