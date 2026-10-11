import { Router } from "express";

import { ProductController } from "./product.controller";

import {
  createProductZodSchema,
  updateProductZodSchema,
} from "./product.validation";

import { validateRequest } from "../../middleware/validationRequest";

import { checkAuth } from "../../middleware/checkAuth";

import { Role } from "../../../generated/prisma/enums";


const router = Router();




router.get(
  "/",
  checkAuth(
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),
  ProductController.getAllProducts
);



router.get(
  "/vendor/:vendorId",
  checkAuth(
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),
  ProductController.getProductsByVendor
);



router.get(
  "/category/:categoryId",
  checkAuth(
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),
  ProductController.getProductsByCategory
);



router.get(
  "/status/:status",
  checkAuth(
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),
  ProductController.getProductsByStatus
);



router.get(
  "/:id",
  checkAuth(
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),
  ProductController.getSingleProduct
);



router.post(
  "/",

  checkAuth(
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),

  validateRequest(
    createProductZodSchema
  ),

  ProductController.createProduct
);



router.patch(
  "/:id",

  checkAuth(
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),

  validateRequest(
    updateProductZodSchema
  ),

  ProductController.updateProduct
);



router.delete(
  "/:id",

  checkAuth(
    Role.VENDOR,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ),

  ProductController.deleteProduct
);


export const ProductRoutes = router;