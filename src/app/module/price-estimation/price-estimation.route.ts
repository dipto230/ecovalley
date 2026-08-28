import {
  Router,
} from "express";

import {
  PriceEstimationController,
} from "./price-estimation.controller";

import {
  checkAuth,
} from "../../middleware/checkAuth";

import {
  Role,
} from "../../../generated/prisma/enums";

// import {
//   validateRequest,
// } from "../../middleware/validationRequest";

// import {
//   priceEstimationParamsSchema,
// } from "./price-estimation.validation";


const router = Router();


router.get(
  "/:productId",

  checkAuth(
    Role.CUSTOMER,
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),

//   validateRequest(
//     priceEstimationParamsSchema
//   ),

  PriceEstimationController
    .estimateProductPrice
);


export const PriceEstimationRoutes =
  router;