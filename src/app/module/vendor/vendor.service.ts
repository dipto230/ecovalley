import status from "http-status"
import { Prisma, Vendors } from "../../../generated/prisma/client"
import AppError from "../../errorHelpers/AppError"
import { IQueryParams } from "../../interfaces/query.interface"
import { prisma } from "../../lib/prisma"
import { QueryBuilder } from "../../utils/QueryBuilder"
import { vendorFilterableFields, vendorIncludeConfig } from "./vendor.constant"
import { IUpdateVendorPayload } from "./vendor.interface"

const getAllVendor = async(query: IQueryParams)=>{
    // const vendors = await prisma.vendors.findMany({
    //     where: {
    //       isDeleted: false,
           
    //       },
    
    //     include: {
    //         user: true,
    //         categories: {
    //             include: {
    //                 category: true
    //             }
    //         }
    //     }
        
    // })
    // return vendors
    const queryBuilder = new QueryBuilder<Vendors, Prisma.VendorsWhereInput,Prisma.VendorsInclude>(
        prisma.vendors,
        query,
        {
            searchableFields: vendorFilterableFields,
            filterableFields: vendorFilterableFields
        }
    )
    const result = await queryBuilder
        .search()
        .filter()
    .where({
        isDeleted: false,
    })
        .include({
            user: true,
            categories: true,
            // categories: {
            //      include: {
            //          category: true
            //      }
            //  }
            
        })
        .dynamicInclude(vendorIncludeConfig)
        .paginate()
        .sort()
        .fields()
    .execute()
    return result
}


const getVendorById = async (id: string, query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        Vendors,
        Prisma.VendorsWhereInput,
        Prisma.VendorsInclude
    >(
        prisma.vendors,
        query,
        {
            searchableFields: vendorFilterableFields,
            filterableFields: vendorFilterableFields,
        }
    );

    const result = await queryBuilder
        .where({
            id,
            isDeleted: false,
        })
        .dynamicInclude(vendorIncludeConfig)
        .execute();

    if (!result) {
        throw new AppError(status.NOT_FOUND, "Vendor not found");
    }

    return result;
};

const updateVendor = async (
    id: string,
    payload: IUpdateVendorPayload
) => {
    const isVendorExist = await prisma.vendors.findUnique({
        where: {
            id,
        },
    });

    if (!isVendorExist || isVendorExist.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Vendor not found");
    }

    const { category, ...vendorData } = payload;

    await prisma.$transaction(async (tx) => {

        // Update vendor information
        if (Object.keys(vendorData).length > 0) {
            await tx.vendors.update({
                where: {
                    id,
                },
                data: {
                    ...vendorData,
                },
            });
        }

        // Update categories
        if (category && category.length > 0) {

            // Existing categories remove
            await tx.vendorsCategory.deleteMany({
                where: {
                    vendorId: id,
                },
            });

            // New categories create
            await tx.vendorsCategory.createMany({
                data: category.map((categoryId) => ({
                    vendorId: id,
                    categoryId,
                })),
                skipDuplicates: true,
            });
        }
    });

    const vendor = await getVendorById(id, {});

    return vendor;
};

const deleteVendor = async (id: string) => {

    const isVendorExist = await prisma.vendors.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });

    if (!isVendorExist || isVendorExist.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Vendor not found");
    }


    await prisma.$transaction(async (tx) => {

        // Soft delete Vendor
        await tx.vendors.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });


        // Soft delete User
        await tx.user.update({
            where: {
                id: isVendorExist.userId,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: "DELETED",
            },
        });


        // Delete user sessions
        await tx.session.deleteMany({
            where: {
                userId: isVendorExist.userId,
            },
        });


        // Delete vendor categories
        await tx.vendorsCategory.deleteMany({
            where: {
                vendorId: id,
            },
        });
    });


    return {
        message: "Vendor deleted successfully",
    };
};
export const VendorService = {
    getAllVendor,
    getVendorById,
    updateVendor,
    deleteVendor
}