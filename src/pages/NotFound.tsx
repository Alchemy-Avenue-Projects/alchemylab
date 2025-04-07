
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mb-6 mx-auto alchemy-gradient rounded-xl flex items-center justify-center">
          <span className="text-white text-2xl font-bold">404</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the page you were looking for. The page might have been moved, deleted, or never existed.
        </p>
        <Button asChild className="alchemy-gradient">
          <Link to="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AlchemyLab
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
