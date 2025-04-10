
import React from "react";
import Logo from "@/components/icons/Logo";

const SidebarLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Logo className="h-8 w-8" showText={false} />
      <span className="font-bold text-xl">AlchemyLab</span>
    </div>
  );
};

export default SidebarLogo;
