import { ObjectId } from "mongoose";
import { AppError } from "../../middleware/error-handler";
import { ICategory, Category } from "./category";
import { GenericModelCRUD } from "../../classes/MongooseModelCRUD";

export const categoryService = {
    createCategory,
    getCategories,
    getCategoriesFromUser,
    getCategoryById,
    editCategory,
    deleteCategory
}

const crud = new GenericModelCRUD( Category )

async function createCategory( categoryData: ICategory ): Promise< ICategory > {
    const duplicateCategoryName = await verifyDuplicateCategoryName( categoryData.categoryName, categoryData.fromUser ) 

    if ( duplicateCategoryName ) throw new AppError("Category with duplicate name", 409)

    return await crud.insertDocument( categoryData, "fromUser" )
}

async function getCategories(): Promise< ICategory[] > {
    return await crud.findDocuments({}, 'fromUser')
}

async function getCategoriesFromUser(userId: string): Promise< ICategory[] > {
    return await crud.findDocuments({fromUser: userId})
}

async function getCategoryById( categoryId: string ): Promise< ICategory > {
    return await crud.findDocumentById( categoryId, 'fromUser' )
}

async function editCategory( categoryId: string, newCategoryData: ICategory ): Promise< ICategory > {
    return await crud.editDocument( categoryId, newCategoryData )
}

async function deleteCategory( categoryId: string ): Promise< ICategory > {
    return await crud.deleteDocument( categoryId )
}


// Helper functions
async function verifyDuplicateCategoryName( categoryName: string, fromUser: ObjectId ): Promise< boolean > {
    const categoryWithSameName = await crud.findDocuments({categoryName, fromUser})

    return categoryWithSameName.length > 0 ? true : false
}