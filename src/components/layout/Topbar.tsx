
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/useMobile";
import { Logo } from "@/components/icons/Logo";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";  // Changed this line
import { Navigation } from "./Navigation";
import NotificationDropdown from "../notifications/NotificationDropdown";

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [showNav, setShowNav] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setShowNav(!showNav);
  };

  return (
    <div className="sticky top-0 left-0 right-0 h-16 flex items-center px-4 md:px-6 z-10 bg-background border-b border-border">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <Button
              onClick={() => setShowNav(!showNav)}
              variant="ghost"
              size="icon"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold text-xl"
          >
            <Logo className="h-6 w-6" showText={!isMobile} />
          </Link>
        </div>
        <div className="flex items-center space-x-1">
          <NotificationDropdown />
          <UserMenu />
        </div>
      </div>
      {isMobile && (
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-background border-r border-r-border py-4 flex flex-col z-50 transform transition-transform duration-200 ${
            showNav ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-4 mb-4">
            <Link
              to="/"
              className="flex items-center space-x-2 font-bold text-xl"
            >
              <Logo className="h-6 w-6" showText={true} />
            </Link>
          </div>
          <Navigation />
        </div>
      )}
    </div>
  );
};

export default Topbar;
