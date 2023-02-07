import { ObjectId } from "mongoose";
import { AppError } from "../../middleware/error-handler";
import { ICategory, Category } from "./category";
import { GenericModelCRUD } from "../../classes/MongooseModelCRUD";

export const categoryService = {
    createCategory,
    getCategories,
    getCategoriesById,
    editCategory,
    deleteCategory
}

const CRUD = new GenericModelCRUD( Category )

async function createCategory( categoryData: ICategory ): Promise< ICategory > {
    const duplicateCategoryName = await verifyDuplicateCategoryName( categoryData.categoryName, categoryData.fromUser ) 
    let newCategory

    if ( duplicateCategoryName ) throw new AppError("Category with duplicate name", 409)

    newCategory = await CRUD.insertDocument( categoryData, "fromUser" )

    return newCategory
}

async function getCategories(): Promise< ICategory[] > {
    return await CRUD.findDocuments({}, 'fromUser')
}

async function getCategoriesById( categoryId: string ): Promise< ICategory > {
    return await CRUD.findDocumentById( categoryId, 'fromUser' )
}

async function editCategory( categoryId: string, newCategoryData: ICategory ): Promise< ICategory > {
    return await CRUD.editDocument( categoryId, newCategoryData )
}

async function deleteCategory( categoryId: string ): Promise< ICategory > {
    return CRUD.deleteDocument( categoryId )
}


// Helper functions
async function verifyDuplicateCategoryName( categoryName: string, fromUser: ObjectId ): Promise< boolean > {
    const categoryWithSameName = await CRUD.findDocuments({categoryName, fromUser})

    return categoryWithSameName.length > 0 ? true : false
}