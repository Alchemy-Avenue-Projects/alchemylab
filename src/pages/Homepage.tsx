
import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import SocialProofSection from "@/components/homepage/SocialProofSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import ResultsSection from "@/components/homepage/ResultsSection";
import TestimonialsSection from "@/components/homepage/TestimonialsSection";
import CTASection from "@/components/homepage/CTASection";

export default function Homepage() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <ResultsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
