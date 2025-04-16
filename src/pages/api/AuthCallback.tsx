
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AuthCallback = () => {
  const { provider } = useParams<{ provider: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const { profile, user, session, loading } = useAuth();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Extract code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const platformState = urlParams.get('state') || 'facebook'; // Default to facebook if no state
        
        console.log(`Processing ${provider || platformState} OAuth callback with code: ${code ? `${code.substring(0, 5)}...` : 'missing'}`);
        console.log(`Auth state - User: ${!!user}, Session: ${!!session}, Profile: ${!!profile}, Loading: ${loading}`);
        
        if (error) {
          const errorReason = urlParams.get('error_reason') || 'Unknown error';
          setStatus("error");
          setMessage(`Authorization error: ${errorReason}`);
          toast.error("Authorization failed", {
            description: `${errorReason}`
          });
          return;
        }
        
        if (!code) {
          setStatus("error");
          setMessage("No authorization code found in the callback URL");
          toast.error("Authorization failed", {
            description: "No authorization code found in the callback URL"
          });
          return;
        }

        // Wait for auth to be ready if it's still loading
        if (loading) {
          console.log("Auth is still loading, waiting...");
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Check if user is authenticated
        if (!user) {
          console.warn("User is not authenticated, trying to continue anyway");
          // We'll try to continue with the edge function and store the code temporarily
        }

        // Log auth state again after waiting
        console.log(`Auth state after waiting - User: ${!!user}, Session: ${!!session}, Profile: ${!!profile}`);

        // Store the authorization code
        console.log("Storing authorization code in platform_connections...");
        
        // Use the user ID if available, otherwise create a temporary record
        let organizationId = profile?.organization_id;
        let userId = user?.id;
        
        // If either is missing, try to continue anyway and let the edge function handle it
        if (!organizationId && !userId) {
          console.warn("No organization or user ID available - the edge function will handle this.");
        } else {
          if (!organizationId && userId) {
            console.warn("No organization ID found in profile, using user ID as fallback");
            organizationId = userId;
          }

          // Insert the connection data
          try {
            const { data: connectionData, error: connectionError } = await supabase
              .from('platform_connections')
              .insert({
                platform: platformState,
                organization_id: organizationId || 'temp-org-id', // Use a temporary ID if none available
                auth_code: code,
                connected_by: userId || 'anonymous',
                connected: false  // Not fully connected yet until we exchange the code for a token
              })
              .select()
              .single();
              
            if (connectionError) {
              console.error("Error storing authorization code:", connectionError);
              console.log("Will attempt to proceed with the edge function anyway.");
            } else {
              console.log("Successfully stored authorization code.", connectionData);
            }
          } catch (dbError) {
            console.error("Database error:", dbError);
            // Continue with edge function anyway
          }
        }
        
        console.log("Now calling facebook-oauth-callback edge function...");
        
        // Call the edge function to exchange the code for a token
        try {
          // Use Supabase function invocation
          const { data, error: fnError } = await supabase.functions.invoke('facebook-oauth-callback', {
            body: { 
              code, 
              state: platformState,
              userId: userId || null,
              organizationId: organizationId || null
            }
          });
          
          if (fnError) {
            console.error("Facebook OAuth callback error:", fnError);
            throw new Error(`Failed to process authentication: ${fnError.message}`);
          }
          
          console.log("Facebook OAuth callback result:", data);
          
          setStatus("success");
          setMessage(`Successfully connected to Facebook`);
          toast.success(`Connected to Facebook`, {
            description: "Your account was successfully connected"
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate("/app/settings?tab=integrations&success=facebook_connected");
          }, 1500);
          
        } catch (error: any) {
          console.error("Error calling facebook-oauth-callback:", error);
          setStatus("error");
          setMessage(`Failed to process authentication: ${error.message}`);
          toast.error("Connection failed", {
            description: error.message
          });
        }
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage(error.message || "An error occurred during authorization");
        toast.error("Connection failed", {
          description: error.message || "An unexpected error occurred"
        });
      }
    };

    processOAuthCallback();
  }, [provider, navigate, profile, user, session, loading]);

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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {status === "loading" ? "Connecting..." : 
             status === "success" ? "Connection Successful" : 
             "Connection Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" ? `Finalizing your ${provider || 'Facebook'} connection` : 
             status === "success" ? `Your ${provider || 'Facebook'} account is now connected` : 
             "We encountered an issue connecting your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : status === "success" ? (
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          <p className="mt-4 text-center text-muted-foreground">
            {message || (status === "loading" ? "Please wait while we connect your account..." : "")}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "loading" ? (
            <p className="text-sm text-muted-foreground">This may take a few moments...</p>
          ) : status === "success" ? (
            <Button onClick={handleContinue}>Continue to Dashboard</Button>
          ) : message?.includes("not logged in") || message?.includes("authenticated") ? (
            <Button variant="outline" onClick={handleLogin}>Log in</Button>
          ) : (
            <Button variant="outline" onClick={handleTryAgain}>Back to Settings</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthCallback;
