
import React from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AccountSelectionList from "./AccountSelectionList";
import { ProductBriefFormData } from "./types";
import ProductBriefHeader from "./form/ProductBriefHeader";
import ProductBriefDetails from "./form/ProductBriefDetails";
import ProductBriefFooter from "./form/ProductBriefFooter";

interface ProductBriefFormProps {
  product: ProductBriefFormData;
  index: number;
  connections: any[];
  onRemove: (index: number) => void;
  onInputChange: (index: number, field: string, value: string) => void;
  onAccountToggle: (productIndex: number, accountId: string) => void;
  onSelectAll: (productIndex: number, select: boolean) => void;
  onSave: (index: number) => void;
  isSaving: boolean;
}

const ProductBriefForm: React.FC<ProductBriefFormProps> = ({
  product,
  index,
  connections,
  onRemove,
  onInputChange,
  onAccountToggle,
  onSelectAll,
  onSave,
  isSaving
}) => {
  return (
    <Card className="relative">
      <CardHeader>
        <ProductBriefHeader 
          name={product.name}
          index={index}
          onInputChange={onInputChange}
          onRemove={onRemove}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <ProductBriefDetails
          description={product.description}
          targetAudience={product.targetAudience}
          targetLocations={product.targetLocations}
          index={index}
          onInputChange={onInputChange}
        />
        
        <Separator />
        
        <AccountSelectionList
          connections={connections}
          selectedAccounts={product.selectedAccounts}
          productIndex={index}
          onAccountToggle={onAccountToggle}
          onSelectAll={onSelectAll}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <ProductBriefFooter
          index={index}
          onSave={onSave}
          isSaving={isSaving}
        />
      </CardFooter>
    </Card>
  );
};

export default ProductBriefForm;
