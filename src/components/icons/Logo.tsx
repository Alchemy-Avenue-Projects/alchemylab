
import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8", showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/23ed3d90-70a3-42c0-aed5-94425322c38b.png" 
        alt="AlchemyLab Logo" 
        className={className}
      />
      {showText && <span className="font-bold text-xl">AlchemyLab</span>}
    </div>
  );
};

export default Logo;
