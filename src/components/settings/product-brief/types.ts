
export type ProductBriefFormData = {
  id?: string;
  name: string;
  description: string;
  targetAudience: string;
  targetLocations: string;
  selectedAccounts: string[];
};

export interface SaveProductParams {
  product: ProductBriefFormData;
  connections?: any[];
  userId: string | undefined;
}

export interface InputChangeParams {
  index: number;
  field: string;
  value: string;
  products: ProductBriefFormData[];
}

export interface ToggleAccountParams {
  productIndex: number;
  accountId: string;
  products: ProductBriefFormData[];
}

export interface SelectAllAccountsParams {
  productIndex: number;
  select: boolean;
  products: ProductBriefFormData[];
  connections: any[];
}
