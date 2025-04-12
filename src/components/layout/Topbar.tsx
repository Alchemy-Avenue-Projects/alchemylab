
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/useMobile";
import { Logo } from "@/components/icons/Logo";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { useSidebar } from "@/components/ui/sidebar";

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { user } = useAuth();
  const { toggleSidebar, setOpenMobile } = useSidebar();

  return (
    <div className="sticky top-0 left-0 right-0 h-16 flex items-center px-4 md:px-6 z-10 bg-background border-b border-border">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link
            to="/app"
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
    </div>
  );
};

export default Topbar;
