import { Router } from "express";

import { MarketController } from "./market.controller";

const router = Router();

router.get(
  "/quotes",
  MarketController.getMarketQuotes,
);

router.get(
  "/stream",
  MarketController.streamMarketQuotes,
);

router.get(
  "/history/:symbol",
  MarketController.getMarketHistory,
);

router.get(
  "/recovery-values",
  MarketController.getRecoveryValue,
);

router.get(
  "/quotes/:symbol",
  MarketController.getMarketQuoteBySymbol,
);

export const MarketRoutes = router;