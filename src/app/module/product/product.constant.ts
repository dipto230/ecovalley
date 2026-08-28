import { Prisma } from "../../../generated/prisma/client";

export const productSearchableFields = [
  "title",
  "description",
  "brand",
  "model",
];

export const productFilterableFields = [
  "condition",
  "status",
  "vendorId",
  "categoryId",
  "quantity",
];

export const productIncludeConfig: Partial<
  Record<
    keyof Prisma.ProductInclude,
    Prisma.ProductInclude[keyof Prisma.ProductInclude]
  >
> = {
  vendor: true,
  category: true,
  productImages: true,
  priceEstimations: true,
  aiDetections: true,
  marketComparisons: true,
  offers: true,
};