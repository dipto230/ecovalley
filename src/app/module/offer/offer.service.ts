import status from "http-status";

import {
  OfferStatus,
  ProductStatus,
} from "../../../generated/prisma/client";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

import {
  ICreateOffer,
  IOfferQuery,
  IUpdateOffer,
} from "./offer.interface";

import {
  OFFER_STATUS_TRANSITIONS,
} from "./offer.constant";


/**
 * Create Offer
 */
const createOffer = async (
  userId: string,
  payload: ICreateOffer
) => {
  const {
    productId,
    offerPrice,
    message,
    expiresAt,
  } = payload;


  /**
   * Find vendor profile
   */
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


  if (vendor.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Deleted vendor cannot create an offer"
    );
  }


  if (vendor.status !== "ACTIVE") {
    throw new AppError(
      status.FORBIDDEN,
      "Only active vendors can create offers"
    );
  }


  /**
   * Find product
   */
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });


  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      "Product not found"
    );
  }


  /**
   * Prevent vendor from offering on own product
   */
  if (product.vendorId === vendor.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "Vendor cannot create an offer for their own product"
    );
  }


  /**
   * Product availability
   */
  if (product.status === ProductStatus.SOLD) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot create an offer for a sold product"
    );
  }


  if (product.quantity <= 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "Product is out of stock"
    );
  }


  /**
   * Validate expiration
   */
  let expirationDate: Date | undefined;

  if (expiresAt) {
    expirationDate = new Date(expiresAt);

    if (expirationDate <= new Date()) {
      throw new AppError(
        status.BAD_REQUEST,
        "Expiration date must be in the future"
      );
    }
  }


  /**
   * Create Offer
   */
  const offer = await prisma.offer.create({
    data: {
      productId,

      vendorId: vendor.id,

      offerPrice,

      message,

      expiresAt: expirationDate,

      status: OfferStatus.PENDING,
    },

    include: {
      product: true,

      vendor: true,

      order: true,
    },
  });


  return offer;
};


/**
 * Get Single Offer
 */
const getOfferById = async (
  offerId: string
) => {

  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },

    include: {
      product: {
        include: {
          productImages: true,
        },
      },

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


  return offer;
};


/**
 * Get Offers
 */
const getOffers = async (
  query: IOfferQuery
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


  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "offerPrice",
    "expiresAt",
    "status",
  ];


  const sortBy =
    query.sortBy &&
    allowedSortFields.includes(query.sortBy)
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

    ...(query.productId && {
      productId: query.productId,
    }),

    ...(query.vendorId && {
      vendorId: query.vendorId,
    }),
  };


  const [offers, total] =
    await prisma.$transaction([
      prisma.offer.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },

        include: {
          product: true,

          vendor: true,

          order: true,
        },
      }),

      prisma.offer.count({
        where,
      }),
    ]);


  return {
    meta: {
      page,

      limit,

      total,

      totalPage: Math.ceil(
        total / limit
      ),
    },

    data: offers,
  };
};


/**
 * Get Vendor's Offers
 */
const getMyOffers = async (
  userId: string,
  query: IOfferQuery
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


  return getOffers({
    ...query,

    vendorId: vendor.id,
  });
};


/**
 * Update Offer
 */
const updateOffer = async (
  userId: string,
  offerId: string,
  payload: IUpdateOffer
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


  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },

    include: {
      order: true,
    },
  });


  if (!offer) {
    throw new AppError(
      status.NOT_FOUND,
      "Offer not found"
    );
  }


  if (offer.vendorId !== vendor.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to update this offer"
    );
  }


  /**
   * Cannot update after accepted
   */
  if (
    offer.status !== OfferStatus.PENDING
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      `Offer cannot be updated because it is ${offer.status}`
    );
  }


  if (offer.order) {
    throw new AppError(
      status.BAD_REQUEST,
      "Offer already has an order"
    );
  }


  let expirationDate: Date | undefined;

  if (payload.expiresAt) {

    expirationDate =
      new Date(payload.expiresAt);

    if (
      expirationDate <= new Date()
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        "Expiration date must be in the future"
      );
    }
  }


  const updatedOffer =
    await prisma.offer.update({
      where: {
        id: offerId,
      },

      data: {
        ...(payload.offerPrice !== undefined && {
          offerPrice:
            payload.offerPrice,
        }),

        ...(payload.message !== undefined && {
          message: payload.message,
        }),

        ...(payload.expiresAt !== undefined && {
          expiresAt: expirationDate,
        }),
      },

      include: {
        product: true,

        vendor: true,

        order: true,
      },
    });


  return updatedOffer;
};


/**
 * Update Offer Status
 */
const updateOfferStatus = async (
  offerId: string,
  newStatus: OfferStatus
) => {

  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },

    include: {
      order: true,
    },
  });


  if (!offer) {
    throw new AppError(
      status.NOT_FOUND,
      "Offer not found"
    );
  }


  if (offer.status === newStatus) {
    throw new AppError(
      status.BAD_REQUEST,
      `Offer is already ${newStatus}`
    );
  }


  /**
   * Expiration check before accepting
   */
  if (
    newStatus === OfferStatus.ACCEPTED &&
    offer.expiresAt &&
    offer.expiresAt < new Date()
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot accept an expired offer"
    );
  }


  /**
   * Prevent accepting offer
   * if order already exists
   */
  if (
    newStatus === OfferStatus.ACCEPTED &&
    offer.order
  ) {
    throw new AppError(
      status.CONFLICT,
      "This offer has already been converted into an order"
    );
  }


  const allowedStatuses =
    OFFER_STATUS_TRANSITIONS[
      offer.status
    ];


  if (
    !allowedStatuses.includes(newStatus)
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      `Cannot change offer status from ${offer.status} to ${newStatus}`
    );
  }


  const updatedOffer =
    await prisma.offer.update({
      where: {
        id: offerId,
      },

      data: {
        status: newStatus,
      },

      include: {
        product: true,

        vendor: true,

        order: true,
      },
    });


  return updatedOffer;
};


/**
 * Cancel Offer
 */
const cancelOffer = async (
  userId: string,
  offerId: string
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


  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },

    include: {
      order: true,
    },
  });


  if (!offer) {
    throw new AppError(
      status.NOT_FOUND,
      "Offer not found"
    );
  }


  if (offer.vendorId !== vendor.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to cancel this offer"
    );
  }


  if (
    offer.status === OfferStatus.CANCELLED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Offer is already cancelled"
    );
  }


  if (offer.order) {
    throw new AppError(
      status.BAD_REQUEST,
      "Offer cannot be cancelled because it already has an order"
    );
  }


  const cancelledOffer =
    await prisma.offer.update({
      where: {
        id: offerId,
      },

      data: {
        status: OfferStatus.CANCELLED,
      },

      include: {
        product: true,

        vendor: true,

        order: true,
      },
    });


  return cancelledOffer;
};


export const OfferService = {
  createOffer,
  getOfferById,
  getOffers,
  getMyOffers,
  updateOffer,
  updateOfferStatus,
  cancelOffer,
};