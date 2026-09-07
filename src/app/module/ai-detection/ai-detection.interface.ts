import { ProductCondition } from "../../../generated/prisma/client";

export interface IAnalyzeProductImage {
  productId: string;
  imageUrl: string;
}

export interface IAIDetectionResult {
  detectedCategory: string | null;
  detectedBrand: string | null;
  detectedModel: string | null;
  condition: ProductCondition | null;
  confidenceScore: number;
  aiModel: string;
}