const sequelize = require('../../database-controller');
const { Op } = require('sequelize');
const tabTransactions = require('./transactions');

module.exports = {
    getAllTransactions,
    getTransactionById,
    getTransactionsByText,
    insertNewTransaction,
    editTransaction,
    deleteTransaction
};

async function getAllTransactions( userId = new Number(0) ) {

    if ( userId ) {
        let sqlQuery = {
            where: {
                userId: userId
            }
        }

        return await tabTransactions.findAll( sqlQuery )
    }
    else {
        return await tabTransactions.findAll();
    }

}

async function getTransactionById( id ) {
    const transaction = await tabTransactions.findByPk( id );

    return transaction;
}

async function getTransactionsByText( params ) {
    
    let userId
    let searchString
    let queryOptions = {};

    if ( params ) {
        userId = params.userId
        searchString = params.searchString
    }

     if ( userId ) {
         queryOptions.where = {
            userId: userId
         }
     }
    
    if ( searchString ) {

        if ( queryOptions.where ) {
            
            queryOptions.where[ Op.and ] = {
                [Op.or]: [
                    sequelize.where( 
                        sequelize.fn( 'upper', sequelize.col( 'description' ) ),
                        Op.like,
                        sequelize.fn( 'upper', `%${searchString}%` )
                    ),
                    sequelize.where( 
                        sequelize.fn( 'upper', sequelize.col( 'extraInfo' ) ),
                        Op.like,
                        sequelize.fn( 'upper', `%${searchString}%` )
                    )
                ]
            }

        } else {
            queryOptions.where = {
                [Op.or]: [
                    sequelize.where( 
                        sequelize.fn( 'upper', sequelize.col( 'description' ) ),
                        Op.like,
                        sequelize.fn( 'upper', `%${searchString}%` )
                    ),
                    sequelize.where( 
                        sequelize.fn( 'upper', sequelize.col( 'extraInfo' ) ),
                        Op.like,
                        sequelize.fn( 'upper', `%${searchString}%` )
                    )
                ]
            }
        }
        
        // queryOptions.where = {
        //         [Op.or]: [
        //             sequelize.where( 
        //                 sequelize.fn( 'upper', sequelize.col( 'description' ) ),
        //                 Op.like,
        //                 sequelize.fn( 'upper', `%${searchString}%` )
        //             ),
        //             sequelize.where( 
        //                 sequelize.fn( 'upper', sequelize.col( 'extraInfo' ) ),
        //                 Op.like,
        //                 sequelize.fn( 'upper', `%${searchString}%` )
        //             )
        //         ]
        //     }
    }

    /*
    SELECT * FROM `transactions` AS `transactions` WHERE (upper(`description`) LIKE upper('%mySearchQuery%') OR upper(`extraInfo`) LIKE upper('%mySearchQuery%'));
    */

    const transaction = await tabTransactions.findAll( queryOptions );

    return transaction;
}

async function getTransactionsByDate(startDate = new Date(), endDate = new Date()) {
    startDate.setHours(21, 00, 00, 000)
    endDate.setHours(20, 59, 59, 999)
}

async function insertNewTransaction( parameters ) {

    // Creates a new transaction
    try {
        await tabTransactions.create( parameters );

        return 'Transação cadastrada com sucesso!'
    }
    catch (e) {
        throw `Erro interno >> '${ e }'`
    }
}

async function editTransaction( parameters ) {
    const transaction = await getTransactionById( parameters.id );    
       
    const editedTransaction = {
        categoryId:     parameters.categoryId,
        walletId:       parameters.walletId,
        date:           parameters.date,      
        description:    parameters.description,
        extraInfo:      parameters.extraInfo,
        value:          parameters.value,
        creditValue:    parameters.creditValue,
        debitValue:     parameters.debitValue,
        csvImportId:    parameters.csvImportId
    }

    Object.assign(transaction, editedTransaction);
    
    return await transaction.save();
}

async function deleteTransaction( id ) {
    const transaction = await getTransactionById( id );

    if ( !transaction ) {
        return {
            error: true,
            message: `Transação não encontrada!`
        }
    }

    await transaction.destroy();
    return {message: `Transação excluída com sucesso!`}
}