
import React from "react";
import { Quote } from "lucide-react";

const FeaturesTestimonial: React.FC = () => {
  return (
    <div className="my-20 bg-primary/10 rounded-xl p-8 md:p-12 relative">
      <div className="absolute top-6 left-6 text-primary/40">
        <Quote className="h-16 w-16" />
      </div>
      <div className="max-w-3xl mx-auto text-center relative">
        <p className="text-xl md:text-2xl italic mb-6">
          "AlchemyLab has transformed our marketing approach. We've seen a 38% increase in conversion rates and saved countless hours analyzing campaign data. The AI insights are like having a team of expert analysts working around the clock."
        </p>
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden mr-3">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80" 
              alt="Sarah Johnson" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="font-semibold">Sarah Johnson</p>
            <p className="text-sm text-muted-foreground">Marketing Director, TechInnovate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesTestimonial;
