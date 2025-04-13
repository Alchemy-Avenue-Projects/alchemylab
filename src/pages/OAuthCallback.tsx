
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseOAuthRedirect } from '@/services/platforms/oauth-utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your connection...');
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { code, state, error } = parseOAuthRedirect();
        
        if (error) {
          setStatus('error');
          setMessage(`Authentication error: ${error}`);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid callback parameters.');
          return;
        }

        if (!profile?.organization_id) {
          setStatus('error');
          setMessage('You need to be logged in to connect platforms.');
          return;
        }

        // Exchange the code for an access token by calling our edge function
        const { data, error: exchangeError } = await supabase.functions.invoke('oauth-callback', {
          body: {
            code,
            platform: state,
            redirectUri: `${window.location.origin}/oauth/callback`
          }
        });

        if (exchangeError) {
          throw new Error(exchangeError.message);
        }

        // Save the connection to the database
        const { error: saveError } = await supabase
          .from('platform_connections')
          .insert({
            platform: state,
            organization_id: profile.organization_id,
            auth_token: data.accessToken,
            refresh_token: data.refreshToken,
            token_expiry: data.expiresAt,
            account_name: data.accountName || `${state.charAt(0).toUpperCase() + state.slice(1)} Account`,
            account_id: data.accountId,
            connected_by: profile.id,
            connected: true
          });

        if (saveError) {
          throw saveError;
        }

        setStatus('success');
        setMessage(`Successfully connected to ${state}!`);
        
        // Redirect back to settings after a delay
        setTimeout(() => {
          navigate('/app/settings?tab=integrations');
        }, 2000);
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        setStatus('error');
        setMessage('Failed to complete the connection process. Please try again.');
      }
    };

    handleOAuthCallback();
  }, [navigate, profile]);

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
