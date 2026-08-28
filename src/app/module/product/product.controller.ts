import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

import { IQueryParams } from "../../interfaces/query.interface";

import { ProductService } from "./product.service";




const createProduct = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const product =
      await ProductService.createProduct(
        req.body,
        req.user
      );


    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Product created successfully",
      data: product,
    });
  }
);




const getAllProducts = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const result =
      await ProductService.getAllProducts(
        req.query as unknown as IQueryParams
      );


    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);




const getSingleProduct = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const { id } = req.params;


    const product =
      await ProductService.getSingleProduct(
        id as string,
        req.query as unknown as IQueryParams
      );


    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  }
);




const updateProduct = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const { id } = req.params;


    const product =
      await ProductService.updateProduct(
        id as string,
        req.body,
        req.user
      );


    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  }
);




const deleteProduct = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const { id } = req.params;


    await ProductService.deleteProduct(
      id as string,
      req.user
    );


    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  }
);




const getProductsByVendor = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const { vendorId } = req.params;


    const result =
      await ProductService.getProductsByVendor(
        vendorId as string,
        req.query as unknown as IQueryParams
      );


    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message:
        "Vendor products retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);




const getProductsByCategory = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const { categoryId } = req.params;


    const result =
      await ProductService.getProductsByCategory(
        categoryId as string,
        req.query as unknown as IQueryParams
      );


    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message:
        "Category products retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);




const getProductsByStatus = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const { status: productStatus } =
      req.params;


    const result =
      await ProductService.getProductsByStatus(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        productStatus as any,
        req.query as unknown as IQueryParams
      );


    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);




export const ProductController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductsByVendor,
  getProductsByCategory,
  getProductsByStatus,
};