
import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8", showText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/2f44444f-156d-4a52-8ba3-ba960066df01.png" 
        alt="AlchemyLab Logo" 
        className={className}
      />
      {showText && <span className="font-bold text-xl">AlchemyLab</span>}
    </div>
  );
};

export default Logo;
