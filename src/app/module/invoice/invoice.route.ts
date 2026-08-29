import { Router } from "express";

import { InvoiceController } from "./invoice.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();


router.get(
  "/order/:orderId",
  checkAuth("CUSTOMER"),
  InvoiceController.getInvoiceByOrder
);


export const InvoiceRoutes = router;