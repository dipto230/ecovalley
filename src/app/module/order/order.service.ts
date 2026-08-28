import status from "http-status";

import {
  OfferStatus,
  OrderStatus,
  ProductStatus,
} from "../../../generated/prisma/client";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

import {
  ICreateOrder,
  IOrderQuery,
} from "./order.interface";

import {
  ORDER_SORT_FIELDS,
  ORDER_STATUS_TRANSITIONS,
} from "./order.constant";



 
const createOrder = async (
  userId: string,
  payload: ICreateOrder
) => {
  const { offerId } = payload;

  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
  });

  if (!customer) {
    throw new AppError(
      status.NOT_FOUND,
      "Customer profile not found"
    );
  }

  if (customer.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Deleted customer cannot create an order"
    );
  }

  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },

    include: {
      product: true,
      vendor: true,
      order: true,
    },
  });

  if (!offer) {
    throw new AppError(
      status.NOT_FOUND,
      "Offer not found"
    );
  }

  
  if (offer.order) {
    throw new AppError(
      status.CONFLICT,
      "This offer has already been converted into an order"
    );
  }

  
  if (offer.status !== OfferStatus.ACCEPTED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only accepted offers can create an order"
    );
  }

  if (
    offer.expiresAt &&
    offer.expiresAt < new Date()
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "This offer has expired"
    );
  }

 
  if (offer.vendor.isDeleted) {
    throw new AppError(
      status.BAD_REQUEST,
      "Vendor is no longer available"
    );
  }

  if (offer.vendor.status !== "ACTIVE") {
    throw new AppError(
      status.BAD_REQUEST,
      "Vendor is not active"
    );
  }

  
  if (offer.product.status === ProductStatus.SOLD) {
    throw new AppError(
      status.BAD_REQUEST,
      "This product has already been sold"
    );
  }

  if (offer.product.quantity <= 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "Product is out of stock"
    );
  }

 
  const order = await prisma.$transaction(
    async (tx) => {

      const createdOrder = await tx.order.create({
        data: {
          offerId: offer.id,

          customerId: customer.id,

          vendorId: offer.vendorId,

          finalPrice: offer.offerPrice,

          status: OrderStatus.PENDING,
        },

        include: {
          offer: {
            include: {
              product: true,
              vendor: true,
            },
          },

          customer: true,

          vendor: true,

          payments: true,

          invoice: true,
        },
      });

      return createdOrder;
    }
  );

  return order;
};



const getOrderById = async (
  orderId: string
) => {

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      offer: {
        include: {
          product: {
            include: {
              productImages: true,
            },
          },

          vendor: true,
        },
      },

      customer: true,

      vendor: true,

      payments: {
        orderBy: {
          paidAt: "desc",
        },
      },

      invoice: true,

      reviews: true,
    },
  });

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      "Order not found"
    );
  }

  return order;
};



const getCustomerOrders = async (
  userId: string,
  query: IOrderQuery
) => {

  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
  });

  if (!customer) {
    throw new AppError(
      status.NOT_FOUND,
      "Customer profile not found"
    );
  }

  return getOrders({
    ...query,
    customerId: customer.id,
  });
};



const getVendorOrders = async (
  userId: string,
  query: IOrderQuery
) => {

  const vendor = await prisma.vendors.findUnique({
    where: {
      userId,
    },
  });

  if (!vendor) {
    throw new AppError(
      status.NOT_FOUND,
      "Vendor profile not found"
    );
  }

  return getOrders({
    ...query,
    vendorId: vendor.id,
  });
};



const getOrders = async (
  query: IOrderQuery
) => {

  const page = Math.max(
    Number(query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100
  );

  const skip = (page - 1) * limit;

  const sortBy =
    query.sortBy &&
    ORDER_SORT_FIELDS.includes(
      query.sortBy as never
    )
      ? query.sortBy
      : "createdAt";

  const sortOrder =
    query.sortOrder === "asc"
      ? "asc"
      : "desc";

  const where = {
    ...(query.status && {
      status: query.status,
    }),

    ...(query.customerId && {
      customerId: query.customerId,
    }),

    ...(query.vendorId && {
      vendorId: query.vendorId,
    }),
  };

  const [orders, total] =
    await prisma.$transaction([
      prisma.order.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },

        include: {
          offer: {
            include: {
              product: true,
            },
          },

          customer: true,

          vendor: true,

          payments: true,

          invoice: true,
        },
      }),

      prisma.order.count({
        where,
      }),
    ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },

    data: orders,
  };
};



const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus
) => {

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      "Order not found"
    );
  }

  
  if (order.status === newStatus) {
    throw new AppError(
      status.BAD_REQUEST,
      `Order is already ${newStatus}`
    );
  }

  const allowedStatuses =
    ORDER_STATUS_TRANSITIONS[
      order.status
    ];

  if (
    !allowedStatuses.includes(
      newStatus as never
    )
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      `Cannot change order status from ${order.status} to ${newStatus}`
    );
  }

  const updatedOrder =
    await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: newStatus,
      },

      include: {
        offer: true,

        customer: true,

        vendor: true,

        payments: true,

        invoice: true,

        reviews: true,
      },
    });

  return updatedOrder;
};



const cancelOrder = async (
  orderId: string
) => {

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      "Order not found"
    );
  }

  if (
    order.status === OrderStatus.CANCELLED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Order is already cancelled"
    );
  }

  if (
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.DELIVERED ||
    order.status === OrderStatus.SHIPPED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      `Order cannot be cancelled after ${order.status}`
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {

        const updatedOrder =
          await tx.order.update({
            where: {
              id: orderId,
            },

            data: {
              status: OrderStatus.CANCELLED,
            },

            include: {
              offer: true,

              customer: true,

              vendor: true,
            },
          });

        
        await tx.offer.update({
          where: {
            id: order.offerId,
          },

          data: {
            status: OfferStatus.CANCELLED,
          },
        });

        return updatedOrder;
      }
    );

  return result;
};


export const OrderService = {
  createOrder,
  getOrderById,
  getOrders,
  getCustomerOrders,
  getVendorOrders,
  updateOrderStatus,
  cancelOrder,
};