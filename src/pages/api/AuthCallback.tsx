
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Connecting to {provider}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-center text-muted-foreground">Please wait while we complete the authentication...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
