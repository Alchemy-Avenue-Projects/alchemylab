import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";
import { toast } from "sonner";
import { env } from "@/utils/env";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // First try to fetch existing profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      // If no profile exists, create one
      if (!data) {
        console.log("No profile found, creating new profile for user:", userId);
        const { data: userData } = await supabase.auth.getUser();
        const userMetadata = userData?.user?.user_metadata;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            full_name: userMetadata?.full_name || '',
            role: 'user', // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw insertError;
        }
        
        data = newProfile;
      }
      
      return data as Profile;
    } catch (error) {
      console.error("Error in profile fetch/create:", error);
      toast.error("Failed to load or create user profile");
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // Add a timeout to prevent infinite loading
    loadingTimeout = setTimeout(() => {
      if (!cancelled) {
        console.log("Auth loading timeout reached, forcing loading state to false");
        setIsLoading(false);
      }
    }, 10000); // Increased timeout to 10 seconds

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return;
        
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile if authenticated
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          if (!cancelled) {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }
        
        if (!cancelled) {
          setIsLoading(false);
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          if (!cancelled) {
            setProfile(profile);
            setIsLoading(false);
            if (loadingTimeout) {
              clearTimeout(loadingTimeout);
            }
          }
        });
      } else {
        setIsLoading(false);
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
      }
    }).catch(error => {
      if (!cancelled) {
        console.error("Session fetch error:", error);
        toast.error("Failed to load session");
        setIsLoading(false);
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to sign up");
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      console.log("[AuthContext] Starting sign out process...");
      
      // Clear all storage first
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear local state before calling Supabase
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Sign out from Supabase
      console.log("[AuthContext] Calling Supabase signOut...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("[AuthContext] Supabase signOut error:", error);
        throw error;
      }
      
      console.log("[AuthContext] Supabase signOut successful");
      
      // Show success message
      toast.success("Signed out successfully");
      
      // Force a clean reload to the auth page
      window.location.replace('/auth?mode=login');
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error);
      toast.error("Failed to sign out");
      
      // Force reload as fallback
      window.location.replace('/auth?mode=login');
    }
  };

  // Check if the profile has role property and it equals "admin"
  const isAdmin = !!profile?.role && profile.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
