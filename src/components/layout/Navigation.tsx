
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2,
  Home,
  LayoutGrid,
  MessageSquareDashed,
  FileBarChart,
  Image,
  Bell,
  Settings,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    title: "AI Insights",
    href: "/ai-insights",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Media",
    href: "/media",
    icon: <Image className="h-5 w-5" />,
  },
  {
    title: "Creator",
    href: "/creator",
    icon: <MessageSquareDashed className="h-5 w-5" />,
  },
  {
    title: "Notifications",
    href: "/notifications", 
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "Team",
    href: "/team",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => (
        <button
          key={item.href}
          onClick={() => navigate(item.href)}
          className={cn(
            "flex items-center w-full space-x-3 px-3 py-2 rounded-md text-sm transition-colors",
            location.pathname === item.href
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {item.icon}
          <span>{item.title}</span>
        </button>
      ))}
    </nav>
  );
}
