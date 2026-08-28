import z from "zod";

export const createProductZodSchema = z.object({
  title: z
    .string()
    .min(2, "Product title must be at least 2 characters")
    .max(255, "Product title cannot exceed 255 characters"),

  description: z
    .string()
    .optional(),

  brand: z
    .string()
    .optional(),

  model: z
    .string()
    .optional(),

  condition: z.enum([
    "NEW",
    "USED",
    "REFURBISHED",
  ]),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .optional(),

  estimatedPrice: z
    .number()
    .positive("Estimated price must be greater than 0"),

  vendorId: z
    .string()
    .uuid("Invalid vendor ID")
    .optional(),

  categoryId: z
    .string()
    .uuid("Invalid category ID"),
});


export const updateProductZodSchema = z
  .object({
    title: z
      .string()
      .min(2)
      .max(255)
      .optional(),

    description: z
      .string()
      .optional(),

    brand: z
      .string()
      .optional(),

    model: z
      .string()
      .optional(),

    condition: z
      .enum([
        "NEW",
        "USED",
        "REFURBISHED",
      ])
      .optional(),

    quantity: z
      .number()
      .int()
      .min(1)
      .optional(),

    estimatedPrice: z
      .number()
      .positive()
      .optional(),

    status: z
      .enum([
        "PENDING",
        "APPROVED",
        "REJECTED",
        "SOLD",
        "AVAILABLE",
      ])
      .optional(),

    vendorId: z
      .string()
      .uuid()
      .optional(),

    categoryId: z
      .string()
      .uuid()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );