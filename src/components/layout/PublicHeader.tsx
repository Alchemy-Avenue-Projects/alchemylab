
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/icons/Logo";

const PublicHeader: React.FC = () => {
  return (
    <header className="border-b border-border py-4">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo className="h-8 w-8" />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link to="/app" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/auth?mode=login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button className="alchemy-gradient" size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
