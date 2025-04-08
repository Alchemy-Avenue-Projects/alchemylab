import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2 } from "lucide-react";

type PricingPeriod = 'monthly' | 'annual';
type PricingTier = 'starter' | 'professional' | 'enterprise';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: PricingTier;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: PlanFeature[];
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses and solo marketers.',
    price: {
      monthly: 49,
      annual: 39,
    },
    features: [
      { text: '1 Ad Account', included: true },
      { text: 'Up to 3 users', included: true },
      { text: 'Basic Analytics', included: true },
      { text: '10 AI Generations per month', included: true },
      { text: 'Campaign Management', included: true },
      { text: 'Media Library (10GB)', included: true },
      { text: 'Email Support', included: true },
      { text: 'Advanced AI Insights', included: false },
      { text: 'Team Collaboration', included: false },
      { text: 'Custom Reports', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing marketing teams and agencies.',
    price: {
      monthly: 99,
      annual: 79,
    },
    features: [
      { text: '5 Ad Accounts', included: true },
      { text: 'Up to 10 users', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: '50 AI Generations per month', included: true },
      { text: 'Campaign Management', included: true },
      { text: 'Media Library (50GB)', included: true },
      { text: 'Priority Email Support', included: true },
      { text: 'Advanced AI Insights', included: true },
      { text: 'Team Collaboration', included: true },
      { text: 'Custom Reports', included: false },
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with complex marketing needs.',
    price: {
      monthly: 199,
      annual: 159,
    },
    features: [
      { text: 'Unlimited Ad Accounts', included: true },
      { text: 'Unlimited users', included: true },
      { text: 'Enterprise Analytics', included: true },
      { text: 'Unlimited AI Generations', included: true },
      { text: 'Campaign Management', included: true },
      { text: 'Media Library (Unlimited)', included: true },
      { text: '24/7 Priority Support', included: true },
      { text: 'Advanced AI Insights', included: true },
      { text: 'Team Collaboration', included: true },
      { text: 'Custom Reports', included: true },
    ],
  },
];

export default function Pricing() {
  const [period, setPeriod] = useState<PricingPeriod>('monthly');
  const navigate = useNavigate();
  
  const selectPlan = (plan: PricingTier) => {
    localStorage.setItem('selectedPlan', plan);
    navigate('/auth?mode=signup');
  };
  
  return (
    <>
      <section className="py-20">
        <div className="container">
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
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-3 py-1">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="pb-0">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold">${period === 'monthly' ? plan.price.monthly : plan.price.annual}</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
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
                    className={`w-full ${plan.popular ? 'alchemy-gradient' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => selectPlan(plan.id)}
                  >
                    Choose {plan.name}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-20 max-w-3xl mx-auto text-center bg-muted/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our team can create a tailored plan to meet your specific marketing needs.
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
          
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="font-semibold mb-2">What's included in the free trial?</h3>
                <p className="text-muted-foreground">
                  Your 7-day free trial includes full access to all features of your selected plan, with no limitations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
                <p className="text-muted-foreground">
                  Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What happens when my trial ends?</h3>
                <p className="text-muted-foreground">
                  After your 7-day trial, you'll be charged for your selected plan unless you cancel beforehand.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee if you're not satisfied with our service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
