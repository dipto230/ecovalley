import z from "zod";

export const createSuperAdminZodSchema = z.object({
    name: z
        .string("Name must be a string")
        .min(2, "Name must be at least 2 characters"),

    email: z
        .email("Invalid email address"),

    password: z
        .string("Password must be a string")
        .min(8, "Password must be at least 8 characters"),

    profilePhoto: z
        .url("Profile photo must be a valid URL")
        .optional(),

    contactNumber: z
        .string("Contact number must be a string")
        .min(11, "Contact number must be at least 11 characters")
        .max(14, "Contact number must be at most 14 characters")
        .optional(),
});