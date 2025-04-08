
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FeaturesHeader: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto text-center mb-16">
      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
        POWERFUL FEATURES
      </span>
      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
        Transform Your Marketing Strategy
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Discover how AlchemyLab's cutting-edge platform empowers your team to achieve unprecedented marketing results with less effort.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild className="alchemy-gradient">
          <Link to="/pricing">View Pricing</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/auth?mode=signup">Start Free Trial</Link>
        </Button>
      </div>
    </div>
  );
};

export default FeaturesHeader;
