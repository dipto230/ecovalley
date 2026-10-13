
import {
  MARKET_CACHE_TTL_MS,
  MARKET_HISTORY_MAX_POINTS,
  MARKET_HISTORY_RETENTION_MS,
  MARKET_METALS,
  MARKET_SOURCE,
} from "./market.constant";

import type {
  IMarketHistoryPoint,
  IMarketQuote,
  IMetalsDevSpotResponse,
  IRecoveryValueInput,
  IRecoveryValueResult,
} from "./market.interface";

const API_URL = "https://api.metals.dev/v1/metal/spot";

let cachedQuotes: IMarketQuote[] = [];

let cachedAt = 0;

let refreshPromise: Promise<IMarketQuote[]> | null = null;

const history = new Map<string, IMarketHistoryPoint[]>();

const roundMoney = (value: number): number =>
  Number(value.toFixed(2));

const validNumber = (value: unknown): number | null => {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
};

const getSourceTimestamp = (value: string | undefined): string => {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
};

function addHistorySnapshot(quote: IMarketQuote): void {
  const existing = history.get(quote.symbol) ?? [];

  const alreadyExists = existing.some(
    (point) => point.timestamp === quote.sourceTimestamp,
  );

  if (alreadyExists) {
    return;
  }

  existing.push({
    symbol: quote.symbol,
    price: quote.price,
    timestamp: quote.sourceTimestamp,
    source: quote.source,
  });

  const cutoff = Date.now() - MARKET_HISTORY_RETENTION_MS;

  const retained = existing
    .filter(
      (point) => new Date(point.timestamp).getTime() >= cutoff,
    )
    .slice(-MARKET_HISTORY_MAX_POINTS);

  history.set(quote.symbol, retained);
}

async function fetchSpotQuote(
  metal: (typeof MARKET_METALS)[number],
): Promise<IMarketQuote> {
  const apiKey = process.env.METALS_DEV_API_KEY;

  if (!apiKey) {
    throw new Error(
      "METALS_DEV_API_KEY is not configured. Check your backend environment variables.",
    );
  }

  const url = new URL(API_URL);

  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("metal", metal.providerSymbol);
  url.searchParams.set("currency", "USD");

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    throw new Error(
      `Network error fetching ${metal.symbol}: ${message}`,
    );
  }

  if (!response.ok) {
    // Do not log the full request URL because it contains the API key.
    let providerMessage = "";

    try {
      const body = (await response.json()) as {
        error_message?: string;
        message?: string;
      };

      providerMessage =
        body.error_message ?? body.message ?? "";
    } catch {
      // The provider may return a non-JSON error response.
    }

    throw new Error(
      `Provider request failed for ${metal.symbol}: HTTP ${response.status}${
        providerMessage ? ` - ${providerMessage}` : ""
      }`,
    );
  }

  let result: IMetalsDevSpotResponse;

  try {
    result = (await response.json()) as IMetalsDevSpotResponse;
  } catch {
    throw new Error(
      `Provider returned invalid JSON for ${metal.symbol}`,
    );
  }

  if (
    result.status !== "success" ||
    !result.rate ||
    typeof result.rate.price !== "number" ||
    !Number.isFinite(result.rate.price)
  ) {
    throw new Error(
      result.error_message ??
        `Invalid price returned for ${metal.symbol}`,
    );
  }

  return {
    symbol: metal.symbol,
    name: metal.name,
    price: result.rate.price,
    currency: result.currency ?? "USD",
    unit: metal.unit,
    category: metal.category,
    source: MARKET_SOURCE,

    sourceTimestamp: getSourceTimestamp(result.timestamp),

    fetchedAt: new Date().toISOString(),

    change: validNumber(result.rate.change),

    changePercent: validNumber(result.rate.change_percent),

    high: validNumber(result.rate.high),
    low: validNumber(result.rate.low),

    bid: validNumber(result.rate.bid),
    ask: validNumber(result.rate.ask),
  };
}

