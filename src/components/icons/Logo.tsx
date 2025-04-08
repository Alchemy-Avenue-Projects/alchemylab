
import React from "react";
import { FlaskConical } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-6 w-6", showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`rounded-md alchemy-gradient flex items-center justify-center ${className}`}>
        <FlaskConical className="h-[60%] w-[60%] text-white" />
      </div>
      {showText && <span className="font-bold text-xl">AlchemyLab</span>}
    </div>
  );
};

export default Logo;
