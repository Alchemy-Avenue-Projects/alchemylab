
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SaveProductParams, ProductBriefFormData } from "../types";
import { validateProductBrief } from "../utils/productBriefUtils";
import { saveProductToApi, deleteProductAccounts, saveProductAccounts } from "../api/productBriefApi";

export const useSaveProductBrief = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveProduct = async ({ product, userId }: SaveProductParams) => {
    if (!validateProductBrief(product)) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      const productId = await saveProductToApi(product, userId);
      
      if (productId) {
        // Remove all existing account associations for this product
        await deleteProductAccounts(productId);
        
        // Insert new account associations
        await saveProductAccounts(productId, product.selectedAccounts);
      }
      
      return productId;
    } catch (error) {
      console.error('Error saving product brief:', error);
      throw error;
    }
  };

  const handleSaveProduct = async (
    products: SaveProductParams["product"][],
    connections: any[],
    userId: string | undefined,
    productIndex?: number
  ) => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save product briefs.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (productIndex !== undefined) {
        // Save just one product
        const product = products[productIndex];
        if (!validateProductBrief(product)) return;
        
        const productId = await saveProduct({ product, connections, userId });
        
        if (productId) {
          toast({
            title: "Success",
            description: `Product brief "${product.name}" saved successfully.`
          });
          
          // Return the updated product with ID
          return {
            updatedProducts: products.map((p, i) => 
              i === productIndex && !p.id ? { ...p, id: productId } : p
            ),
            savedIndex: productIndex
          };
        }
      } else {
        // Save all products
        const updatedProducts = [...products];
        let allValid = true;
        
        for (const product of products) {
          if (!validateProductBrief(product)) {
            allValid = false;
            break;
          }
        }
        
        if (!allValid) {
          toast({
            title: "Validation Error",
            description: "All product names are required.",
            variant: "destructive"
          });
          return;
        }
        
        // For each product, insert or update in the database
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const productId = await saveProduct({ product, connections, userId });
          
          // Update the id if it's a new product
          if (productId && !product.id) {
            updatedProducts[i] = { ...product, id: productId };
          }
        }
        
        toast({
          title: "Success",
          description: `Saved ${products.length} product ${products.length === 1 ? 'brief' : 'briefs'}.`
        });
        
        return { updatedProducts, savedIndex: null };
      }
    } catch (error) {
      console.error('Error saving product briefs:', error);
      toast({
        title: "Error",
        description: "Failed to save product briefs.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveProduct
  };
};
