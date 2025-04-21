
import React from "react";
import LandingLayout from "@/components/layout/LandingLayout";
import FeaturesHeader from "@/components/features/FeaturesHeader";
import FeatureSection from "@/components/features/FeatureSection";
import FeatureCard from "@/components/features/FeatureCard";
import FeaturesCTA from "@/components/features/FeaturesCTA";
import FeaturesTestimonial from "@/components/features/FeaturesTestimonial";
import FeaturesComparison from "@/components/features/FeaturesComparison";
import { mainFeatures, additionalFeatures } from "@/components/features/featuresData";

export default function Features() {
  return (
    <LandingLayout>
      <section className="py-20 md:py-28">
        <div className="container">
          <FeaturesHeader />

          <div className="grid gap-16">
            {mainFeatures.map((feature, index) => (
              <FeatureSection 
                key={index}
                title={feature.title}
                description={feature.description}
                image={feature.image}
                imageAlt={feature.imageAlt}
                icon={feature.icon}
                reverse={feature.reverse}
                points={feature.points}
              />
            ))}
          </div>

          <FeaturesTestimonial />

          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need to Dominate Your Marketing Strategy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {additionalFeatures.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>

          <FeaturesComparison />
        </div>
      </section>

      <FeaturesCTA />
    </LandingLayout>
  );
}
