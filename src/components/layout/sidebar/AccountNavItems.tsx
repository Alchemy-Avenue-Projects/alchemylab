
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, Users, LucideIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
}

const accountNavItems: NavItem[] = [
  { icon: Users, label: "Team", href: "/app/team" },
  { icon: Settings, label: "Settings", href: "/app/settings" },
];

const AccountNavItems: React.FC = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  return (
    <SidebarMenu>
      {accountNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton 
            asChild 
            isActive={isActive(item.href)}
          >
            <Link to={item.href} className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default AccountNavItems;
