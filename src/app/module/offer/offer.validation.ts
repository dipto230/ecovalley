import { z } from "zod";


export const createOfferSchema = z.object({
  productId: z
    .string()
    .uuid("Invalid product ID"),

  offerPrice: z
    .number()
    .positive("Offer price must be greater than 0"),

  message: z
    .string()
    .max(1000, "Message cannot exceed 1000 characters")
    .optional(),

  expiresAt: z
    .string()
    .datetime("Invalid expiration date")
    .optional(),
});


export const updateOfferSchema = z.object({
  offerPrice: z
    .number()
    .positive("Offer price must be greater than 0")
    .optional(),

  message: z
    .string()
    .max(1000, "Message cannot exceed 1000 characters")
    .optional(),

  expiresAt: z
    .string()
    .datetime("Invalid expiration date")
    .optional(),
});


export const updateOfferStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "CANCELLED",
  ]),
});


export const offerIdSchema = z.object({
  id: z
    .string()
    .uuid("Invalid offer ID"),
});