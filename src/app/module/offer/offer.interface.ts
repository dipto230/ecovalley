import { OfferStatus } from "../../../generated/prisma/client";

export interface ICreateOffer {
  productId: string;
  offerPrice: number;
  message?: string;
  expiresAt?: string;
}

export interface IUpdateOffer {
  offerPrice?: number;
  message?: string;
  expiresAt?: string;
}

export interface IUpdateOfferStatus {
  status: OfferStatus;
}

export interface IOfferQuery {
  page?: number;
  limit?: number;
  status?: OfferStatus;
  productId?: string;
  vendorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}