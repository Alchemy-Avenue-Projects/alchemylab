
import React from "react";
import FeaturesHeader from "@/components/features/FeaturesHeader";
import FeatureSection from "@/components/features/FeatureSection";
import FeatureCard from "@/components/features/FeatureCard";
import FeaturesCTA from "@/components/features/FeaturesCTA";
import { mainFeatures, additionalFeatures } from "@/components/features/featuresData";

export default function Features() {
  return (
    <>
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

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </section>

      <FeaturesCTA />
    </>
  );
}
