/* eslint-disable @typescript-eslint/no-explicit-any */
import {  Router } from "express";
import { CategoryController } from "./category.controller";


import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../../config/multer.config";
import { validateRequest } from "../../middleware/validationRequest";
import { CategoryValidation } from "./category.validation";



const router = Router()

router.post('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR, Role.CUSTOMER),
    multerUpload.single("file"),
    validateRequest(CategoryValidation.createCategoryZodSchema),
    CategoryController.createCategory)
router.get('/',CategoryController.getAllCategories)
router.delete('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR), CategoryController.deleteCategory)


export const CategoryRoutes = router