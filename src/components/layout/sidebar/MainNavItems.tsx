
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Layers, 
  Database, 
  FlaskConical, 
  Image, 
  Sparkles, 
  BellRing,
  LucideIcon
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { Badge } from "@/components/ui/badge";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
}

const mainNavItems: NavItem[] = [
  { icon: BarChart3, label: "Dashboard", href: "/app" },
  { icon: Layers, label: "Campaigns", href: "/app/campaigns" },
  { icon: Database, label: "Analytics", href: "/app/analytics" },
  { icon: FlaskConical, label: "AI Insights", href: "/app/ai-insights", badge: "New" },
  { icon: Image, label: "Media Library", href: "/app/media" },
  { icon: Sparkles, label: "Ad Creator", href: "/app/creator" },
  { icon: BellRing, label: "Notifications", href: "/app/notifications", badge: 3 },
];

const MainNavItems: React.FC = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <SidebarMenu>
      {mainNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton 
            asChild 
            isActive={isActive(item.href)}
            className="justify-between"
          >
            <Link to={item.href} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <Badge 
                  variant={typeof item.badge === 'string' ? "default" : "destructive"} 
                  className={typeof item.badge === 'string' ? "alchemy-gradient" : ""}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default MainNavItems;
