
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 to-purple-500/10">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your 7-day free trial today. No credit card required.
          </p>
          <Button size="lg" asChild className="alchemy-gradient">
            <Link to="/pricing">Start Free Trial</Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Join over 10,000 marketing professionals already using AlchemyLab
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
