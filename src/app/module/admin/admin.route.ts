import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";

import { AdminController } from "./admin.controller";
import { createAdminZodSchema, updateAdminZodSchema } from "./admin.validation";
import { validateRequest } from "../../middleware/validationRequest";


const router = Router();

router.post(
    "/",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(createAdminZodSchema),
    AdminController.createAdmin
);

router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAllAdmins);
router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAdminById);
router.patch("/:id",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(updateAdminZodSchema), AdminController.updateAdmin);
router.delete("/:id",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.deleteAdmin);

export const AdminRoutes = router;