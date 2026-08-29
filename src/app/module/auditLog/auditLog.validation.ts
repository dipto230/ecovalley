import { z } from "zod";

export const createAuditLogSchema = z.object({
    action: z
        .string()
        .trim()
        .min(2, "Action is required")
        .max(100, "Action must not exceed 100 characters"),

    entityType: z
        .string()
        .trim()
        .min(2, "Entity type is required")
        .max(100, "Entity type must not exceed 100 characters"),

    entityId: z
        .string()
        .trim()
        .min(1, "Entity ID is required"),
});


export const auditLogIdSchema = z.object({
    id: z.string().uuid("Invalid audit log ID"),
});


export const auditLogQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).optional(),

    limit: z.string().regex(/^\d+$/).optional(),

    search: z.string().trim().optional(),

    action: z.string().trim().optional(),

    entityType: z.string().trim().optional(),

    entityId: z.string().trim().optional(),

    customerId: z.string().uuid("Invalid customer ID").optional(),

    sortBy: z
        .enum(["createdAt", "action", "entityType"])
        .optional(),

    sortOrder: z
        .enum(["asc", "desc"])
        .optional(),
});