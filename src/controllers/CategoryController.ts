import { Response, NextFunction, Router } from "express"
import { AppError } from "../middleware/error-handler"
import Logger from "../../config/logger"

// Authentication service
import { IAuthRequest } from "../types/auth-request"

// Database manipulators
import { GenericModelCRUD } from "../classes/MongooseModelCRUD"
import { Category } from "../models/categories/category"

export const categoryController = {
    createNewCategory,
    listAllCategories,
    listUserCategories,
    listCategoryById,
    editCategory,
    deleteCategory
}

const categoriesCrud = new GenericModelCRUD(Category)

// Controller functions
//-----------------------------------------------------------------------------------
async function createNewCategory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const categoryData = req.body
        const duplicateCategoryName = await _verifyCategoryWithSameName(categoryData.categoryName, categoryData.fromUser)

        if (duplicateCategoryName) throw new AppError("Category with duplicate name", 409)

        const createdCategory = await categoriesCrud.insertDocument(categoryData, "fromUser")

        res.status(200).json(createdCategory)
    } catch (error: any) {
        Logger.error(`Error while creating a new Category: ${error.message}`)
        return next(error)
    }
}

async function listAllCategories(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const categoriesList = await categoriesCrud.findDocuments()

        res.status(200).json(categoriesList)
    } catch (error: any) {
        Logger.error(`Error while getting all Categories list: ${error.message}`)
        return next(error)
    }
}

async function listUserCategories(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const fromUser = req.user!.id
        const userCategories = await categoriesCrud.findDocuments({ fromUser })

        res.status(200).json(userCategories)
    } catch (error: any) {
        Logger.error(`Error while getting user's categories list: ${error.message}`)
        return next(error)
    }
}

async function listCategoryById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const categoryId = req.params.id
        const category = await categoriesCrud.findDocumentById(categoryId)

        res.status(200).json(category)
    } catch (error: any) {
        Logger.error(`Error while getting Category by ID: ${error.message}`)
        return next(error)
    }
}

async function editCategory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const newCategoryData = req.body
        const categoryId = req.params.id

        const updatedCategory = await categoriesCrud.editDocument(categoryId, newCategoryData)

        res.status(200).json(updatedCategory)
    } catch (error: any) {
        Logger.error(`Error while editing Category: ${error.message}`)
        return next(error)
    }
}

async function deleteCategory(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const categoryId = req.params.id

        const deletedCategory = await categoriesCrud.deleteDocument(categoryId)

        res.status(200).json(deletedCategory)
    } catch (error: any) {
        Logger.error(`Error while removing Category: ${error.message}`)
        return next(error)
    }
}


// Helper functions
async function _verifyCategoryWithSameName(categoryName: string, fromUser: string): Promise<boolean> {
    const thereIsCategoryWithSameName = (await categoriesCrud.findDocuments({ categoryName, fromUser })).length > 0

    return thereIsCategoryWithSameName
}