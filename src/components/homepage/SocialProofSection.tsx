
import React from "react";

const SocialProofSection: React.FC = () => {
  return (
    <section className="py-12 bg-muted/20">
      <div className="container">
        <div className="text-center mb-8">
          <p className="text-muted-foreground">Trusted by marketing teams at companies like</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
          <div className="h-12 flex items-center">
            <div className="font-bold text-2xl text-gray-400">ACME Inc</div>
          </div>
          <div className="h-12 flex items-center">
            <div className="font-bold text-2xl text-gray-400">GlobalTech</div>
          </div>
          <div className="h-12 flex items-center">
            <div className="font-bold text-2xl text-gray-400">Innovex</div>
          </div>
          <div className="h-12 flex items-center">
            <div className="font-bold text-2xl text-gray-400">FutureNow</div>
          </div>
          <div className="h-12 flex items-center">
            <div className="font-bold text-2xl text-gray-400">Visionary</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
