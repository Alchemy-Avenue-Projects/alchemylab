
import { ProductBriefFormData, InputChangeParams, ToggleAccountParams, SelectAllAccountsParams } from "../types";
import { fetchProductBriefAccounts } from "../api/productBriefApi";

export const createEmptyProduct = (): ProductBriefFormData => ({
  name: '',
  description: '',
  targetAudience: '',
  targetLocations: '',
  selectedAccounts: []
});

export const mapBriefToFormData = async (brief: any): Promise<ProductBriefFormData> => {
  const accounts = await fetchProductBriefAccounts(brief.id);
  
  return {
    id: brief.id,
    name: brief.name,
    description: brief.description || '',
    targetAudience: brief.target_audience || '',
    targetLocations: brief.target_locations || '',
    selectedAccounts: accounts ? accounts.map((a: any) => a.ad_account_id) : []
  };
};

export const handleInputChangeHelper = ({ index, field, value, products }: InputChangeParams): ProductBriefFormData[] => {
  return products.map((product, i) => 
    i === index ? { ...product, [field]: value } : product
  );
};

export const handleAccountToggleHelper = ({ productIndex, accountId, products }: ToggleAccountParams): ProductBriefFormData[] => {
  return products.map((product, index) => {
    if (index === productIndex) {
      const selectedAccounts = product.selectedAccounts.includes(accountId)
        ? product.selectedAccounts.filter(id => id !== accountId)
        : [...product.selectedAccounts, accountId];
      
      return { ...product, selectedAccounts };
    }
    return product;
  });
};

export const handleSelectAllHelper = ({ productIndex, select, products, connections }: SelectAllAccountsParams): ProductBriefFormData[] => {
  return products.map((product, index) => {
    if (index === productIndex) {
      return {
        ...product,
        selectedAccounts: select ? connections.map(conn => conn.id) : []
      };
    }
    return product;
  });
};

export const validateProductBrief = (product: ProductBriefFormData): boolean => {
  return !!product.name && product.name.trim() !== '';
};
