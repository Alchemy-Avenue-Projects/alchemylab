
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlanProps {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: PlanFeature[];
  popular?: boolean;
  period: 'monthly' | 'annual';
  onSelectPlan: (planId: string) => void;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  id,
  name,
  description,
  price,
  features,
  popular,
  period,
  onSelectPlan
}) => {
  return (
    <Card className={`relative ${popular ? 'border-primary shadow-lg scale-105 z-10' : 'border'}`}>
      {popular && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-3 py-1">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader className="pb-0">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <p className="text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold">${period === 'monthly' ? price.monthly : price.annual}</span>
          <span className="text-muted-foreground ml-1">/month</span>
        </div>
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 
                className={`h-5 w-5 mr-2 flex-shrink-0 ${feature.included ? 'text-primary' : 'text-muted-foreground/30'}`} 
              />
              <span className={feature.included ? '' : 'text-muted-foreground/60 line-through'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${popular ? 'alchemy-gradient' : ''}`}
          variant={popular ? 'default' : 'outline'}
          onClick={() => onSelectPlan(id)}
        >
          Choose {name}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingPlan;
