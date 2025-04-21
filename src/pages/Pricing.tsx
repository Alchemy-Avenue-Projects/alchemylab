
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "@/components/layout/LandingLayout";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingPlan from "@/components/pricing/PricingPlan";
import EnterpriseContact from "@/components/pricing/EnterpriseContact";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import { pricingPlans, PricingPeriod, PricingTier } from "@/components/pricing/pricingData";

export default function Pricing() {
  const [period, setPeriod] = useState<PricingPeriod>('monthly');
  const navigate = useNavigate();
  
  const selectPlan = (plan: PricingTier) => {
    localStorage.setItem('selectedPlan', plan);
    navigate('/auth?mode=signup');
  };
  
  return (
    <LandingLayout>
      <section className="py-20">
        <div className="container">
          <PricingHeader period={period} setPeriod={setPeriod} />
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingPlan
                key={plan.id}
                id={plan.id}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                features={plan.features}
                popular={plan.popular}
                period={period}
                onSelectPlan={() => selectPlan(plan.id)}
              />
            ))}
          </div>
          
          <EnterpriseContact />
          <PricingFAQ />
        </div>
      </section>
    </LandingLayout>
  );
}
