
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Settings, 
  Users, 
  Layers, 
  Database, 
  FlaskConical, 
  Image, 
  Sparkles, 
  BellRing,
  LucideIcon
} from "lucide-react";

import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
}

const mainNavItems: NavItem[] = [
  { icon: BarChart3, label: "Dashboard", href: "/" },
  { icon: Layers, label: "Campaigns", href: "/campaigns" },
  { icon: Database, label: "Analytics", href: "/analytics" },
  { icon: FlaskConical, label: "AI Insights", href: "/ai-insights", badge: "New" },
  { icon: Image, label: "Media Library", href: "/media" },
  { icon: Sparkles, label: "Ad Creator", href: "/creator" },
  { icon: BellRing, label: "Notifications", href: "/notifications", badge: 3 },
];

const secondaryNavItems: NavItem[] = [
  { icon: Users, label: "Team", href: "/team" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <SidebarContainer>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md alchemy-gradient flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">AdAlchemy</span>
        </div>
        <SidebarTrigger className="absolute right-4 top-4 sm:right-4 sm:top-4 md:hidden" />
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <Button className="w-full alchemy-gradient">Upgrade Plan</Button>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
