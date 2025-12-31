
import React from "react";
import { Button } from "@/components/ui/button";

const SidebarUpgradeButton: React.FC = () => {
  return (
    <div className="space-y-2">
      <Button className="w-full alchemy-gradient">Upgrade Plan</Button>
      <div className="text-[10px] text-center text-muted-foreground opacity-50">
        v{__APP_VERSION__}
      </div>
    </div>
  );
};

export default SidebarUpgradeButton;
