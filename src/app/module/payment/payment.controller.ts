import status from "http-status";
import { Request, Response } from "express";

import { PaymentService } from "./payment.service";


const createCheckoutSession = async (
  req: Request,
  res: Response
) => {
  const result =
    await PaymentService.createCheckoutSession(
      req.user.userId,
      req.body
    );

  res.status(status.OK).json({
    success: true,

    message:
      "Stripe checkout session created successfully",

    data: result,
  });
};


const stripeWebhook = async (
  req: Request,
  res: Response
) => {
  const signature =
    req.headers["stripe-signature"];

  if (!signature) {
    res.status(status.BAD_REQUEST).json({
      success: false,

      message:
        "Stripe signature is missing",
    });

    return;
  }

  const result =
    await PaymentService.handleStripeWebhook(
      req.body as Buffer,
      signature as string
    );

  res.status(status.OK).json(result);
};


const getPaymentsByOrder = async (
  req: Request,
  res: Response
) => {
  const result =
    await PaymentService.getPaymentsByOrder(
      req.user.userId,
      req.params.orderId as string
    );

  res.status(status.OK).json({
    success: true,

    message:
      "Order payments retrieved successfully",

    data: result,
  });
};


export const PaymentController = {
  createCheckoutSession,
  stripeWebhook,
  getPaymentsByOrder,
};