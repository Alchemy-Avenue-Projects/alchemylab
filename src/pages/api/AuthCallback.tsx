
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CallbackStatusCard from "@/components/oauth/CallbackStatusCard";
import { processOAuthCallback } from "@/utils/oauth-callback-processor";

const AuthCallback = () => {
  const { provider } = useParams<{ provider: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const { profile, user, session, isLoading } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Extract code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const platformState = urlParams.get('state') || 'facebook'; // Default to facebook if no state
      
      await processOAuthCallback({
        code,
        error,
        platformState,
        userId: user?.id || null,
        organizationId: profile?.organization_id || null,
        profile,
        user,
        session,
        isLoading,
        navigate,
        setStatus,
        setMessage
      });
    };

    handleCallback();
  }, [provider, navigate, profile, user, session, isLoading]);

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
      provider={provider || 'Facebook'}
      onContinue={handleContinue}
      onTryAgain={handleTryAgain}
      onLogin={handleLogin}
    />
  );
};

export default AuthCallback;
