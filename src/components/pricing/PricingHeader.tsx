
import React from "react";
import { Switch } from "@/components/ui/switch";

interface PricingHeaderProps {
  period: 'monthly' | 'annual';
  setPeriod: (period: 'monthly' | 'annual') => void;
}

const PricingHeader: React.FC<PricingHeaderProps> = ({ period, setPeriod }) => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        Start with a 7-day free trial. No credit card required.
      </p>
      
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={period === 'monthly' ? 'text-primary font-medium' : 'text-muted-foreground'}>
          Monthly
        </span>
        <Switch 
          checked={period === 'annual'} 
          onCheckedChange={(checked) => setPeriod(checked ? 'annual' : 'monthly')} 
        />
        <span className={period === 'annual' ? 'text-primary font-medium' : 'text-muted-foreground'}>
          Annual
        </span>
        {period === 'annual' && (
          <span className="ml-2 inline-block bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-1">
            Save 20%
          </span>
        )}
      </div>
    </div>
  );
};

export default PricingHeader;
