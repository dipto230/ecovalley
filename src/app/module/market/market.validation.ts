import {
  MARKET_DEFAULT_HISTORY_LIMIT,
  MARKET_MAX_HISTORY_LIMIT,
} from "./market.constant";

export const normalizeSymbol = (
  symbol: unknown,
): string | null => {
  if (
    typeof symbol !== "string" ||
    !/^[a-zA-Z]{1,20}$/.test(symbol)
  ) {
    return null;
  }

  return symbol.toUpperCase();
};

export const parseHistoryLimit = (
  value: unknown,
): number | null => {
  if (value === undefined) {
    return MARKET_DEFAULT_HISTORY_LIMIT;
  }

  if (
    typeof value !== "string" ||
    !/^\d+$/.test(value)
  ) {
    return null;
  }

  const limit = Number(value);

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > MARKET_MAX_HISTORY_LIMIT
  ) {
    return null;
  }

  return limit;
};

export const parseRecoveryValueInput = (
  query: Record<string, unknown>,
) => {
  const symbol = normalizeSymbol(query.symbol);

  if (!symbol) {
    return {
      valid: false as const,
      message: "A valid metal symbol is required",
    };
  }

  if (
    typeof query.weightKg !== "string" ||
    query.weightKg.trim() === ""
  ) {
    return {
      valid: false as const,
      message: "weightKg is required",
    };
  }

  if (
    typeof query.recoveryRatePercent !== "string" ||
    query.recoveryRatePercent.trim() === ""
  ) {
    return {
      valid: false as const,
      message: "recoveryRatePercent is required",
    };
  }

  const weightKg = Number(query.weightKg);

  const recoveryRatePercent = Number(
    query.recoveryRatePercent,
  );

  if (
    !Number.isFinite(weightKg) ||
    weightKg <= 0 ||
    weightKg > 1_000_000
  ) {
    return {
      valid: false as const,
      message:
        "weightKg must be greater than 0 and at most 1000000",
    };
  }

  if (
    !Number.isFinite(recoveryRatePercent) ||
    recoveryRatePercent < 0 ||
    recoveryRatePercent > 100
  ) {
    return {
      valid: false as const,
      message:
        "recoveryRatePercent must be between 0 and 100",
    };
  }

  return {
    valid: true as const,
    data: {
      symbol,
      weightKg,
      recoveryRatePercent,
    },
  };
};