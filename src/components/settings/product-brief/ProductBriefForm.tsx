
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AccountSelectionList from "./AccountSelectionList";
import { ProductBriefFormData } from "./types";

interface ProductBriefFormProps {
  product: ProductBriefFormData;
  index: number;
  connections: any[];
  onRemove: (index: number) => void;
  onInputChange: (index: number, field: string, value: string) => void;
  onAccountToggle: (productIndex: number, accountId: string) => void;
  onSelectAll: (productIndex: number, select: boolean) => void;
}

const ProductBriefForm: React.FC<ProductBriefFormProps> = ({
  product,
  index,
  connections,
  onRemove,
  onInputChange,
  onAccountToggle,
  onSelectAll
}) => {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            <Input
              className="font-bold text-lg h-8 px-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={product.name}
              onChange={(e) => onInputChange(index, 'name', e.target.value)}
              placeholder="Enter product name"
            />
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        <CardDescription>
          Complete the brief for this product to inform your ad campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Product Description</Label>
            <Textarea
              placeholder="Tell us about your product..."
              className="min-h-[100px]"
              value={product.description}
              onChange={(e) => onInputChange(index, 'description', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Textarea
              placeholder="Describe your target audience..."
              value={product.targetAudience}
              onChange={(e) => onInputChange(index, 'targetAudience', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Target Locations</Label>
            <Textarea
              placeholder="List your target geographic locations..."
              value={product.targetLocations}
              onChange={(e) => onInputChange(index, 'targetLocations', e.target.value)}
            />
          </div>
        </div>
        
        <Separator />
        
        <AccountSelectionList
          connections={connections}
          selectedAccounts={product.selectedAccounts}
          productIndex={index}
          onAccountToggle={onAccountToggle}
          onSelectAll={onSelectAll}
        />
      </CardContent>
    </Card>
  );
};

export default ProductBriefForm;
