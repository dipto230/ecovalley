import { AuditLog } from "../../../generated/prisma/client";

export interface ICreateAuditLog {
    action: string;
    entityType: string;
    entityId: string;
}

export interface IAuditLogQuery {
    page?: string;
    limit?: string;
    search?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    customerId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface IAuditLogResponse {
    data: AuditLog[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}