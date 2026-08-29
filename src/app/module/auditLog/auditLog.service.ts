/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";

import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

import {
    IAuditLogQuery,
    ICreateAuditLog,
} from "./auditLog.interface";


/**
 * Create Audit Log
 *
 * customerId is NOT accepted from client.
 * It is resolved from authenticated user's userId.
 */
const createAuditLog = async (
    userId: string,
    payload: ICreateAuditLog
) => {

    const customer = await prisma.customer.findUnique({
        where: {
            userId,
        },
        select: {
            id: true,
            isDeleted: true,
        },
    });

    if (!customer) {
        throw new AppError(
            status.NOT_FOUND,
            "Customer profile not found"
        );
    }

    if (customer.isDeleted) {
        throw new AppError(
            status.FORBIDDEN,
            "Deleted customer cannot create audit logs"
        );
    }

    const auditLog = await prisma.auditLog.create({
        data: {
            customerId: customer.id,
            action: payload.action,
            entityType: payload.entityType,
            entityId: payload.entityId,
        },
    });

    return auditLog;
};


/**
 * Get all Audit Logs
 */
const getAllAuditLogs = async (
    query: IAuditLogQuery,
    userId: string,
    isAdmin: boolean = false
) => {

    const page = Math.max(Number(query.page) || 1, 1);

    const limit = Math.min(
        Math.max(Number(query.limit) || 10, 1),
        100
    );

    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const where: any = {};

    /**
     * Normal customer can only see
     * his own audit logs.
     */
    if (!isAdmin) {

        const customer = await prisma.customer.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!customer) {
            throw new AppError(
                status.NOT_FOUND,
                "Customer profile not found"
            );
        }

        where.customerId = customer.id;
    }

    /**
     * Admin can filter by customerId.
     */
    if (isAdmin && query.customerId) {
        where.customerId = query.customerId;
    }

    if (query.action) {
        where.action = {
            contains: query.action,
            mode: "insensitive",
        };
    }

    if (query.entityType) {
        where.entityType = {
            contains: query.entityType,
            mode: "insensitive",
        };
    }

    if (query.entityId) {
        where.entityId = query.entityId;
    }

    /**
     * Global search
     */
    if (query.search) {
        where.OR = [
            {
                action: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                entityType: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                entityId: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [logs, total] = await prisma.$transaction([
        prisma.auditLog.findMany({
            where,

            orderBy: {
                [sortBy]: sortOrder,
            },

            skip,
            take: limit,

            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
            },
        }),

        prisma.auditLog.count({
            where,
        }),
    ]);

    return {
        data: logs,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};


/**
 * Get single Audit Log
 */
const getSingleAuditLog = async (
    id: string,
    userId: string,
    isAdmin: boolean = false
) => {

    const auditLog = await prisma.auditLog.findUnique({
        where: {
            id,
        },

        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profilePhoto: true,
                },
            },
        },
    });

    if (!auditLog) {
        throw new AppError(
            status.NOT_FOUND,
            "Audit log not found"
        );
    }

    /**
     * Customer can only access
     * his own audit log.
     */
    if (!isAdmin) {

        const customer = await prisma.customer.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!customer || auditLog.customerId !== customer.id) {
            throw new AppError(
                status.FORBIDDEN,
                "You do not have permission to access this audit log"
            );
        }
    }

    return auditLog;
};


/**
 * Get customer's own audit logs
 */
const getMyAuditLogs = async (
    userId: string,
    query: IAuditLogQuery
) => {

    return getAllAuditLogs(
        query,
        userId,
        false
    );
};


export const AuditLogService = {
    createAuditLog,
    getAllAuditLogs,
    getSingleAuditLog,
    getMyAuditLogs,
};