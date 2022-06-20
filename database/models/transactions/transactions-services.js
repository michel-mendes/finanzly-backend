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

async function getAllTransactions( associate ) {

    if ( associate ) {
        // return await tabTransactions.findAll({include: ['transactionWallets']});
    }
    else {
        return await tabTransactions.findAll();
    }

}

async function getTransactionById( id ) {
    const transaction = await tabTransactions.findByPk( id );

    return transaction;
}

async function getTransactionsByText( mySearchQuery ) {
    
    let queryOptions = {};

    if ( mySearchQuery ) {
        queryOptions = {
            where: {
                [Op.or]: [
                    sequelize.where( 
                        sequelize.fn( 'upper', sequelize.col( 'description' ) ),
                        Op.like,
                        sequelize.fn( 'upper', `%${mySearchQuery}%` )
                    ),
                    sequelize.where( 
                        sequelize.fn( 'upper', sequelize.col( 'extraInfo' ) ),
                        Op.like,
                        sequelize.fn( 'upper', `%${mySearchQuery}%` )
                    )
                ]
            }
        };
    }
    /*
    SELECT * FROM `transactions` AS `transactions` WHERE (upper(`description`) LIKE upper('%mySearchQuery%') OR upper(`extraInfo`) LIKE upper('%mySearchQuery%'));
    */

    const transaction = await tabTransactions.findAll( queryOptions );

    return transaction;
}

async function insertNewTransaction( parameters ) {

    // Creates a new transaction and return the new transaction Model
    try {
        return await tabTransactions.create( parameters );
    }
    catch (e) {
        return {
            error: true,
            message: e
        };
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