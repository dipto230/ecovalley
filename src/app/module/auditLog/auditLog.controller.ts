import status from "http-status";
import { Request, Response } from "express";

import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

import { AuditLogService } from "./auditLog.service";



const createAuditLog = catchAsync(
    async (req: Request, res: Response) => {

        const result = await AuditLogService.createAuditLog(
            req.user.userId,
            req.body
        );

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Audit log created successfully",
            data: result,
        });
    }
);



const getAllAuditLogs = catchAsync(
    async (req: Request, res: Response) => {

        const isAdmin = req.user.role === "ADMIN";

        const result = await AuditLogService.getAllAuditLogs(
            req.query,
            req.user.userId,
            isAdmin
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Audit logs retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    }
);



const getMyAuditLogs = catchAsync(
    async (req: Request, res: Response) => {

        const result = await AuditLogService.getMyAuditLogs(
            req.user.userId,
            req.query
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Your audit logs retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    }
);



const getSingleAuditLog = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await AuditLogService.getSingleAuditLog(
            id as string,
            req.user.userId,
            req.user.role === "ADMIN"
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Audit log retrieved successfully",
            data: result,
        });
    }
);


export const AuditLogController = {
    createAuditLog,
    getAllAuditLogs,
    getMyAuditLogs,
    getSingleAuditLog,
};