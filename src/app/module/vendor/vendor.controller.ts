import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";

import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { VendorService } from "./vendor.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllVendors =   catchAsync(
    async (req: Request, res: Response) => {
        const query = req.query;
      
        const result = await VendorService.getAllVendor(query as IQueryParams);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Vendor Fetched Successfully",
            data: result
        })
    }
)

const getVendorById = catchAsync(
    async (req: Request, res: Response) => {

        const { id } = req.params;

        const vendor = await VendorService.getVendorById(
            id as string,
            req.query as unknown as IQueryParams
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Vendor retrieved successfully",
            data: vendor,
        });
    }
);

const updateVendor = catchAsync(
    async (req: Request, res: Response) => {

        const { id } = req.params;
        const payload = req.body;

        const updatedVendor =
            await VendorService.updateVendor(
                id as string,
                payload
            );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Vendor updated successfully",
            data: updatedVendor,
        });
    }
);

const deleteVendor = catchAsync(
    async (req: Request, res: Response) => {

        const { id } = req.params;

        const result =
            await VendorService.deleteVendor(id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Vendor deleted successfully",
            data: result,
        });
    }
);




export const VendorController = {
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor
}
