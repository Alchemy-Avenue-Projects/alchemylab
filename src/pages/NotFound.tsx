
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/Logo";

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [returnPath, setReturnPath] = useState("/");
  
  useEffect(() => {
    // Check if we were in the app when hitting 404
    if (location.pathname.startsWith('/app')) {
      setReturnPath('/app');
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center items-center mb-6">
          <Logo className="w-16 h-16 mr-2" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the page you were looking for. The page might have been moved, deleted, or never existed.
        </p>
        <Button asChild className="alchemy-gradient">
          <Link to={returnPath} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AlchemyLab
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
