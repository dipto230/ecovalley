import { Category, Role } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateVendorPayload } from "./user.interface";

const createVendor = async (payload: ICreateVendorPayload) => {
    const categories: Category[] = [];
    for (const categoryId of payload.category) {
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId
            }
        })
        if (!category) {
            throw new Error(`category with id ${categoryId} not found`)
        }
        categories.push(category);
    }
    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.vendor.email
        }
    })
    if (userExists) {
        throw new Error("User with this email already exists");
    }
    const userData = await auth.api.signUpEmail({
        body: {
            email: payload.vendor.email,
            password: payload.password,
            role: Role.VENDOR,
            name: payload.vendor.name,
            

            
        }
    })
    try {
        const result = await prisma.$transaction(async (tx) => {
            const vendorData = await tx.vendors.create({
                data: {
                    userId: userData.user.id,
                    ...payload.vendor
                }
            })
            const vendorCategoriesData = categories.map((category) => {
                return {
                    vendorId: vendorData.id,
                    categoryId: category.id
                }
            })
            await tx.vendorsCategory.createMany({
                data:vendorCategoriesData
            })
            const vendor = await tx.vendors.findUnique({
                where: {
                    id:vendorData.id
                },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    alternateContactNumber: true,
                    address: true,
                    city: true,
                    state: true,
                    postalCode: true,
                    country: true,
                    companyName: true,
                    tradeLicenseNumber: true,
                    nidNumber: true,
                    tinNumber: true,
                    vatRegistrationNumber: true,
                    website: true,
                    businessType: true,
                    status: true,
                    bankName: true,
                    bankAccountNumber: true,
                    bankBranch: true,
                    mobileBankingNumber: true,
                    notes: true,
                    createdAt: true,
                    updatedAt:true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            status: true,
                            emailVerified: true,
                            image: true,
                            isDeleted: true,
                            deletedAt:true,
                            createdAt: true,
                            updatedAt:true
                        }
                        
                    },
                    categories: {
                        select: {
                            category: {
                                select: {
                                 name: true,
                                id: true,
                                description: true,
                                }
                         
                                
                                
                                
                            }
                        }
                    }
                 

                }
            })
            return vendor
        })
        return result;
        
    } catch (error) {
        console.log("Transaction error: ", error);
        await prisma.user.delete({
            where: {
                id:userData.user.id
            }
        })
    }
}

export const UserService = {
    createVendor
}