import z from "zod";

const createCategoryZodSchema = z.object({
    name: z.string("Name is Required"),
    description: z.string("Description is Required").optional(),
});

export const CategoryValidation = {
    createCategoryZodSchema,
};