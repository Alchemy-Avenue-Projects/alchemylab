
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  LayoutGrid, 
  Users, 
  Zap, 
  ArrowRight 
} from "lucide-react";
import FeatureCard from "./FeatureCard";

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Why Choose AlchemyLab
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Marketing Alchemy at Your Fingertips</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform transforms raw data into marketing gold, helping you optimize campaigns for maximum impact.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Sparkles className="h-8 w-8 text-primary" />} 
            title="AI-Powered Insights" 
            description="Leverage artificial intelligence to uncover hidden patterns and optimize your campaigns automatically."
          />
          <FeatureCard 
            icon={<BarChart3 className="h-8 w-8 text-primary" />} 
            title="Real-time Analytics" 
            description="Monitor campaign performance in real-time with comprehensive dashboards and customizable reports."
          />
          <FeatureCard 
            icon={<TrendingUp className="h-8 w-8 text-primary" />} 
            title="Conversion Optimization" 
            description="Increase conversion rates by up to 47% with AI-driven recommendations and A/B testing."
          />
          <FeatureCard 
            icon={<LayoutGrid className="h-8 w-8 text-primary" />} 
            title="Campaign Management" 
            description="Manage all your marketing campaigns from a single, intuitive interface with powerful automation."
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8 text-primary" />} 
            title="Audience Segmentation" 
            description="Target the right audience with precision using advanced segmentation and personalization tools."
          />
          <FeatureCard 
            icon={<Zap className="h-8 w-8 text-primary" />} 
            title="Performance Booster" 
            description="Supercharge your marketing efforts with actionable insights that drive measurable results."
          />
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" asChild variant="outline" className="group">
            <Link to="/features" className="flex items-center">
              Explore All Features 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
