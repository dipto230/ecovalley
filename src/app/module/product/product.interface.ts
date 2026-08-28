import {
  ProductCondition,
  ProductStatus,
} from "../../../generated/prisma/enums";

export interface ICreateProduct {
  title: string;
  description?: string;
  brand?: string;
  model?: string;
  condition: ProductCondition;
  quantity?: number;
  estimatedPrice: number;
  vendorId?: string;
  categoryId: string;
}

export interface IUpdateProduct {
  title?: string;
  description?: string;
  brand?: string;
  model?: string;
  condition?: ProductCondition;
  quantity?: number;
  estimatedPrice?: number;
  status?: ProductStatus;
  vendorId?: string;
  categoryId?: string;
}

export interface IProductActor {
  userId: string;
  role: string;
}