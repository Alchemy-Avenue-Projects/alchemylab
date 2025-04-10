
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface ProductBriefHeaderProps {
  name: string;
  index: number;
  onInputChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

const ProductBriefHeader: React.FC<ProductBriefHeaderProps> = ({
  name,
  index,
  onInputChange,
  onRemove
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <CardTitle>
          <Input
            className="font-bold text-lg h-8 px-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={name}
            onChange={(e) => onInputChange(index, 'name', e.target.value)}
            placeholder="Enter product name"
          />
        </CardTitle>
        <CardDescription>
          Complete the brief for this product to inform your ad campaigns
        </CardDescription>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};

export default ProductBriefHeader;
