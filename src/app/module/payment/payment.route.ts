import { Router } from "express";

import { PaymentController } from "./payment.controller";

import {
  createCheckoutSessionSchema,
  paymentOrderIdSchema,
} from "./payment.validation";

import { validateRequest } from "../../middleware/validationRequest";
import { checkAuth } from "../../middleware/checkAuth";


const router = Router();


// =====================================================
// CREATE CHECKOUT SESSION
// =====================================================

router.post(
  "/create-checkout-session",

  checkAuth("CUSTOMER"),

  validateRequest(
    createCheckoutSessionSchema
  ),

  PaymentController.createCheckoutSession
);


// =====================================================
// STRIPE WEBHOOK
// =====================================================

router.post(
  "/webhook",

  PaymentController.stripeWebhook
);


// =====================================================
// GET ORDER PAYMENTS
// =====================================================

router.get(
  "/order/:orderId",

  checkAuth("CUSTOMER"),

  validateRequest(
    paymentOrderIdSchema
  ),

  PaymentController.getPaymentsByOrder
);


export const PaymentRoutes = router;