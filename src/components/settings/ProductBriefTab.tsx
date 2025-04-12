import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, AlertCircle } from "lucide-react";
import { usePlatforms } from "@/contexts/PlatformsContext";
import ProductBriefForm from "./product-brief/ProductBriefForm";
import { useProductBriefService } from "./product-brief/useProductBriefService";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ProductBriefTab: React.FC = () => {
  const { toast } = useToast();
  const { connections } = usePlatforms();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
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
    handleSave
  } = useProductBriefService();

  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        console.log("Loading timeout reached for product briefs");
        setLoadingTimedOut(true);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  const handleAccountToggleWrapper = (productIndex: number, accountId: string) => {
    handleAccountToggle(productIndex, accountId);
  };

  const handleSelectAllWrapper = (productIndex: number, select: boolean) => {
    handleSelectAll(productIndex, select, connections);
  };

  const handleSaveProduct = (index: number) => {
    handleSave(connections, index);
  };

  const showContent = !isLoading || loadingTimedOut || hasAttemptedFetch;

  if (isLoading && !loadingTimedOut && !hasAttemptedFetch) {
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

  const renderLoadingWarning = () => {
    if (loadingTimedOut && isLoading) {
      return (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Loading Timeout</AlertTitle>
          <AlertDescription>
            Loading product briefs is taking longer than expected. Showing available data.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {renderLoadingWarning()}
      
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
