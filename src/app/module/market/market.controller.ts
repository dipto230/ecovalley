import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { MarketService } from "./market.service";

import {
  MARKET_CACHE_TTL_MS,
} from "./market.constant";

import {
  normalizeSymbol,
  parseHistoryLimit,
  parseRecoveryValueInput,
} from "./market.validation";

export const MarketController = {
  async getMarketQuotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const quotes =
        await MarketService.getMarketQuotes();

      const lastUpdated = quotes.reduce<
        string | null
      >((latest, quote) => {
        if (
          !latest ||
          quote.sourceTimestamp > latest
        ) {
          return quote.sourceTimestamp;
        }

        return latest;
      }, null);

      res.status(200).json({
        success: true,
        message: "Market quotes fetched successfully",
        data: quotes,
        meta: {
          source: "Metals.Dev",
          currency: "USD",
          lastUpdated,
          cacheTtlMs: MARKET_CACHE_TTL_MS,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMarketQuoteBySymbol(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const symbol = normalizeSymbol(
        req.params.symbol,
      );

      if (!symbol) {
        res.status(400).json({
          success: false,
          message: "Invalid metal symbol",
        });
        return;
      }

      const quote =
        await MarketService.getQuoteBySymbol(
          symbol,
        );

      if (!quote) {
        res.status(404).json({
          success: false,
          message: "Market quote not found",
          data: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Market quote fetched successfully",
        data: quote,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMarketHistory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const symbol = normalizeSymbol(
        req.params.symbol,
      );

      const limit = parseHistoryLimit(
        req.query.limit,
      );

      if (!symbol) {
        res.status(400).json({
          success: false,
          message: "Invalid metal symbol",
        });
        return;
      }

      if (limit === null) {
        res.status(400).json({
          success: false,
          message:
            "limit must be an integer between 1 and 1000",
        });
        return;
      }

      const data =
        await MarketService.getHistory(
          symbol,
          limit,
        );

      if (data === null) {
        res.status(404).json({
          success: false,
          message: "Market quote not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Market history fetched successfully",
        data,
        meta: {
          symbol,
          count: data.length,
          storage: "in-memory",
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getRecoveryValue(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsed = parseRecoveryValueInput(
        req.query as Record<string, unknown>,
      );

      if (!parsed.valid) {
        res.status(400).json({
          success: false,
          message: parsed.message,
        });
        return;
      }

      const data =
        await MarketService.estimateRecoveryValue(
          parsed.data,
        );

      if (!data) {
        res.status(404).json({
          success: false,
          message: "Market quote not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message:
          "Recovery value estimated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async streamMarketQuotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const initialQuotes =
        await MarketService.getMarketQuotes();

      res.status(200);

      res.setHeader(
        "Content-Type",
        "text/event-stream; charset=utf-8",
      );

      res.setHeader(
        "Cache-Control",
        "no-cache, no-transform",
      );

      res.setHeader("Connection", "keep-alive");

      res.setHeader("X-Accel-Buffering", "no");

      res.flushHeaders();

      let closed = false;
      let polling = false;

      const sendEvent = (
        event: string,
        data: unknown,
      ): void => {
        if (closed || res.writableEnded) {
          return;
        }

        res.write(`event: ${event}\n`);
        res.write(
          `data: ${JSON.stringify(data)}\n\n`,
        );
      };

      sendEvent("market-update", {
        data: initialQuotes,
        timestamp: new Date().toISOString(),
      });

      const heartbeat = setInterval(() => {
        if (!closed && !res.writableEnded) {
          res.write(": heartbeat\n\n");
        }
      }, 20_000);

      const poller = setInterval(async () => {
        if (closed || polling) {
          return;
        }

        polling = true;

        try {
          const quotes =
            await MarketService.getMarketQuotes();

          sendEvent("market-update", {
            data: quotes,
            timestamp: new Date().toISOString(),
          });
        } catch {
          sendEvent("market-error", {
            message:
              "Market refresh failed; retrying later",
            timestamp: new Date().toISOString(),
          });
        } finally {
          polling = false;
        }
      }, MARKET_CACHE_TTL_MS);

      const cleanup = (): void => {
        if (closed) {
          return;
        }

        closed = true;

        clearInterval(heartbeat);
        clearInterval(poller);
      };

      req.on("close", cleanup);
      res.on("close", cleanup);
    } catch (error) {
      if (!res.headersSent) {
        next(error);
      } else {
        res.end();
      }
    }
  },
};