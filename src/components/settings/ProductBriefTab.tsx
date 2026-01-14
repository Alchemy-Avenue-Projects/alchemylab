import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, AlertCircle } from "lucide-react";
import { usePlatforms } from "@/contexts/PlatformsContext";
import ProductBriefForm from "./product-brief/ProductBriefForm";
import { useProductBriefService } from "./product-brief/useProductBriefService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ProductBriefTab: React.FC = () => {

  const { connections } = usePlatforms();
  const {
    products,
    isLoading,
    isSaving,
    hasAttemptedFetch,
    handleAddProduct,
    handleRemoveProduct,
    handleInputChange,
    handleAccountToggle,
    handleSelectAll,
    handleSave,
    refetch
  } = useProductBriefService();

  const handleAccountToggleWrapper = (productIndex: number, accountId: string) => {
    handleAccountToggle(productIndex, accountId);
  };

  const handleSelectAllWrapper = (productIndex: number, select: boolean) => {
    handleSelectAll(productIndex, select, connections);
  };

  const handleSaveProduct = (index: number) => {
    handleSave(connections, index);
  };

  const handleRetry = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Retry failed:", error);
      toast.error("Failed to reload product briefs. Please try again.");
    }
  };

  // Show loading state only if we haven't attempted fetch yet
  if (isLoading && !hasAttemptedFetch) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
          <span>Loading product briefs...</span>
        </div>
      </div>
    );
  }

  // Show error state if loading failed and we have no products
  if (!isLoading && hasAttemptedFetch && products.length === 0) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to Load Product Briefs</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Unable to load product briefs. Please try again.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        <Button onClick={handleAddProduct}>Create First Brief</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {products.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">No product briefs found. Create one to get started.</p>
          <Button onClick={handleAddProduct}>Create First Brief</Button>
        </div>
      ) : (
        products.map((product, index) => (
          <ProductBriefForm
            key={product.id || `product-${index}`}
            product={product}
            index={index}
            connections={connections}
            onRemove={handleRemoveProduct}
            onInputChange={handleInputChange}
            onAccountToggle={handleAccountToggleWrapper}
            onSelectAll={handleSelectAllWrapper}
            onSave={handleSaveProduct}
            isSaving={isSaving}
          />
        ))
      )}

      {products.length > 0 && (
        <Button
          variant="outline"
          className="w-full py-6 border-dashed flex items-center justify-center gap-2"
          onClick={handleAddProduct}
        >
          <PlusCircle className="h-4 w-4" />
          Add Another Product
        </Button>
      )}
    </div>
  );
};

export default ProductBriefTab;
