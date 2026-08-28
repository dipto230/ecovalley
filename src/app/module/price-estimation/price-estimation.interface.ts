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