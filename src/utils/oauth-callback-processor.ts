
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OAuthCallbackOptions {
  code: string | null;
  error: string | null;
  platformState: string;
  userId: string | null;
  organizationId: string | null;
  profile: any;
  user: any;
  session: any;
  isLoading: boolean;
  navigate: (path: string) => void;
  setStatus: (status: "loading" | "success" | "error") => void;
  setMessage: (message: string) => void;
}

export const processOAuthCallback = async ({
  code,
  error,
  platformState,
  userId,
  organizationId,
  profile,
  user,
  session,
  isLoading,
  navigate,
  setStatus,
  setMessage
}: OAuthCallbackOptions) => {
  try {
    console.log(`Processing ${platformState} OAuth callback with code: ${code ? `${code.substring(0, 5)}...` : 'missing'}`);
    console.log(`Auth state - User: ${!!user}, Session: ${!!session}, Profile: ${!!profile}, Loading: ${isLoading}`);
    
    if (error) {
      const errorReason = error;
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

    // Call the edge function directly with the code and state
    try {
      const { data, error: fnError } = await supabase.functions.invoke('facebook-oauth-callback', {
        body: { 
          code, 
          state: platformState
        }
      });
      
      if (fnError) {
        console.error(`${platformState} OAuth callback error:`, fnError);
        throw new Error(`Failed to process authentication: ${fnError.message}`);
      }
      
      console.log(`${platformState} OAuth callback result:`, data);
      
      setStatus("success");
      setMessage(`Successfully connected to ${platformState.charAt(0).toUpperCase() + platformState.slice(1)}`);
      toast.success(`Connected to ${platformState.charAt(0).toUpperCase() + platformState.slice(1)}`, {
        description: "Your account was successfully connected"
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/app/settings?tab=integrations&success=${platformState}_connected`);
      }, 1500);
      
    } catch (error: any) {
      console.error(`Error calling ${platformState}-oauth-callback:`, error);
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
