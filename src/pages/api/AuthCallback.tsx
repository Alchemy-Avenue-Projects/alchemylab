
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const { provider } = useParams<{ provider: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Extract code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setStatus("error");
          setMessage("No authorization code found in the callback URL");
          toast.error("Authorization failed", {
            description: "No authorization code found in the callback URL"
          });
          return;
        }

        console.log(`Processing ${provider} OAuth callback with code ${code.substring(0, 5)}...`);
        
        // Here we would make a call to our backend API to exchange the code for a token
        // and save the connection in the database
        // For now, we'll simulate success
        
        setTimeout(() => {
          setStatus("success");
          setMessage(`Successfully connected to ${provider}`);
          toast.success(`Connected to ${provider}`, {
            description: "Your account was successfully connected"
          });
        }, 1500);
        
        // In a real implementation, we would:
        // 1. Make a POST request to our backend with the code
        // 2. The backend would exchange the code for a token
        // 3. The backend would store the token in the database
        // 4. The backend would return a success/error response
        
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage(error.message || "An error occurred during authorization");
        toast.error("Connection failed", {
          description: error.message || "An error occurred during authorization"
        });
      }
    };

    processOAuthCallback();
  }, [provider, navigate]);

  const handleContinue = () => {
    navigate("/app/settings");
  };

  const handleTryAgain = () => {
    navigate("/app/settings");
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
            {status === "loading" ? `Finalizing your ${provider} connection` : 
             status === "success" ? `Your ${provider} account is now connected` : 
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
          ) : (
            <Button variant="outline" onClick={handleTryAgain}>Back to Settings</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthCallback;
