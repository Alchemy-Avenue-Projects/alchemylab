
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const FeaturesCTA: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-primary/10 to-purple-500/10">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Revolutionize Your Marketing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of successful businesses that have transformed their marketing with AlchemyLab.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">7-day trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Full access</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Team support</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Easy setup</span>
            </div>
          </div>
          
          <Button size="lg" asChild className="alchemy-gradient">
            <Link to="/pricing">See Pricing & Plans</Link>
          </Button>
          
          <p className="mt-6 text-muted-foreground">
            Have questions? <Link to="/contact" className="text-primary underline">Contact our team</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesCTA;
