
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { parseOAuthRedirect } from '@/services/platforms/oauth';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
        
        const platform = state || provider || '';
        
        console.log('OAuth callback received:', { 
          code: code ? `${code.substring(0, 5)}...` : 'missing', 
          platform,
          error 
        });
        
        if (error) {
          setStatus('error');
          setMessage(`Authentication error: ${error}`);
          toast.error('Authentication error', {
            description: error
          });
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Invalid callback parameters.');
          toast.error('Connection failed', {
            description: 'No authorization code found in the URL'
          });
          return;
        }

        if (!platform) {
          setStatus('error');
          setMessage('Missing platform information.');
          toast.error('Connection failed', {
            description: 'No platform information found in the URL'
          });
          return;
        }

        if (!profile?.organization_id) {
          setStatus('error');
          setMessage('You need to be logged in to connect platforms.');
          toast.error('Authentication required', {
            description: 'You need to be logged in to connect platforms'
          });
          return;
        }

        // Call the edge function to exchange the code for tokens
        console.log(`Calling oauth-callback function for platform: ${platform}`);
        const { data, error: exchangeError } = await supabase.functions.invoke('oauth-callback', {
          body: {
            code,
            platform,
            redirectUri: `${window.location.origin}/oauth/callback`
          }
        });

        if (exchangeError) {
          console.error('OAuth edge function error:', exchangeError);
          throw new Error(exchangeError.message || 'Failed to exchange authorization code');
        }

        if (!data) {
          throw new Error('No data returned from OAuth callback function');
        }

        console.log('OAuth callback successful:', { 
          accessToken: data.accessToken ? 'present' : 'missing',
          platform 
        });

        // Save the connection to the database
        const { error: saveError } = await supabase
          .from('platform_connections')
          .insert({
            platform,
            organization_id: profile.organization_id,
            auth_token: data.accessToken,
            refresh_token: data.refreshToken,
            token_expiry: data.expiresAt,
            account_name: data.accountName || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
            account_id: data.accountId,
            connected_by: profile.id,
            connected: true
          });

        if (saveError) {
          console.error('Error saving platform connection:', saveError);
          throw saveError;
        }

        setStatus('success');
        setMessage(`Successfully connected to ${platform}!`);
        toast.success('Connection successful', {
          description: `Successfully connected to ${platform}`
        });
        
        // Redirect back to settings after a delay
        setTimeout(() => {
          navigate('/app/settings?tab=integrations');
        }, 2000);
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
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
