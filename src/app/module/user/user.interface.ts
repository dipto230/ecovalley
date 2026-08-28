import { VendorStatus } from "../../../generated/prisma/enums";







export interface ICreateVendorPayload {
    password: string;
    vendor: {
        name: string;
        email: string;
        profilePhoto: string;
        contactNumber: string;
        alternateContactNumber: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        companyName: string;
        tradeLicenseNumber: string;
        nidNumber: string;
        tinNumber: string;
        vatRegistrationNumber: string;
        website: string;
        businessType: string;
        status: VendorStatus;
       
        bankName: string;
        bankAccountNumber: string;
        bankBranch: string;
        mobileBankingNumber: string;
        notes: string;


    }
    category: string[];
}