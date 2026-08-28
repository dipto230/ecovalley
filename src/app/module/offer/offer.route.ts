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


/**
 * Vendor creates offer
 */
router.post(
  "/",

  checkAuth("VENDOR"),

  validateRequest(createOfferSchema),

  OfferController.createOffer
);


/**
 * Vendor's own offers
 */
router.get(
  "/my-offers",

  checkAuth("VENDOR"),

  OfferController.getMyOffers
);


/**
 * Admin - all offers
 */
router.get(
  "/",

  checkAuth("ADMIN", "SUPER_ADMIN"),

  OfferController.getOffers
);


/**
 * Single offer
 */
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


/**
 * Update offer
 */
router.patch(
  "/:id",

  checkAuth("VENDOR"),

  validateRequest(updateOfferSchema),

  OfferController.updateOffer
);


/**
 * Update offer status
 */
router.patch(
  "/:id/status",

  checkAuth(
    "ADMIN",
    "SUPER_ADMIN"
  ),

  validateRequest(updateOfferStatusSchema),

  OfferController.updateOfferStatus
);


/**
 * Cancel offer
 */
router.patch(
  "/:id/cancel",

  checkAuth("VENDOR"),

  validateRequest(offerIdSchema),

  OfferController.cancelOffer
);


export const OfferRoutes = router;  