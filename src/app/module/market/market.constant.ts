export const MARKET_METALS = [
  {
    symbol: "GOLD",
    name: "Gold",
    providerSymbol: "gold",
    unit: "troy ounce",
    category: "precious-metal",
  },
  {
    symbol: "SILVER",
    name: "Silver",
    providerSymbol: "silver",
    unit: "troy ounce",
    category: "precious-metal",
  },
  {
    symbol: "COPPER",
    name: "Copper",
    providerSymbol: "copper",
    unit: "metric tonne",
    category: "industrial-metal",
  },
  {
    symbol: "ALUMINUM",
    name: "Aluminium",
    providerSymbol: "aluminum",
    unit: "metric tonne",
    category: "industrial-metal",
  },
  {
    symbol: "NICKEL",
    name: "Nickel",
    providerSymbol: "nickel",
    unit: "metric tonne",
    category: "industrial-metal",
  },
  {
    symbol: "ZINC",
    name: "Zinc",
    providerSymbol: "zinc",
    unit: "metric tonne",
    category: "industrial-metal",
  },
] as const;

export const MARKET_CACHE_TTL_MS = 60_000;

export const MARKET_HISTORY_RETENTION_MS =
  7 * 24 * 60 * 60 * 1000;

export const MARKET_HISTORY_MAX_POINTS = 1000;

export const MARKET_DEFAULT_HISTORY_LIMIT = 100;

export const MARKET_MAX_HISTORY_LIMIT = 1000;

export const MARKET_SOURCE = "Metals.Dev";