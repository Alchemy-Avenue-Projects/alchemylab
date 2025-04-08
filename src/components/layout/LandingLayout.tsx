import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/icons/Logo";
import { ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/auth?mode=login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=signup">Sign up</Link>
              </Button>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" asChild>
                  <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/40">
        <div className="container py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo />
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your marketing with AI-powered insights
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">Resources</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AlchemyLab. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
