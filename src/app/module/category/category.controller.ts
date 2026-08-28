/* eslint-disable @typescript-eslint/no-explicit-any */
import {  Request, Response } from "express";
import { CategoryService } from "./category.service";
import { catchAsync } from "../../shared/catchAsync";


 











const createCategory = async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        console.log(req.file);
        const payload = {
            ...req.body,
            icon : req.file?.path
        };
    const result = await CategoryService.createCategory(payload)
    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result
    })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
      }) 
    }
}


const getAllCategories = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CategoryService.getAllCategories()
        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: result
        })
    }
)


const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await CategoryService.deleteCategory(id as string);
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: result
        })
    } catch (error: any) {
         console.log(error)
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
      }) 
    }
}


export const CategoryController = {
    createCategory,
    getAllCategories,
    deleteCategory
}