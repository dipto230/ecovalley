import {
  Request,
  Response,
} from "express";

import status from "http-status";

import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

import {
  PriceEstimationService,
} from "./price-estimation.service";


const estimateProductPrice =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {

      const {
        productId,
      } = req.params;


      const result =
        await PriceEstimationService
          .estimateProductPrice(
            productId as string
          );


      sendResponse(
        res,
        {
          httpStatusCode:
            status.OK,

          success: true,

          message:
            "Product price estimated successfully",

          data: result,
        }
      );
    }
  );


export const PriceEstimationController = {
  estimateProductPrice,
};