
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ResultItem from "./ResultItem";

const ResultsSection: React.FC = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              Proven Results
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transforming Marketing Performance</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our customers consistently see remarkable improvements in their marketing metrics after implementing AlchemyLab.
            </p>
            
            <div className="space-y-4">
              <ResultItem 
                metric="47%" 
                text="Average increase in conversion rates" 
              />
              <ResultItem 
                metric="68%" 
                text="Reduction in customer acquisition costs" 
              />
              <ResultItem 
                metric="3.5x" 
                text="Return on marketing investment" 
              />
              <ResultItem 
                metric="85%" 
                text="Time saved on campaign analysis" 
              />
            </div>
            
            <Button className="mt-8 alchemy-gradient" size="lg" asChild>
              <Link to="/pricing">Start Your Transformation</Link>
            </Button>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 mix-blend-overlay pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80" 
              alt="Marketing Results" 
              className="w-full h-auto" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
