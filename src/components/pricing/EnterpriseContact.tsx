
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EnterpriseContact: React.FC = () => {
  return (
    <div className="mt-20 max-w-3xl mx-auto text-center bg-muted/30 rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
      <p className="text-lg text-muted-foreground mb-6">
        Our team can create a tailored plan to meet your specific marketing needs.
      </p>
      <Button size="lg" variant="outline" asChild>
        <Link to="/contact">Contact Sales</Link>
      </Button>
    </div>
  );
};

export default EnterpriseContact;
