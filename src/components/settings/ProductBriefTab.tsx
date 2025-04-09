
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Loader2, AlertCircle } from "lucide-react";
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

  // Reset timeout state when loading changes
  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
    }
  }, [isLoading]);

  // Add a timeout to detect stuck loading state
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        console.log("Loading timeout reached, might be stuck");
        setLoadingTimedOut(true);
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  // Force-show content if loading gets stuck or when we've attempted a fetch
  const showContent = !isLoading || loadingTimedOut || hasAttemptedFetch;

  // Initial loading state with skeleton
  if (isLoading && !loadingTimedOut && !hasAttemptedFetch) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-lg">Loading product briefs...</span>
        </div>
      </div>
    );
  }

  // Show warning if loading timed out
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
            key={product.id || index}
            product={product}
            index={index}
            connections={connections}
            onRemove={handleRemoveProduct}
            onInputChange={handleInputChange}
            onAccountToggle={handleAccountToggle}
            onSelectAll={handleSelectAll}
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
