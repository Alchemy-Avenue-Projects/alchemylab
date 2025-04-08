
import React from "react";
import TestimonialCard from "./TestimonialCard";

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of marketing professionals who've transformed their campaigns with AlchemyLab.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="AlchemyLab has completely transformed our marketing strategy. The AI insights helped us increase conversions by 52% in just three months."
            name="Sarah Johnson"
            title="Marketing Director, Innovex"
            image="https://randomuser.me/api/portraits/women/45.jpg"
          />
          <TestimonialCard 
            quote="The campaign optimization tools are incredible. We've reduced our ad spend by 40% while maintaining the same conversion volume."
            name="David Chen"
            title="CMO, GlobalTech"
            image="https://randomuser.me/api/portraits/men/32.jpg"
          />
          <TestimonialCard 
            quote="The audience segmentation capabilities have allowed us to create hyper-targeted campaigns that resonate with our customers on a personal level."
            name="Emma Rodriguez"
            title="Digital Marketing Lead, FutureNow"
            image="https://randomuser.me/api/portraits/women/33.jpg"
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
