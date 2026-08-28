import { Prisma } from "../../../generated/prisma/client";

export const vendorSearchableFields = [
    "name",
    "email",
    "companyName",
    "contactNumber",
    "alternateContactNumber",
    "address",
    "city",
    "state",
    "postalCode",
    "country",
    "tradeLicenseNumber",
    "nidNumber",
    "tinNumber",
    "vatRegistrationNumber",
    "website",
    "businessType",
    "bankName",
    "bankAccountNumber",
    "bankBranch",
    "mobileBankingNumber",
    "notes",
];

export const vendorFilterableFields = [
    "name",
    "email",
    "companyName",
    "city",
    "state",
    "country",
    "businessType",
    "status",
    "isDeleted",
    "userId",
];

export const vendorIncludeConfig: Partial<Record<keyof Prisma.VendorsInclude, Prisma.VendorsInclude[keyof Prisma.VendorsInclude]>> = {
    user: true,
            categories: {
                 include: {
                     category: true
                 }
    },
    products: true,

    offers: true,

    orders: true,
}