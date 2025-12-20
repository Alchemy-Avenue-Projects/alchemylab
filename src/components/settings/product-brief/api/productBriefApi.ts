
import { supabase } from "@/integrations/supabase/client";
import { ProductBriefFormData } from "../types";
import { getOrCreateAdAccount, getAdAccountIdFromPlatformConnection } from "@/services/platforms/adAccountSync";

export const fetchProductBriefsFromApi = async (userId: string) => {
  console.log("Fetching product briefs for user:", userId);
  
  try {
    const { data: productBriefs, error } = await supabase
      .from('product_briefs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching product briefs:", error);
      // Provide more detailed error information
      throw new Error(`Failed to fetch product briefs: ${error.message} (Code: ${error.code})`);
    }
    
    console.log("Product briefs fetched:", productBriefs);
    return productBriefs || [];
  } catch (error) {
    // Re-throw with additional context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error fetching product briefs: ${String(error)}`);
  }
};

export const fetchProductBriefAccounts = async (briefId: string) => {
  const { data: accounts, error } = await supabase
    .from('product_brief_accounts')
    .select('ad_account_id')
    .eq('product_brief_id', briefId);
    
  if (error) {
    console.error("Error fetching accounts for brief:", briefId, error);
    throw error;
  }
  
  return accounts;
};

export const saveProductToApi = async (
  product: ProductBriefFormData, 
  userId: string | undefined
) => {
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
        user_id: userId,
        name: product.name,
        description: product.description,
        target_audience: product.targetAudience,
        target_locations: product.targetLocations
      })
      .select();
      
    if (error) throw error;
    if (data) productId = data[0].id;
  }
  
  return productId;
};

export const deleteProductAccounts = async (productId: string) => {
  const { error } = await supabase
    .from('product_brief_accounts')
    .delete()
    .eq('product_brief_id', productId);
    
  if (error) throw error;
};

export const saveProductAccounts = async (
  productId: string, 
  selectedAccounts: string[],
  organizationId: string
) => {
  if (selectedAccounts.length > 0) {
    // Map platform_connection.id to ad_account_id
    // selectedAccounts contains platform_connection.id values from the UI
    const adAccountIds = await Promise.all(
      selectedAccounts.map(async (platformConnectionId) => {
        // First try to get existing ad_account
        let adAccountId = await getAdAccountIdFromPlatformConnection(
          platformConnectionId,
          organizationId
        );
        
        // If not found, create one
        if (!adAccountId) {
          adAccountId = await getOrCreateAdAccount(
            platformConnectionId,
            organizationId
          );
        }
        
        return adAccountId;
      })
    );
    
    // Filter out any null values (shouldn't happen, but be safe)
    const validAdAccountIds = adAccountIds.filter((id): id is string => id !== null);
    
    if (validAdAccountIds.length > 0) {
      const accountMappings = validAdAccountIds.map(adAccountId => ({
        product_brief_id: productId,
        ad_account_id: adAccountId
      }));
      
      const { error: insertError } = await supabase
        .from('product_brief_accounts')
        .insert(accountMappings);
        
      if (insertError) throw insertError;
    }
  }
};
