import { ObjectId } from "mongoose";
import { AppError } from "../../middleware/error-handler";
import { ICategory, Category } from "./category";

export const categoryService = {
    createCategory,
    getCategories,
    getCategoriesById,
    editCategory,
    deleteCategory
}

async function createCategory( categoryData: ICategory ): Promise< ICategory > {
    const duplicateCategoryName = await verifyDuplicateCategoryName( categoryData.categoryName, categoryData.fromUser ) 
    let newCategory, populatedCategory

    if ( duplicateCategoryName ) throw new AppError("Category with duplicate name", 409)

    newCategory = new Category( categoryData )
    await newCategory.save()

    populatedCategory = await Category.findById( newCategory.id ).populate( "fromUser" )

    return populatedCategory!
}

async function getCategories(): Promise< Array<ICategory> > {
    return await Category.find().populate('fromUser')
}

async function getCategoriesById( categoryId: string ): Promise< ICategory | [] > {
    let category: ICategory | null | [] = await Category.findById( categoryId ).populate('fromUser')

    if ( !category ) { category = [] }
    
    return category
}

async function editCategory( categoryId: string, newCategoryData: ICategory ): Promise< ICategory > {
    const category = await Category.findById( categoryId ).populate('fromUser')
    
    if ( !category ) throw new AppError("Category not found", 404)
    if ( await verifyDuplicateCategoryName( newCategoryData.categoryName, category.fromUser ) ) throw new AppError( "Category with duplicate name", 409 )

    Object.assign( category, newCategoryData )
    category.save()

    // return the updated category
    return category
}

async function deleteCategory( categoryId: string ): Promise< ICategory > {
    const category = await Category.findById( categoryId ).populate('fromUser')

    if ( !category ) throw new AppError("Category not found", 404)

    await category.remove()

    // return the deleted category
    return category
}


// Helper functions
async function verifyDuplicateCategoryName( categoryName: string, fromUser: ObjectId ): Promise< boolean > {
    const categoryWithSameName = await Category.findOne({categoryName, fromUser})

    return categoryWithSameName ? true : false
}