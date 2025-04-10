
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProductBriefFormData } from "./types";
import { ProductBrief } from "@/types/database";

export const useProductBriefService = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductBriefFormData[]>([
    {
      name: '',
      description: '',
      targetAudience: '',
      targetLocations: '',
      selectedAccounts: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

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
      
      const { data: productBriefs, error } = await supabase
        .from('product_briefs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching product briefs:", error);
        throw error;
      }
      
      console.log("Product briefs fetched:", productBriefs);
      
      if (productBriefs && productBriefs.length > 0) {
        // For each product brief, get its associated accounts
        const productsWithAccounts = await Promise.all(
          productBriefs.map(async (brief) => {
            const { data: accounts, error: accountsError } = await supabase
              .from('product_brief_accounts')
              .select('ad_account_id')
              .eq('product_brief_id', brief.id);
              
            if (accountsError) {
              console.error("Error fetching accounts for brief:", brief.id, accountsError);
              throw accountsError;
            }
            
            return {
              id: brief.id,
              name: brief.name,
              description: brief.description || '',
              targetAudience: brief.target_audience || '',
              targetLocations: brief.target_locations || '',
              selectedAccounts: accounts ? accounts.map(a => a.ad_account_id) : []
            };
          })
        );
        
        console.log("Products with accounts:", productsWithAccounts);
        setProducts(productsWithAccounts);
      } else {
        // If no briefs found, use the default empty brief template
        console.log("No product briefs found, using default empty brief");
        setProducts([{
          name: '',
          description: '',
          targetAudience: '',
          targetLocations: '',
          selectedAccounts: []
        }]);
      }
    } catch (error) {
      console.error('Error fetching product briefs:', error);
      toast({
        title: "Error",
        description: "Failed to load product briefs.",
        variant: "destructive"
      });
      // Set default state even if there's an error
      setProducts([{
        name: '',
        description: '',
        targetAudience: '',
        targetLocations: '',
        selectedAccounts: []
      }]);
    } finally {
      // Always ensure loading state is set to false
      console.log("Setting isLoading to false after fetch operation");
      setIsLoading(false);
      setHasAttemptedFetch(true);
    }
  }, [user, toast]);

  // Use immediate loading state management
  useEffect(() => {
    console.log("Auth state changed, user:", user?.id);
    if (user) {
      fetchProductBriefs();
    } else {
      // If no user, exit loading state to avoid infinite spinner
      setIsLoading(false);
      setHasAttemptedFetch(true);
    }
  }, [user, fetchProductBriefs]);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        name: '',
        description: '',
        targetAudience: '',
        targetLocations: '',
        selectedAccounts: []
      }
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    setProducts(products.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    ));
  };

  const handleAccountToggle = (productIndex: number, accountId: string) => {
    setProducts(products.map((product, index) => {
      if (index === productIndex) {
        const selectedAccounts = product.selectedAccounts.includes(accountId)
          ? product.selectedAccounts.filter(id => id !== accountId)
          : [...product.selectedAccounts, accountId];
        
        return { ...product, selectedAccounts };
      }
      return product;
    }));
  };

  const handleSelectAll = (productIndex: number, select: boolean) => {
    setProducts(products.map((product, index) => {
      if (index === productIndex) {
        return {
          ...product,
          selectedAccounts: select ? (product as any).connections?.map((conn: any) => conn.id) || [] : []
        };
      }
      return product;
    }));
  };

  const validateProducts = (productIndex?: number) => {
    if (productIndex !== undefined) {
      const product = products[productIndex];
      if (!product.name || product.name.trim() === '') {
        toast({
          title: "Validation Error",
          description: "Product name is required.",
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
    
    for (const product of products) {
      if (!product.name || product.name.trim() === '') {
        toast({
          title: "Validation Error",
          description: "Product name is required.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const saveProduct = async (product: ProductBriefFormData, connections: any[]) => {
    let productId = product.id;
    
    // If product has an id, update it; otherwise, insert a new one
    if (productId) {
      const { error } = await supabase
        .from('product_briefs')
        .update({
          name: product.name,
          description: product.description,
          target_audience: product.targetAudience,
          target_locations: product.targetLocations
        })
        .eq('id', productId);
        
      if (error) throw error;
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('product_briefs')
        .insert({
          user_id: user?.id,
          name: product.name,
          description: product.description,
          target_audience: product.targetAudience,
          target_locations: product.targetLocations
        })
        .select();
        
      if (error) throw error;
      if (data) productId = data[0].id;
    }
    
    // Remove all existing account associations for this product
    if (productId) {
      const { error } = await supabase
        .from('product_brief_accounts')
        .delete()
        .eq('product_brief_id', productId);
        
      if (error) throw error;
      
      // Insert new account associations
      if (product.selectedAccounts.length > 0) {
        const accountMappings = product.selectedAccounts.map(accountId => ({
          product_brief_id: productId,
          ad_account_id: accountId
        }));
        
        const { error: insertError } = await supabase
          .from('product_brief_accounts')
          .insert(accountMappings);
          
        if (insertError) throw insertError;
      }
    }
    
    return productId;
  };

  const handleSave = async (connections: any[], productIndex?: number) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save product briefs.",
        variant: "destructive"
      });
      return;
    }
    
    if (productIndex !== undefined) {
      // Save just one product
      if (!validateProducts(productIndex)) return;
      
      setIsSaving(true);
      
      try {
        const product = products[productIndex];
        const productId = await saveProduct(product, connections);
        
        // Update the products array with the new id
        if (!product.id) {
          setProducts(products.map((p, i) => 
            i === productIndex ? { ...p, id: productId } : p
          ));
        }
        
        toast({
          title: "Success",
          description: `Product brief "${product.name}" saved successfully.`
        });
      } catch (error) {
        console.error('Error saving product brief:', error);
        toast({
          title: "Error",
          description: "Failed to save product brief.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
      
      return;
    }
    
    // Save all products
    if (!validateProducts()) return;
    
    setIsSaving(true);
    
    try {
      // For each product, insert or update in the database
      const updatedProducts = [...products];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productId = await saveProduct(product, connections);
        
        // Update the id if it's a new product
        if (!product.id) {
          updatedProducts[i] = { ...product, id: productId };
        }
      }
      
      setProducts(updatedProducts);
      
      toast({
        title: "Success",
        description: `Saved ${products.length} product ${products.length === 1 ? 'brief' : 'briefs'}.`
      });
      
    } catch (error) {
      console.error('Error saving product briefs:', error);
      toast({
        title: "Error",
        description: "Failed to save product briefs.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
