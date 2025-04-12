
import { ProductBriefFormData, InputChangeParams, ToggleAccountParams, SelectAllAccountsParams } from "../types";
import { fetchProductBriefAccounts } from "../api/productBriefApi";
import { PlatformConnection } from "@/types/platforms";

export const createEmptyProduct = (): ProductBriefFormData => ({
  name: "",
  description: "",
  targetAudience: "",
  targetLocations: "",
  selectedAccounts: []
});

export const mapBriefToFormData = async (brief: any): Promise<ProductBriefFormData> => {
  // Fetch selected accounts for this brief
  let selectedAccounts: string[] = [];
  if (brief.id) {
    try {
      const accounts = await fetchProductBriefAccounts(brief.id);
      selectedAccounts = accounts.map((account: any) => account.ad_account_id);
    } catch (error) {
      console.error("Error fetching accounts for brief:", brief.id, error);
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
