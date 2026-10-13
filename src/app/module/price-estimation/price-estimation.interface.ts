export interface IPriceSource {
  sourceName: string;
  productName?: string;
  price: number;
  sourceUrl?: string;
}

export interface IPriceEstimationResult {
  aiPredictedPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  confidenceScore: number;
  sources: IPriceSource[];
}

export interface IRecoveryMaterialInput {
  materialName: string;
  estimatedWeightMinGrams: number;
  estimatedWeightMaxGrams: number;
  recoveryRatePercent: number;
  confidenceScore: number;
  notes: string;
}

export interface IRecoveryAnalysisInput {
  estimatedTotalWeightMinGrams: number | null;
  estimatedTotalWeightMaxGrams: number | null;
  recommendation: "REUSE" | "REPAIR" | "RECYCLE";
  recommendationReason: string;
  assumptions: string;
  confidenceScore: number;
  materials: IRecoveryMaterialInput[];
}