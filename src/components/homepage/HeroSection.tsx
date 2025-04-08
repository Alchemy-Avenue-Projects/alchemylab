
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent pointer-events-none" />
      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            AI-Powered Marketing Platform
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Transform Your Marketing ROI with AI Insights
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Boost conversion rates by up to 47% with AlchemyLab's intelligent campaign analytics and optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="alchemy-gradient relative overflow-hidden group">
              <Link to="/pricing">
                Start Free Trial
                <span className="absolute right-4 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5 ml-1" />
                </span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/features">See How It Works</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
        
        <div className="relative mx-auto rounded-lg overflow-hidden border shadow-xl max-w-5xl bg-white">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 mix-blend-overlay pointer-events-none" />
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
            alt="AlchemyLab Dashboard" 
            className="w-full h-auto" 
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
