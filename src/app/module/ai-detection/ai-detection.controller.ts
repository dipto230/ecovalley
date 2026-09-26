import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

import { AIDetectionService } from "./ai-detection.service";

const analyzeProductImage = catchAsync(
  async (req: Request, res: Response) => {
    const { productId } = req.body;

    if (!productId) {
      return sendResponse(res, {
        httpStatusCode: status.BAD_REQUEST,
        success: false,
        message: "Product ID is required",
        data: null,
      });
    }

    if (!req.file) {
      return sendResponse(res, {
        httpStatusCode: status.BAD_REQUEST,
        success: false,
        message: "Product image is required",
        data: null,
      });
    }

    
    const imageUrl = req.file.path;

    if (!imageUrl) {
      return sendResponse(res, {
        httpStatusCode: status.BAD_REQUEST,
        success: false,
        message: "Cloudinary image URL not found",
        data: null,
      });
    }

    const result =
      await AIDetectionService.analyzeProductImage({
        productId,
        imageUrl,
      });

    return sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Product image analyzed successfully",
      data: result,
    });
  }
);

export const AIDetectionController = {
  analyzeProductImage,
};