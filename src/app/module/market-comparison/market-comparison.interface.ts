export interface ICreateMarketComparison {
  productId: string;
  platformName: string;
  productUrl: string;
  marketPrice: number;
}

export interface IMarketComparisonQuery {
  page?: number;
  limit?: number;
  platformName?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}