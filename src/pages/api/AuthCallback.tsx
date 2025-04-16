
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CallbackStatusCard from "@/components/oauth/CallbackStatusCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const { provider } = useParams<{ provider: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Processing your connection...");
  const navigate = useNavigate();
  const { profile, user, session, isLoading } = useAuth();

  // Ensure proper platform name display
  const platformName = provider || 'facebook';
  const displayPlatform = platformName.charAt(0).toUpperCase() + platformName.slice(1);

  useEffect(() => {
    const handleCallback = async () => {
      // Extract code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const platformState = urlParams.get('state') || platformName;
      
      console.log(`Processing OAuth callback for ${platformName} with code: ${code ? `${code.substring(0, 5)}...` : 'missing'}`);
      console.log(`Auth state - User: ${!!user}, Session: ${!!session}, Profile: ${!!profile}, Loading: ${isLoading}`);
      
      if (error) {
        setStatus("error");
        setMessage(`Authorization error: ${error}`);
        return;
      }
      
      if (!code) {
        setStatus("error");
        setMessage("No authorization code found in the callback URL");
        return;
      }

      try {
        // Call the Supabase edge function directly with all needed parameters
        const { data, error: fnError } = await supabase.functions.invoke('facebook-oauth-callback', {
          body: { 
            code, 
            state: platformState 
          }
        });
        
        if (fnError) {
          console.error(`${platformName} OAuth callback error:`, fnError);
          throw new Error(`Failed to process authentication: ${fnError.message}`);
        }
        
        console.log(`${platformName} OAuth callback result:`, data);
        
        setStatus("success");
        setMessage(`Successfully connected to ${displayPlatform}`);
        toast.success(`Connected to ${displayPlatform}`, {
          description: "Your account was successfully connected"
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(`/app/settings?tab=integrations&success=${platformName}_connected`);
        }, 1500);
      } catch (err) {
        console.error(`Error calling ${platformName}-oauth-callback:`, err);
        setStatus("error");
        setMessage(`Failed to process authentication: ${err.message}`);
        toast.error("Connection failed", {
          description: err.message
        });
      }
    };

    // Don't process immediately to allow auth to initialize
    const timer = setTimeout(() => {
      handleCallback();
    }, 1000);

    return () => clearTimeout(timer);
  }, [provider, navigate, profile, user, session, isLoading, platformName]);

  const handleContinue = () => {
    navigate("/app/settings?tab=integrations");
  };

  const handleTryAgain = () => {
    navigate("/app/settings?tab=integrations");
  };

  const handleLogin = () => {
    navigate("/auth?mode=login");
  };

  return (
    <CallbackStatusCard
      status={status}
      message={message}
      provider={displayPlatform}
      onContinue={handleContinue}
      onTryAgain={handleTryAgain}
      onLogin={handleLogin}
    />
  );
};

export default AuthCallback;
