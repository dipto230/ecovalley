export interface IMarketQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  unit: string;
  category: string;
  source: string;
  sourceTimestamp: string;
  fetchedAt: string;

  change: number | null;
  changePercent: number | null;

  high: number | null;
  low: number | null;

  bid: number | null;
  ask: number | null;
}

export interface IMarketHistoryPoint {
  symbol: string;
  price: number;
  timestamp: string;
  source: string;
}

export interface IMetalsDevSpotResponse {
  status: string;
  timestamp?: string;
  currency?: string;
  unit?: string;
  metal?: string;

  rate?: {
    price?: number;
    change?: number;
    change_percent?: number;
    high?: number;
    low?: number;
    bid?: number;
    ask?: number;
  };

  error_code?: string;
  error_message?: string;
}

export interface IRecoveryValueInput {
  symbol: string;
  weightKg: number;
  recoveryRatePercent: number;
}

export interface IRecoveryValueResult {
  symbol: string;
  metal: string;
  inputWeightKg: number;
  recoveryRatePercent: number;
  estimatedRecoveredWeightKg: number;
  estimatedPricePerKg: number;
  estimatedGrossValue: number;
  currency: string;
  source: string;
  sourceTimestamp: string;
  disclaimer: string;
}