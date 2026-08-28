import z from "zod";

export const priceEstimationParamsSchema = z.object({
  productId: z.string().uuid(),
});