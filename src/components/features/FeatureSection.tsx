
import React from "react";

interface FeatureSectionProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: React.ReactNode;
  reverse: boolean;
  points: string[];
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  image,
  imageAlt,
  icon,
  reverse,
  points
}) => {
  return (
    <div className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className={reverse ? "md:order-2" : ""}>
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg mb-4">
          <div className="text-primary">{icon}</div>
        </div>
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-3">
          {points.map((point, index) => (
            <li key={index} className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5">
                ✓
              </div>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "md:order-1" : ""}>
        <div className="rounded-lg overflow-hidden border shadow-lg">
          <img src={image} alt={imageAlt} className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
