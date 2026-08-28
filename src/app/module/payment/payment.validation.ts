import z from "zod";

export const createCheckoutSessionSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

export const paymentOrderIdSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});