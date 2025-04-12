
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// This component handles API route redirects that would typically be handled 
// by backend routing in a Next.js app, but need explicit handling in React Router
const AuthCallback: React.FC = () => {
  const { provider } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // For Facebook, the edge function is handling everything
    // This component just shows a loading state while that happens
    
    // Check if we got redirected with an error
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.has('error')) {
      const errorMsg = queryParams.get('error') || 'Unknown error';
      const reason = queryParams.get('reason') || '';
      
      toast({
        title: "Authentication Error",
        description: `${errorMsg}${reason ? `: ${reason}` : ''}`,
        variant: "destructive"
      });
      
      navigate(`/app/settings?tab=integrations&error=${queryParams.get('error')}`);
    } else if (queryParams.has('success')) {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${provider}`,
      });
      
      // If there was a success, navigate after a short delay
      setTimeout(() => {
        navigate('/app/settings?tab=integrations');
      }, 3000);
    }
  }, [provider, location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Connecting to {provider}</h1>
        <p className="text-muted-foreground">Please wait while we complete the authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
