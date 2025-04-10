import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProductBriefFormData } from "./types";
import { createEmptyProduct, mapBriefToFormData, handleInputChangeHelper, handleAccountToggleHelper, handleSelectAllHelper } from "./utils/productBriefUtils";
import { fetchProductBriefsFromApi } from "./api/productBriefApi";
import { useSaveProductBrief } from "./hooks/useSaveProductBrief";

export const useProductBriefService = () => {
  const { toast } = useToast();
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
        const productsWithAccounts = await Promise.all(
          productBriefs.map(brief => mapBriefToFormData(brief))
        );
        
        setProducts(productsWithAccounts);
      } else {
        console.log("No product briefs found, using default empty brief");
        setProducts([createEmptyProduct()]);
      }
    } catch (error) {
      console.error('Error fetching product briefs:', error);
      toast({
        title: "Error",
        description: "Failed to load product briefs.",
        variant: "destructive"
      });
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
      // Add a small delay to ensure auth state is fully resolved
      const timer = setTimeout(() => {
        fetchProductBriefs();
      }, 500);
      return () => clearTimeout(timer);
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

  const handleSelectAll = (productIndex: number, select: boolean) => {
    setProducts(handleSelectAllHelper({ productIndex, select, products, connections: [] }));
  };

  const handleSave = async (connections: any[], productIndex?: number) => {
    const result = await handleSaveProduct(products, connections, user?.id, productIndex);
    
    if (result) {
      setProducts(result.updatedProducts);
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
    handleSave
  };
};
