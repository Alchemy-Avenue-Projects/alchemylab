
import React from "react";

import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger
} from "@/components/ui/sidebar";

import MainNavItems from "./sidebar/MainNavItems";
import AccountNavItems from "./sidebar/AccountNavItems";
import SidebarLogo from "./sidebar/SidebarLogo";
import SidebarUpgradeButton from "./sidebar/SidebarUpgradeButton";

const Sidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <SidebarHeader className="p-4">
        <SidebarLogo />
        <SidebarTrigger className="absolute right-4 top-4 sm:right-4 sm:top-4 md:hidden" />
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <MainNavItems />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <AccountNavItems />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <SidebarUpgradeButton />
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
