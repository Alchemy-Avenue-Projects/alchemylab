
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { parseOAuthRedirect } from "@/services/platforms/oauth-utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OAuthCallback: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          throw new Error(`Authentication error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Missing required parameters');
        }

        // Exchange the code for tokens
        const result = await supabase.functions.invoke('oauth-callback', {
          body: {
            code,
            state,
            redirectUri: `${window.location.origin}/oauth/callback`
          }
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        toast({
          title: 'Connection Successful',
          description: `Your ${state} account has been connected successfully.`
        });

        // Redirect back to integrations page
        navigate('/app/settings');
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Failed to complete authentication');
        toast({
          title: 'Connection Failed',
          description: err.message || 'Failed to complete authentication',
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, []);

  // Automatically redirect after a delay if there's an error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        navigate('/app/settings');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4">
      {isProcessing ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Processing Authentication</h2>
          <p className="text-muted-foreground">Please wait while we complete the connection...</p>
        </>
      ) : error ? (
        <>
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">Authentication Failed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p>Redirecting back to settings in a few seconds...</p>
        </>
      ) : (
        <>
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold mb-2">Connection Successful</h2>
          <p className="text-muted-foreground mb-4">Your account has been connected successfully.</p>
          <p>Redirecting back to settings...</p>
        </>
      )}
    </div>
  );
};

export default OAuthCallback;
