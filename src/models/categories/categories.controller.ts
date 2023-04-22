import { Request, Response, NextFunction, Router } from "express"
import Logger from "../../../config/logger"

// Validations
import { validateData } from "../../middleware/validation-handler"
import { categoryCreateValidation, categoryEditValidation } from "../../middleware/category-validator"

// Category service
import { categoryService } from "./categories.services"

// Authentication service
import { IAuthRequest } from "../../types/auth-request"
import { authGuard } from "../../middleware/auth-guard"

// Categories related routes
const categoryRouter = Router()

categoryRouter.get("/from-user/", authGuard, listUserCategories)
categoryRouter.post("/", categoryCreateValidation(), validateData, newCategory)
categoryRouter.get("/", listCategories)
categoryRouter.get("/:id", listCategoryById)
categoryRouter.put("/:id", categoryEditValidation(), validateData, editCategory)
categoryRouter.delete("/:id", deleteCategory)

export default categoryRouter

// Controller functions
//-----------------------------------------------------------------------------------
async function newCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const categoryData = req.body
        const newCategory = await categoryService.createCategory( categoryData )
        
        res.status(200).json( newCategory )
    } catch (error: any) {
        Logger.error(`Error while creating a new Category: ${ error.message }`)
        return next( error )
    }
}

async function listCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const categoriesList = await categoryService.getCategories()

        res.status(200).json( categoriesList )
    } catch (error: any) {
        Logger.error(`Error while getting all Categories list: ${ error.message }`)
        return next( error )
    }
}

async function listUserCategories(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const userCategories = await categoryService.getCategoriesFromUser(req.user!.id.toString())

        res.status(200).json( userCategories )
    } catch (error: any) {
        Logger.error(`Error while getting user's categories list: ${ error.message }`)
        return next( error )
    }
}

async function listCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
        const categoryId = req.params.id
        const category = await categoryService.getCategoryById( categoryId )

        res.status(200).json( category )
    } catch (error: any) {
        Logger.error(`Error while getting Category by ID: ${ error.message }`)
        return next( error )
    }
}

async function editCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const newCategoryData = req.body
        const categoryId = req.params.id
        const editedCategory = await categoryService.editCategory( categoryId, newCategoryData )

        res.status(200).json( editedCategory )
    } catch (error: any) {
        Logger.error(`Error while editing Category: ${ error.message }`)
        return next( error )
    }
}

async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const categoryId = req.params.id
        const removedCategory = await categoryService.deleteCategory( categoryId )

        res.status(200).json( removedCategory )
    } catch (error: any) {
        Logger.error(`Error while removing Category: ${ error.message }`)
        return next( error )
    }
}