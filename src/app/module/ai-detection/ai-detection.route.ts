import { Router } from "express";

import { AIDetectionController } from "./ai-detection.controller";
import { multerUpload } from "../../../config/multer.config";

const router = Router();

router.post(
  "/analyze",
  multerUpload.single("image"),
  AIDetectionController.analyzeProductImage
);

export const AIDetectionRoutes = router;