
import { ProductBriefFormData } from "../types";

export interface SaveProductParams {
  product: ProductBriefFormData;
  connections: any[];
  userId: string | undefined;
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

export interface InputChangeParams {
  index: number;
  field: string;
  value: string;
  products: ProductBriefFormData[];
}

export * from "../types";
