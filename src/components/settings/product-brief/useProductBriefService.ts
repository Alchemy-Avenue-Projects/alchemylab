
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProductBriefFormData } from "./types";
import { createEmptyProduct, mapBriefToFormData, handleInputChangeHelper, handleAccountToggleHelper, handleSelectAllHelper } from "./utils/productBriefUtils";
import { fetchProductBriefsFromApi, fetchProductBriefAccounts } from "./api/productBriefApi";
import { useSaveProductBrief } from "./hooks/useSaveProductBrief";
import { PlatformConnection } from "@/types/platforms";

export const useProductBriefService = () => {

  const { user } = useAuth();
  const [products, setProducts] = useState<ProductBriefFormData[]>([createEmptyProduct()]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { isSaving, handleSaveProduct } = useSaveProductBrief();

  const fetchProductBriefs = useCallback(async () => {
    if (!user) {
      console.log("No user found, cannot fetch product briefs");
      setIsLoading(false);
      setHasAttemptedFetch(true);
      return;
    }

    setIsLoading(true);

    try {
      console.log("Fetching product briefs for user:", user.id);
      const productBriefs = await fetchProductBriefsFromApi(user.id);

      if (productBriefs && productBriefs.length > 0) {
        console.log("Found product briefs:", productBriefs.length);
        // For each product brief, get its associated accounts
        // Use Promise.allSettled to handle partial failures gracefully
        const productsWithAccounts = await Promise.allSettled(
          productBriefs.map(async (brief) => {
            try {
              const formData = await mapBriefToFormData(brief);
              return formData;
            } catch (error) {
              console.error(`Error mapping brief ${brief.id}:`, error);
              // Return a basic form data even if account mapping fails
              return {
                id: brief.id,
                name: brief.name || "",
                description: brief.description || "",
                targetAudience: brief.target_audience || "",
                targetLocations: brief.target_locations || "",
                selectedAccounts: [] // Empty accounts if mapping fails
              };
            }
          })
        );

        // Extract successful results, filter out rejected ones
        const successfulProducts = productsWithAccounts
          .filter((result): result is PromiseFulfilledResult<ProductBriefFormData> =>
            result.status === 'fulfilled'
          )
          .map(result => result.value);

        if (successfulProducts.length > 0) {
          setProducts(successfulProducts);
        } else {
          // If all failed, still show the briefs without accounts
          setProducts(productBriefs.map(brief => ({
            id: brief.id,
            name: brief.name || "",
            description: brief.description || "",
            targetAudience: brief.target_audience || "",
            targetLocations: brief.target_locations || "",
            selectedAccounts: []
          })));
        }
      } else {
        console.log("No product briefs found, using default empty brief");
        setProducts([createEmptyProduct()]);
      }
    } catch (error) {
      console.error('Error fetching product briefs:', error);
      toast.error("Failed to load product briefs.");
      // Set default state even if there's an error
      setProducts([createEmptyProduct()]);
    } finally {
      // Always ensure loading state is set to false
      console.log("Setting isLoading to false after fetch operation");
      setIsLoading(false);
      setHasAttemptedFetch(true);
    }
  }, [user, toast]);

  // Load product briefs when the component mounts
  useEffect(() => {
    console.log("Auth state changed, user:", user?.id);
    if (user) {
      // Fetch immediately - no delay needed as auth state is already resolved
      fetchProductBriefs();
    } else {
      // If no user, exit loading state to avoid infinite spinner
      setIsLoading(false);
      setHasAttemptedFetch(true);
    }
  }, [user, fetchProductBriefs]);

  const handleAddProduct = () => {
    setProducts([...products, createEmptyProduct()]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    setProducts(handleInputChangeHelper({ index, field, value, products }));
  };

  const handleAccountToggle = (productIndex: number, accountId: string) => {
    setProducts(handleAccountToggleHelper({ productIndex, accountId, products }));
  };

  const handleSelectAll = (productIndex: number, select: boolean, connections: PlatformConnection[]) => {
    setProducts(handleSelectAllHelper({ productIndex, select, products, connections }));
  };

  const handleSave = async (connections: PlatformConnection[], productIndex?: number) => {
    if (!user) {
      toast.error("You must be logged in to save product briefs.");
      return;
    }

    try {
      const result = await handleSaveProduct(products, connections, user?.id, productIndex);

      if (result) {
        setProducts(result.updatedProducts);

        if (productIndex !== undefined) {
          toast.success(`Product brief "${products[productIndex].name}" saved successfully.`);
        } else {
          toast.success(`All product briefs saved successfully.`);
        }
      }
    } catch (error) {
      console.error('Error saving product briefs:', error);
      toast.error("Failed to save product briefs.");
    }
  };

  return {
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
    refetch: fetchProductBriefs
  };
};
