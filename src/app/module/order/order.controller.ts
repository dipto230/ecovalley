/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { Request, Response } from "express";

import { OrderService } from "./order.service";


const createOrder = async (
  req: Request,
  res: Response
) => {

  const result =
    await OrderService.createOrder(
      req.user.userId,
      req.body
    );

  res.status(status.CREATED).json({
    success: true,

    message: "Order created successfully",

    data: result,
  });
};


const getOrderById = async (
  req: Request,
  res: Response
) => {

  const result =
    await OrderService.getOrderById(
      req.params.id as string 
    );

  res.status(status.OK).json({
    success: true,

    message: "Order retrieved successfully",

    data: result,
  });
};


const getOrders = async (
  req: Request,
  res: Response
) => {

  const result =
    await OrderService.getOrders(
      req.query as any
    );

  res.status(status.OK).json({
    success: true,

    message: "Orders retrieved successfully",

    meta: result.meta,

    data: result.data,
  });
};


const getMyOrders = async (
  req: Request,
  res: Response
) => {

  const result =
    await OrderService.getCustomerOrders(
      req.user.userId,
      req.query as any
    );

  res.status(status.OK).json({
    success: true,

    message: "Your orders retrieved successfully",

    meta: result.meta,

    data: result.data,
  });
};


const getVendorOrders = async (
  req: Request,
  res: Response
) => {

  const result =
    await OrderService.getVendorOrders(
      req.user.userId,
      req.query as any
    );

  res.status(status.OK).json({
    success: true,

    message: "Vendor orders retrieved successfully",

    meta: result.meta,

    data: result.data,
  });
};


const updateOrderStatus = async (
  req: Request,
  res: Response
) => {

  const result =
    await OrderService.updateOrderStatus(
      req.params.id as string,
      req.body.status
    );

  res.status(status.OK).json({
    success: true,

    message: "Order status updated successfully",

    data: result,
  });
};


const cancelOrder = async (
  req: Request,
  res: Response
) => {

  const result =
    await OrderService.cancelOrder(
      req.params.id as string
    );

  res.status(status.OK).json({
    success: true,

    message: "Order cancelled successfully",

    data: result,
  });
};


export const OrderController = {
  createOrder,
  getOrderById,
  getOrders,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  cancelOrder,
};