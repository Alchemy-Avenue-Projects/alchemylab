
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

    // Wait for auth to be ready if it's still loading
    if (isLoading) {
      console.log("Auth is still loading, waiting...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Check if user is authenticated
    if (!user) {
      console.warn("User is not authenticated, redirecting to login...");
      setStatus("error");
      setMessage("You need to be logged in to connect platforms. Please log in and try again.");
      toast.error("Authentication required", {
        description: "You need to be logged in to connect platforms."
      });
      // Save the OAuth state to session storage to resume after login
      sessionStorage.setItem('pendingOAuthCode', code);
      sessionStorage.setItem('pendingOAuthPlatform', platformState);
      setTimeout(() => {
        navigate("/auth?mode=login");
      }, 2000);
      return;
    }

    // Log auth state again after waiting
    console.log(`Auth state after waiting - User: ${!!user}, Session: ${!!session}, Profile: ${!!profile}`);

    // Store the authorization code
    console.log("Storing authorization code in platform_connections...");
    
    // Use the user ID if available, otherwise create a temporary record
    let orgId = organizationId;
    let uid = userId;
    
    // If either is missing, try to continue anyway and let the edge function handle it
    if (!orgId && !uid) {
      console.warn("No organization or user ID available - the edge function will handle this.");
    } else {
      if (!orgId && uid) {
        console.warn("No organization ID found in profile, using user ID as fallback");
        orgId = uid;
      }

      // Insert the connection data
      try {
        const { data: connectionData, error: connectionError } = await supabase
          .from('platform_connections')
          .insert({
            platform: platformState,
            organization_id: orgId || 'temp-org-id', // Use a temporary ID if none available
            auth_code: code,
            connected_by: uid || 'anonymous',
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
    
    console.log(`Now calling ${platformState}-oauth-callback edge function...`);
    
    // Call the edge function to exchange the code for a token
    try {
      // Use Supabase function invocation with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Function call timed out")), 15000)
      );
      
      const functionPromise = supabase.functions.invoke('facebook-oauth-callback', {
        body: { 
          code, 
          state: platformState,
          userId: uid || null,
          organizationId: orgId || null
        }
      });
      
      // Race the function call against the timeout
      const { data, error: fnError } = await Promise.race([
        functionPromise,
        timeoutPromise.then(() => {
          throw new Error("Function call timed out after 15 seconds");
        })
      ]) as any;
      
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
