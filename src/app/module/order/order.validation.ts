import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    offerId: z
      .string()
      .uuid("Invalid offer ID"),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid order ID"),
  }),

  body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED",
    ]),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid order ID"),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid order ID"),
  }),
});