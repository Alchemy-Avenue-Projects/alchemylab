
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FeaturesCTA: React.FC = () => {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience AlchemyLab?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your 7-day free trial today. No credit card required.
          </p>
          <Button size="lg" asChild className="alchemy-gradient">
            <Link to="/pricing">View Pricing & Plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesCTA;
