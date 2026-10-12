import { Router } from "express";

import { PaymentController } from "./payment.controller";

import {
  createCheckoutSessionSchema,
  paymentOrderIdSchema,
} from "./payment.validation";

import { validateRequest } from "../../middleware/validationRequest";
import { checkAuth } from "../../middleware/checkAuth";


const router = Router();




router.post(
  "/create-checkout-session",

  checkAuth("CUSTOMER"),

  validateRequest(
    createCheckoutSessionSchema
  ),

  PaymentController.createCheckoutSession
);




router.post(
  "/webhook",

  PaymentController.stripeWebhook
);




router.get(
  "/order/:orderId",

  checkAuth("CUSTOMER", "ADMIN", "SUPER_ADMIN"),

  validateRequest(
    paymentOrderIdSchema
  ),

  PaymentController.getPaymentsByOrder
);

router.get(
  "/",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  PaymentController.getAllPayments,
);


export const PaymentRoutes = router;