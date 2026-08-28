import {
  Router,
} from "express";

import {
  MarketComparisonController,
} from "./market-comparison.controller";

import {
  createMarketComparisonZodSchema,
} from "./market-comparison.validation";

import {
  validateRequest,
} from "../../middleware/validationRequest";

import {
  checkAuth,
} from "../../middleware/checkAuth";

import {
  Role,
} from "../../../generated/prisma/enums";


const router = Router();




router.get(
  "/",

  MarketComparisonController
    .getAllMarketComparisons
);




router.get(
  "/product/:productId",

  MarketComparisonController
    .getMarketComparisonsByProduct
);




router.get(
  "/:id",

  MarketComparisonController
    .getSingleMarketComparison
);




router.post(
  "/",

  checkAuth(
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),

  validateRequest(
    createMarketComparisonZodSchema
  ),

  MarketComparisonController
    .createMarketComparison
);




router.delete(
  "/:id",

  checkAuth(
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),

  MarketComparisonController
    .deleteMarketComparison
);


export const MarketComparisonRoutes =
  router;