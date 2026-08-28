import { Router } from "express";



import { OfferController } from "./offer.controller";

import {
  createOfferSchema,
  updateOfferSchema,
  updateOfferStatusSchema,
  offerIdSchema,
} from "./offer.validation";
import { validateRequest } from "../../middleware/validationRequest";
import { checkAuth } from "../../middleware/checkAuth";


const router = Router();



router.post(
  "/",

  checkAuth("VENDOR"),

  validateRequest(createOfferSchema),

  OfferController.createOffer
);



router.get(
  "/my-offers",

  checkAuth("VENDOR"),

  OfferController.getMyOffers
);



router.get(
  "/",

  checkAuth("ADMIN", "SUPER_ADMIN"),

  OfferController.getOffers
);



router.get(
  "/:id",

  checkAuth(
    "VENDOR",
    "ADMIN",
    "SUPER_ADMIN"
  ),

  // validateRequest(offerIdSchema),

  OfferController.getOfferById
);



router.patch(
  "/:id",

  checkAuth("VENDOR"),

  validateRequest(updateOfferSchema),

  OfferController.updateOffer
);



router.patch(
  "/:id/status",

  checkAuth(
    "ADMIN",
    "SUPER_ADMIN"
  ),

  validateRequest(updateOfferStatusSchema),

  OfferController.updateOfferStatus
);



router.patch(
  "/:id/cancel",

  checkAuth("VENDOR"),

  validateRequest(offerIdSchema),

  OfferController.cancelOffer
);


export const OfferRoutes = router;  