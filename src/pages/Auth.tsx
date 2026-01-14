import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Logo } from "@/components/icons/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const { signIn, signUp, user } = useAuth();

  // Get mode from URL query params
  const searchParams = new URLSearchParams(location.search);
  const defaultMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get the selected plan from localStorage
  const selectedPlan = localStorage.getItem('selectedPlan');

  // Redirect if already logged in - Change to dashboard
  useEffect(() => {
    if (user) {
      navigate('/app'); // Redirect to dashboard instead of homepage
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Welcome back! You've successfully logged in.");
        navigate('/app'); // Redirect to dashboard instead of homepage
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success("Account created! Please check your email for verification.");
        // Keep them on the same page with a success message
        // The user object will update once they're verified
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">AlchemyLab</h1>
          <p className="text-muted-foreground">Your Marketing Command Center</p>
        </div>

        <Card>
          <CardHeader>
            <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as 'login' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  {selectedPlan
                    ? `You've selected the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan. Start your 7-day free trial.`
                    : "Enter your details to create an account and start your 7-day free trial."}
                </CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <a
                      href="#"
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle forgot password - this could navigate to a password reset page
                        toast.info("Password reset functionality is not yet implemented.");
                      }}
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full alchemy-gradient"
                disabled={isLoading}
              >
                {isLoading
                  ? "Please wait..."
                  : mode === 'login'
                    ? "Login"
                    : "Create Account"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
