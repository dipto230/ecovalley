import { Category } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"





const createCategory = async (payload: Category): Promise<Category> => {
    const category = await prisma.category.create({
        data: payload
    })
    return category
}


const getAllCategories = async(): Promise<Category[]> => {
    const categories = await prisma.category.findMany()
    return categories
}

const deleteCategory = async (id: string): Promise<Category> => {
    const category = await prisma.category.delete({
        where: {id}
    })
    return category
}



export const CategoryService = {
    createCategory,
    getAllCategories,
    deleteCategory
}