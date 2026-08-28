import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload, IUpdateAdminPayload } from "./admin.interface";
import { auth } from "../../lib/auth";


const createAdmin = async (
    payload: ICreateAdminPayload
) => {
    const {
        password,
        admin,
    } = payload;

    const {
        name,
        email,
        profilePhoto,
        contactNumber,
    } = admin;

    // Check existing user
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new AppError(
            status.CONFLICT,
            "A user with this email already exists"
        );
    }

    // Create user through Better Auth
    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            role: Role.ADMIN,
        },
    });

    if (!data.user) {
        throw new AppError(
            status.INTERNAL_SERVER_ERROR,
            "Admin user creation failed"
        );
    }

    try {
        const result = await prisma.$transaction(
            async (tx) => {

                // Make sure role is ADMIN
                const createdUser = await tx.user.update({
                    where: {
                        id: data.user.id,
                    },
                    data: {
                        role: Role.ADMIN,
                    },
                });

                // Create Admin profile
                const createdAdmin = await tx.admin.create({
                    data: {
                        userId: createdUser.id,
                        name,
                        email,
                        profilePhoto,
                        contactNumber,
                    },
                });

                return {
                    user: createdUser,
                    admin: createdAdmin,
                };
            }
        );

        return result;

    } catch (error) {

        console.error(
            "Admin creation transaction error:",
            error
        );

        // Rollback Better Auth user
        await prisma.user.delete({
            where: {
                id: data.user.id,
            },
        });

        throw error;
    }
};

const getAllAdmins = async () => {
    const admins = await prisma.admin.findMany({
         where: {
            isDeleted: false,
        },
        include: {
            user: true,
        }
    })
    return admins;
}

const getAdminById = async (id: string) => {
    const admin = await prisma.admin.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        }
    })
    return admin;
}

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
    //TODO: Validate who is updating the admin user. Only super admin can update admin user and only super admin can update super admin user but admin user cannot update super admin user

    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        }
    })

    if (!isAdminExist) {
        throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    const { admin } = payload;

    const updatedAdmin = await prisma.admin.update({
        where: {
            id,
        },
        data: {
            ...admin,
        }
    })

    return updatedAdmin;
}

//soft delete admin user by setting isDeleted to true and also delete the user session and account
const deleteAdmin = async (id: string, user : IRequestUser) => {
    //TODO: Validate who is deleting the admin user. Only super admin can delete admin user and only super admin can delete super admin user but admin user cannot delete super admin user


    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        }
    })

    if (!isAdminExist) {
        throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    if(isAdminExist.id === user.userId){
        throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        await tx.user.update({
            where: { id: isAdminExist.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED // Optional: you may also want to block the user
            },
        })

        await tx.session.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        await tx.account.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        const admin = await getAdminById(id);

        return admin;
    }
    )

    return result;
}

export const AdminService = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    createAdmin
}