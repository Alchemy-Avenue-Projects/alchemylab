
export type PricingPeriod = 'monthly' | 'annual';
export type PricingTier = 'starter' | 'professional' | 'enterprise';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
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

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses and solo marketers.',
    price: {
      monthly: 49,
      annual: 39,
    },
    features: [
      { text: '3 Ad Accounts', included: true },
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
      { text: '7 Ad Accounts', included: true },
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
