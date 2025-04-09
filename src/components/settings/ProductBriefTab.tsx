
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Loader2 } from "lucide-react";
import { usePlatforms } from "@/contexts/PlatformsContext";
import ProductBriefForm from "./product-brief/ProductBriefForm";
import { useProductBriefService } from "./product-brief/useProductBriefService";

const ProductBriefTab: React.FC = () => {
  const { connections } = usePlatforms();
  const {
    products,
    isLoading,
    isSaving,
    handleAddProduct,
    handleRemoveProduct,
    handleInputChange,
    handleAccountToggle,
    handleSelectAll,
    handleSave
  } = useProductBriefService();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Loading product briefs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {products.map((product, index) => (
        <ProductBriefForm
          key={product.id || index}
          product={product}
          index={index}
          connections={connections}
          onRemove={handleRemoveProduct}
          onInputChange={handleInputChange}
          onAccountToggle={handleAccountToggle}
          onSelectAll={handleSelectAll}
        />
      ))}
      
      <Button 
        variant="outline" 
        className="w-full py-6 border-dashed flex items-center justify-center gap-2" 
        onClick={handleAddProduct}
      >
        <PlusCircle className="h-4 w-4" />
        Add Another Product
      </Button>
      
      <div className="flex justify-end">
        <Button 
          className="alchemy-gradient" 
          onClick={() => handleSave(connections)}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Briefs
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductBriefTab;
