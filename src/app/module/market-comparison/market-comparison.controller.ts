import {
  Request,
  Response,
} from "express";

import status from "http-status";

import {
  catchAsync,
} from "../../shared/catchAsync";

import {
  sendResponse,
} from "../../shared/sendResponse";

import {
  IQueryParams,
} from "../../interfaces/query.interface";

import {
  MarketComparisonService,
} from "./market-comparison.service";




const createMarketComparison =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {

      const comparison =
        await MarketComparisonService
          .createMarketComparison(
            req.body
          );


      sendResponse(res, {
        httpStatusCode:
          status.CREATED,

        success: true,

        message:
          "Market comparison created successfully",

        data: comparison,
      });
    }
  );




const getAllMarketComparisons =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {

      const result =
        await MarketComparisonService
          .getAllMarketComparisons(
            req.query as unknown as IQueryParams
          );


      sendResponse(res, {
        httpStatusCode:
          status.OK,

        success: true,

        message:
          "Market comparisons retrieved successfully",

        data: result.data,

        meta: result.meta,
      });
    }
  );




const getMarketComparisonsByProduct =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {

      const {
        productId,
      } = req.params;


      const result =
        await MarketComparisonService
          .getMarketComparisonsByProduct(
            productId as string,

            req.query as unknown as IQueryParams
          );


      sendResponse(res, {
        httpStatusCode:
          status.OK,

        success: true,

        message:
          "Product market comparisons retrieved successfully",

        data:
          result.data,

        meta:
          result.meta,
      });
    }
  );



const getSingleMarketComparison =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {

      const {
        id,
      } = req.params;


      const comparison =
        await MarketComparisonService
          .getSingleMarketComparison(
            id as string
          );


      sendResponse(res, {
        httpStatusCode:
          status.OK,

        success: true,

        message:
          "Market comparison retrieved successfully",

        data: comparison,
      });
    }
  );




const deleteMarketComparison =
  catchAsync(
    async (
      req: Request,
      res: Response
    ) => {

      const {
        id,
      } = req.params;


      await MarketComparisonService
        .deleteMarketComparison(
          id as string
        );


      sendResponse(res, {
        httpStatusCode:
          status.OK,

        success: true,

        message:
          "Market comparison deleted successfully",

        data: null,
      });
    }
  );


export const MarketComparisonController = {
  createMarketComparison,
  getAllMarketComparisons,
  getMarketComparisonsByProduct,
  getSingleMarketComparison,
  deleteMarketComparison,
};