import { z } from "zod";

export const createMarketComparisonZodSchema =
  z.object({
    productId: z
      .string()
      .min(1, "Product ID is required"),

    platformName: z
      .string()
      .trim()
      .min(1, "Platform name is required"),

    productUrl: z
      .string()
      .url("Invalid product URL"),

    marketPrice: z
      .number()
      .positive(
        "Market price must be greater than 0"
      ),
  });