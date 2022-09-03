const sequelize = require('../../database-controller');
const { Op } = require('sequelize');
const tabCategory = require('./categories');

module.exports = {
    getAllCategories,
    getCategoriesByName,
    getCategoryById,
    insertNewCategory,
    editCategory,
    deleteCategory,
    getCategoriesFromUser
};

async function getAllCategories() {
    return await tabCategory.findAll();
}

async function getCategoriesFromUser( requestedUserId ) {
    const userCategories = await tabCategory.findAll( {
        where: {
            userId: requestedUserId
        }
    });

    return userCategories;
}

async function getCategoryById( id ) {
    const category = await tabCategory.findByPk(id);

    return category;
}

async function getCategoriesByName( categoryName ) {
    
    const categoriesList = await tabCategory.findAll( {
        where: sequelize.where( sequelize.fn('upper', sequelize.col('name')), Op.like, sequelize.fn('upper', `%${categoryName}%`) )
    });

    return categoriesList;
}

async function insertNewCategory( parameters ) {
    const category = await tabCategory.findOne({ where: { name: parameters.name,
                                                          userId: parameters.userId } });

    if ( category ) {
        return {
            error: true,
            message: `Você já possui uma categoria com o nome \'${ parameters.name }\'`
        }
    }
    else {
        try {
            return await tabCategory.create( parameters );
        }
        catch (e) {
            return {
                error: true,
                message: e
            };
        }
    }    
}

async function editCategory( parameters ) {
    const category = await getCategoryById( parameters.id );
    const existingCategory = await tabCategory.findOne({ where: { name: parameters.name,
                                                                  userId: parameters.userId } });
    
    if ( !category ) {
        return {
            error: true,
            message: `Categoria não encontrada!`
        }
    }
    
    if (( existingCategory ) && ( Number(existingCategory.id) !== Number(parameters.id) )) {
        return {
            error: true,
            message: `Você já possui uma categoria com o nome \'${ parameters.name }\'`
        }
    }
    
    const editedCategory = {
        name: parameters.name,
        transactionType: parameters.transactionType
    }
    
    Object.assign(category, editedCategory);
    
    return await category.save();
}

async function deleteCategory( id ) {
    const category = await getCategoryById( id );

    if ( !category ) {
        return {
            error: true,
            message: 'Categoria não encontrada!'
        }
    }

    await category.destroy();
    return {message: `Categoria excluída com sucesso!`}
}