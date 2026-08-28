import z from "zod";

export const createAdminZodSchema = z.object({
    password: z
        .string("Password must be a string")
        .min(8, "Password must be at least 8 characters"),

    admin: z.object({
        name: z
            .string("Name must be a string")
            .min(2, "Name must be at least 2 characters"),

        email: z
            .email("Email must be a valid email"),

        profilePhoto: z
            .url("Profile photo must be a valid URL")
            .optional(),

        contactNumber: z
            .string("Contact number must be a string")
            .min(
                11,
                "Contact number must be at least 11 characters"
            )
            .max(
                14,
                "Contact number must be at most 14 characters"
            )
            .optional(),
    }),
});

export const updateAdminZodSchema = z.object({
    admin: z
        .object({
            name: z
                .string("Name must be a string")
                .min(2, "Name must be at least 2 characters")
                .optional(),

            profilePhoto: z
                .url("Profile photo must be a valid URL")
                .optional(),

            contactNumber: z
                .string("Contact number must be a string")
                .min(
                    11,
                    "Contact number must be at least 11 characters"
                )
                .max(
                    14,
                    "Contact number must be at most 14 characters"
                )
                .optional(),
        })
        .optional(),
});