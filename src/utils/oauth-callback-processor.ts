
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
    
    console.log("Now calling facebook-oauth-callback edge function...");
    
    // Call the edge function to exchange the code for a token
    try {
      // Use Supabase function invocation
      const { data, error: fnError } = await supabase.functions.invoke('facebook-oauth-callback', {
        body: { 
          code, 
          state: platformState,
          userId: uid || null,
          organizationId: orgId || null
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
