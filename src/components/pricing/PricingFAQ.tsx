
import React from "react";

const PricingFAQ: React.FC = () => {
  return (
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
  );
};

export default PricingFAQ;
