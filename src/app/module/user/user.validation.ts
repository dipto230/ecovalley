import { VendorStatus } from "../../../generated/prisma/enums";
import z from "zod";

export  const createVendorZodSchema = z.object({
    password: z.string("Password is required").min(6, "Password must be at last 6 characters").max(20, "Password must be at most 20 characters"),
    vendor: z.object({
        name: z.string("Name is required").min(5, "Name must be at least 5 characters").max(30, "Name must be at most 30 characters"),
        email: z.email("Invalid email address"),
        profilePhoto: z.string().optional().default(""),
        contactNumber: z.string().min(1, "Contact number is required"),

       alternateContactNumber: z.string().optional().default(""),

    address: z.string().min(1, "Address is required"),

        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),

    postalCode: z.string().min(1, "Postal code is required"),

    country: z.string().min(1, "Country is required"),

    companyName: z.string().min(1, "Company name is required"),

    tradeLicenseNumber: z.string().optional().default(""),

    nidNumber: z.string().optional().default(""),

    tinNumber: z.string().optional().default(""),
        vatRegistrationNumber: z.string().optional().default(""),
          website: z
      .string()
      .url("Invalid website URL")
      .optional()
      .or(z.literal("")),

    businessType: z.string().min(1, "Business type is required"),

   

        bankName: z.string().optional().default(""),
    bankAccountNumber: z.string().optional().default(""),

    bankBranch: z.string().optional().default(""),

        mobileBankingNumber: z.string().optional().default(""),
    status: z.enum(VendorStatus),

    notes: z.string().optional().default(""),
    
    
    }),
    category: z.array(z.uuid(), "Category must be an array of string").min(1, "At least one category is required")

})