/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";

import { Request, Response } from "express";

import { OfferService } from "./offer.service";


const createOffer = async (
  req: Request,
  res: Response
) => {

  const result =
    await OfferService.createOffer(
      req.user.userId,
      req.body
    );


  res.status(status.CREATED).json({
    success: true,

    message: "Offer created successfully",

    data: result,
  });
};


const getOfferById = async (
  req: Request,
  res: Response
) => {

  const result =
    await OfferService.getOfferById(
      req.params.id as string
    );


  res.status(status.OK).json({
    success: true,

    message: "Offer retrieved successfully",

    data: result,
  });
};


const getOffers = async (
  req: Request,
  res: Response
) => {

  const result =
    await OfferService.getOffers(
      req.query as any
    );


  res.status(status.OK).json({
    success: true,

    message: "Offers retrieved successfully",

    meta: result.meta,

    data: result.data,
  });
};


const getMyOffers = async (
  req: Request,
  res: Response
) => {

  const result =
    await OfferService.getMyOffers(
      req.user.userId,

      req.query as any
    );


  res.status(status.OK).json({
    success: true,

    message: "Your offers retrieved successfully",

    meta: result.meta,

    data: result.data,
  });
};


const updateOffer = async (
  req: Request,
  res: Response
) => {

  const result =
    await OfferService.updateOffer(
      req.user.userId,

      req.params.id as string,

      req.body
    );


  res.status(status.OK).json({
    success: true,

    message: "Offer updated successfully",

    data: result,
  });
};


const updateOfferStatus = async (
  req: Request,
  res: Response
) => {

  const result =
    await OfferService.updateOfferStatus(
      req.params.id as string,

      req.body.status
    );


  res.status(status.OK).json({
    success: true,

    message: "Offer status updated successfully",

    data: result,
  });
};


const cancelOffer = async (
  req: Request,
  res: Response
) => {

  const result =
    await OfferService.cancelOffer(
      req.user.userId,

      req.params.id as string
    );


  res.status(status.OK).json({
    success: true,

    message: "Offer cancelled successfully",

    data: result,
  });
};


export const OfferController = {
  createOffer,
  getOfferById,
  getOffers,
  getMyOffers,
  updateOffer,
  updateOfferStatus,
  cancelOffer,
};