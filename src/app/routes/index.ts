import { Router } from "express";
import { CategoryRoutes } from "../module/category/category.routes";
import { AuthRoutes } from "../module/auth/auth.routes";
import { UserRoute } from "../module/user/user.route";
import { VendorRoutes } from "../module/vendor/vendor.route";
import { ProductRoutes } from "../module/product/product.route";
import { PriceEstimationRoutes } from "../module/price-estimation/price-estimation.route";


const router = Router()

router.use('/auth', AuthRoutes)
router.use('/categories', CategoryRoutes)
router.use("/users", UserRoute)
router.use("/vendors", VendorRoutes)
router.use("/products", ProductRoutes);
router.use("/price-estimation", PriceEstimationRoutes);

export const IndexRoutes = router