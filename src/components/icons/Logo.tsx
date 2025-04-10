
import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8", showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/7cf50a2d-f226-4edb-8207-08bdc2d69729.png" 
        alt="AlchemyLab Logo" 
        className={className}
      />
      {showText && <span className="font-bold text-xl">AlchemyLab</span>}
    </div>
  );
};

export default Logo;
