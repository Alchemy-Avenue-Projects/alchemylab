
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductBriefDetailsProps {
  description: string;
  targetAudience: string;
  targetLocations: string;
  index: number;
  onInputChange: (index: number, field: string, value: string) => void;
}

const ProductBriefDetails: React.FC<ProductBriefDetailsProps> = ({
  description,
  targetAudience,
  targetLocations,
  index,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Product Description</Label>
        <Textarea
          placeholder="Tell us about your product..."
          className="min-h-[100px]"
          value={description}
          onChange={(e) => onInputChange(index, 'description', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Target Audience</Label>
        <Textarea
          placeholder="Describe your target audience..."
          value={targetAudience}
          onChange={(e) => onInputChange(index, 'targetAudience', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Target Locations</Label>
        <Textarea
          placeholder="List your target geographic locations..."
          value={targetLocations}
          onChange={(e) => onInputChange(index, 'targetLocations', e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProductBriefDetails;
