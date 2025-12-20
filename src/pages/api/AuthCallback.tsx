
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
      // Extract code and state from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const rawState = urlParams.get('state');
      
      console.log(`Processing OAuth callback for ${platformName} with code: ${code ? `${code.substring(0, 5)}...` : 'missing'}`);
      console.log(`Auth state - User: ${user?.id}, Session: ${!!session}, Profile: ${!!profile}, Loading: ${isLoading}`);
      
      if (error) {
        setStatus("error");
        setMessage(`Authorization error: ${error}`);
        toast.error("Authorization failed", {
          description: error
        });
        setTimeout(() => {
          navigate("/app/settings?tab=integrations");
        }, 2000);
        return;
      }
      
      if (!code) {
        setStatus("error");
        setMessage("No authorization code found in the callback URL");
        toast.error("Connection failed", {
          description: "No authorization code found"
        });
        setTimeout(() => {
          navigate("/app/settings?tab=integrations");
        }, 2000);
        return;
      }

      if (!rawState) {
        setStatus("error");
        setMessage("No state parameter found in the callback URL");
        toast.error("Connection failed", {
          description: "Missing state parameter"
        });
        setTimeout(() => {
          navigate("/app/settings?tab=integrations");
        }, 2000);
        return;
      }

      try {
        // Call the Supabase edge function directly with all needed parameters
        // The edge function expects the raw state parameter (base64 encoded JSON)
        const { data, error: fnError } = await supabase.functions.invoke('facebook-oauth-callback', {
          body: { 
            code, 
            state: rawState 
          }
        });
        
        if (fnError) {
          console.error(`${platformName} OAuth callback error:`, fnError);
          throw new Error(`Failed to process authentication: ${fnError.message}`);
        }
        
        console.log(`${platformName} OAuth callback result:`, data);
        
        // Check if the response indicates success
        if (data && data.success) {
          setStatus("success");
          setMessage(`Successfully connected to ${displayPlatform}`);
          toast.success(`Connected to ${displayPlatform}`, {
            description: "Your account was successfully connected"
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate(`/app/settings?tab=integrations&success=${platformName}_connected`);
          }, 1500);
        } else {
          throw new Error(data?.error || "Unknown error occurred");
        }
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
