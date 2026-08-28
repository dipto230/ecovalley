import { z } from "zod";

// Create Order
export const createOrderSchema = z.object({
  offerId: z
    .string()
    .uuid("Invalid offer ID"),
});


// Update Order Status
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ]),
});


// Cancel Order
export const cancelOrderSchema = z.object({});


// Order ID
export const orderIdSchema = z.object({});