
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CallbackStatusCardProps {
  status: "loading" | "success" | "error";
  message: string;
  provider: string;
  onContinue: () => void;
  onTryAgain: () => void;
  onLogin: () => void;
}

const CallbackStatusCard: React.FC<CallbackStatusCardProps> = ({
  status,
  message,
  provider,
  onContinue,
  onTryAgain,
  onLogin
}) => {
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
            <Button onClick={onContinue}>Continue to Dashboard</Button>
          ) : message?.includes("not logged in") || message?.includes("authenticated") ? (
            <Button variant="outline" onClick={onLogin}>Log in</Button>
          ) : (
            <Button variant="outline" onClick={onTryAgain}>Back to Settings</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CallbackStatusCard;
