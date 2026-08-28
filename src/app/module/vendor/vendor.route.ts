import { Router } from "express";
import { VendorController } from "./vendor.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validationRequest";
import { updateVendorZodSchema } from "./vendor.validation";

const router = Router()
router.get("/", VendorController.getAllVendors)
router.get("/:id", VendorController.getVendorById)
router.patch("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateVendorZodSchema), VendorController.updateVendor)
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), VendorController.deleteVendor)

export const VendorRoutes = router