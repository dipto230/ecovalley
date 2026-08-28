import { Router } from "express";



import { OrderController } from "./order.controller";

import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  orderIdSchema,
} from "./order.validation";
import { validateRequest } from "../../middleware/validationRequest";

import { checkAuth } from "../../middleware/checkAuth";


const router = Router();



router.post(
  "/",

  checkAuth("CUSTOMER"),

  validateRequest(createOrderSchema),

  OrderController.createOrder
);



router.get(
  "/my-orders",

  checkAuth("CUSTOMER"),

  OrderController.getMyOrders
);



router.get(
  "/vendor-orders",

  checkAuth("VENDOR"),

  OrderController.getVendorOrders
);



router.get(
  "/",

  checkAuth("ADMIN", "SUPER_ADMIN"),

  OrderController.getOrders
);



router.get(
  "/:id",

  checkAuth(
    "CUSTOMER",
    "VENDOR",
    "ADMIN",
    "SUPER_ADMIN"
  ),

  validateRequest(orderIdSchema),

  OrderController.getOrderById
);



router.patch(
  "/:id/status",

  checkAuth(
    "VENDOR",
    "ADMIN",
    "SUPER_ADMIN"
  ),

  validateRequest(updateOrderStatusSchema),

  OrderController.updateOrderStatus
);



router.patch(
  "/:id/cancel",

  checkAuth(
    "CUSTOMER",
    "VENDOR",
    "ADMIN",
    "SUPER_ADMIN"
  ),

  validateRequest(cancelOrderSchema),

  OrderController.cancelOrder
);


export const OrderRoutes = router;