import { OrderStatus } from "../../../generated/prisma/client";

export interface ICreateOrder {
  offerId: string;
}

export interface IUpdateOrderStatus {
  status: OrderStatus;
}

export interface IOrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customerId?: string;
  vendorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}