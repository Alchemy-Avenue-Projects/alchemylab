
import { ProductBriefFormData, InputChangeParams, ToggleAccountParams, SelectAllAccountsParams } from "../types";
import { fetchProductBriefAccounts } from "../api/productBriefApi";
import { PlatformConnection } from "@/types/platforms";
import { getPlatformConnectionIdFromAdAccount } from "@/services/platforms/adAccountSync";

export const createEmptyProduct = (): ProductBriefFormData => ({
  name: "",
  description: "",
  targetAudience: "",
  targetLocations: "",
  selectedAccounts: []
});

export const mapBriefToFormData = async (brief: any): Promise<ProductBriefFormData> => {
  // Fetch selected accounts for this brief
  // The DB stores ad_account_id, but the UI uses platform_connection.id
  // So we need to map ad_account_id -> platform_connection.id
  let selectedAccounts: string[] = [];
  if (brief.id) {
    try {
      const accounts = await fetchProductBriefAccounts(brief.id);
      
      if (accounts && accounts.length > 0) {
        // Map each ad_account_id to platform_connection.id in parallel
        // Use Promise.allSettled to handle individual failures gracefully
        const mappedResults = await Promise.allSettled(
          accounts.map(async (account: any) => {
            try {
              const platformConnectionId = await getPlatformConnectionIdFromAdAccount(account.ad_account_id);
              return platformConnectionId;
            } catch (error) {
              console.error(`Error mapping ad_account ${account.ad_account_id}:`, error);
              return null;
            }
          })
        );
        
        // Extract successful mappings
        selectedAccounts = mappedResults
          .filter((result): result is PromiseFulfilledResult<string | null> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value as string);
      }
    } catch (error) {
      console.error("Error fetching accounts for brief:", brief.id, error);
      // Continue with empty selectedAccounts if fetch fails
    }
  }
  
  return {
    id: brief.id,
    name: brief.name || "",
    description: brief.description || "",
    targetAudience: brief.target_audience || "",
    targetLocations: brief.target_locations || "",
    selectedAccounts
  };
};

export const validateProductBrief = (product: ProductBriefFormData): boolean => {
  return !!product.name && product.name.trim() !== "";
};

export const handleInputChangeHelper = ({ 
  index, 
  field, 
  value, 
  products 
}: InputChangeParams): ProductBriefFormData[] => {
  return products.map((product, i) => {
    if (i !== index) return product;
    
    return {
      ...product,
      [field]: value
    };
  });
};

export const handleAccountToggleHelper = ({ 
  productIndex, 
  accountId, 
  products 
}: ToggleAccountParams): ProductBriefFormData[] => {
  return products.map((product, index) => {
    if (index !== productIndex) return product;
    
    const isSelected = product.selectedAccounts.includes(accountId);
    
    return {
      ...product,
      selectedAccounts: isSelected
        ? product.selectedAccounts.filter(id => id !== accountId)
        : [...product.selectedAccounts, accountId]
    };
  });
};

export const handleSelectAllHelper = ({ 
  productIndex, 
  select, 
  products, 
  connections 
}: SelectAllAccountsParams): ProductBriefFormData[] => {
  // Filter connections to only include ad platforms
  const adConnections = connections.filter(conn => 
    ['facebook', 'google', 'linkedin', 'tiktok', 'pinterest'].includes(conn.platform)
  );
  
  const allAccountIds = adConnections.map(conn => conn.id);
  
  return products.map((product, index) => {
    if (index !== productIndex) return product;
    
    return {
      ...product,
      selectedAccounts: select ? allAccountIds : []
    };
  });
};
