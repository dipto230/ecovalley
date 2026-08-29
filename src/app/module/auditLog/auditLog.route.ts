import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";

import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validationRequest";

import { AuditLogController } from "./auditLog.controller";

import {
    createAuditLogSchema,
  
    auditLogQuerySchema,
} from "./auditLog.validation";


const router = Router();


/**
 * Create Audit Log
 *
 * Customer only
 */
router.post(
    "/",
    checkAuth(Role.CUSTOMER),
    validateRequest(createAuditLogSchema),
    AuditLogController.createAuditLog
);


/**
 * Get all audit logs
 *
 * Admin + Customer
 */
router.get(
    "/",
    checkAuth(Role.ADMIN, Role.CUSTOMER),
    validateRequest(auditLogQuerySchema),
    AuditLogController.getAllAuditLogs
);


/**
 * Get current customer's logs
 */
router.get(
    "/my-logs",
    checkAuth(Role.CUSTOMER),
    // validateRequest(auditLogQuerySchema),
    AuditLogController.getMyAuditLogs
);


/**
 * Get single audit log
 *
 * Admin + Customer
 */
router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.CUSTOMER),
    // validateRequest(auditLogIdSchema),
    AuditLogController.getSingleAuditLog
);


export const AuditLogRoutes = router;