export const MarketService = {
  async getMarketQuotes(): Promise<IMarketQuote[]> {
    const now = Date.now();

    // 1. Return fresh cached quotes when available.
    if (
      cachedQuotes.length > 0 &&
      now - cachedAt < MARKET_CACHE_TTL_MS
    ) {
      return cachedQuotes;
    }

    // 2. Reuse an ongoing refresh request.
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async (): Promise<IMarketQuote[]> => {
      const results = await Promise.allSettled(
        MARKET_METALS.map((metal) => fetchSpotQuote(metal)),
      );

      const successfulQuotes: IMarketQuote[] = [];
      const failedQuotes: string[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulQuotes.push(result.value);
        } else {
          const metal = MARKET_METALS[index];

          const reason =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason);

          failedQuotes.push(`${metal.symbol}: ${reason}`);
        }
      });

      // 3. Log each failure without exposing the API key.
      if (failedQuotes.length > 0) {
        console.error(
          "[MarketService] Provider failures:",
          failedQuotes,
        );
      }

      // 4. If every request failed, use previously cached quotes.
      if (successfulQuotes.length === 0) {
        if (cachedQuotes.length > 0) {
          console.warn(
            "[MarketService] Provider unavailable. Returning cached quotes.",
          );

          return cachedQuotes;
        }

        throw new Error(
          "Unable to retrieve market prices from the provider",
        );
      }

      // 5. Preserve existing quotes for metals that failed to refresh.
      const merged = new Map(
        cachedQuotes.map((quote) => [quote.symbol, quote]),
      );

      for (const quote of successfulQuotes) {
        merged.set(quote.symbol, quote);
        addHistorySnapshot(quote);
      }

      // 6. Keep the configured metal order.
      cachedQuotes = MARKET_METALS.flatMap((metal) => {
        const quote = merged.get(metal.symbol);

        return quote ? [quote] : [];
      });

      cachedAt = Date.now();

      return cachedQuotes;
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  },

  async getQuoteBySymbol(
    symbol: string,
  ): Promise<IMarketQuote | null> {
    const quotes = await this.getMarketQuotes();

    return (
      quotes.find(
        (quote) => quote.symbol === symbol.toUpperCase(),
      ) ?? null
    );
  },

  async getHistory(
    symbol: string,
    limit: number,
  ): Promise<IMarketHistoryPoint[] | null> {
    const normalizedSymbol = symbol.toUpperCase();

    // Try refreshing quotes, but don't block existing history on failure.
    try {
      await this.getQuoteBySymbol(normalizedSymbol);
    } catch (error) {
      console.warn(
        `[MarketService] Unable to refresh ${normalizedSymbol} history:`,
        error instanceof Error ? error.message : String(error),
      );
    }

    // Return stored history even if the provider is unavailable.
    const points = history.get(normalizedSymbol) ?? [];

    if (points.length === 0) {
      return null;
    }

    const safeLimit = Math.max(
      1,
      Math.min(
        Math.floor(Number.isFinite(limit) ? limit : 100),
        MARKET_HISTORY_MAX_POINTS,
      ),
    );

    return points.slice(-safeLimit);
  },

  async estimateRecoveryValue(
    input: IRecoveryValueInput,
  ): Promise<IRecoveryValueResult | null> {
    const quote = await this.getQuoteBySymbol(input.symbol);

    if (!quote) {
      return null;
    }

    const pricePerKg =
      quote.unit === "troy ounce"
        ? quote.price * 32.1507466
        : quote.price / 1000;

    const recoveredWeightKg =
      input.weightKg * (input.recoveryRatePercent / 100);

    const grossValue = recoveredWeightKg * pricePerKg;

    return {
      symbol: quote.symbol,
      metal: quote.name,

      inputWeightKg: input.weightKg,

      recoveryRatePercent: input.recoveryRatePercent,

      estimatedRecoveredWeightKg: Number(
        recoveredWeightKg.toFixed(4),
      ),

      estimatedPricePerKg: roundMoney(pricePerKg),

      estimatedGrossValue: roundMoney(grossValue),

      currency: quote.currency,
      source: quote.source,
      sourceTimestamp: quote.sourceTimestamp,

      disclaimer:
        "Theoretical gross metal value only. Actual e-waste composition, purity, refining costs, collection costs and buyer rates may differ.",
    };
  },
};
