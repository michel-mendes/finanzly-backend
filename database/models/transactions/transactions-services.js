const sequelize = require('../../database-controller');
const { Op } = require('sequelize');
const tabTransactions = require('./transactions');
const tabCategories = require('../categories/categories-services')
const tabTransactionsAndCategories = require('../association.transacation-category')
const extras = require('../../../extra-functions')
const util = require('util');

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
    
    let userId, walletId
    let searchString
    let startDate, endDate
    let groupByDate
    let whereOperations = {}
    let transactionsList

    if ( params ) {
        userId = params.userId
        walletId = params.walletId
        searchString = params.searchString
        startDate = params.startDate ? extras.parseDate( params.startDate ) : undefined
        endDate = params.endDate ? extras.parseDate( params.endDate ) : undefined
        groupByDate = params.groupByDate

        if ( userId ) {
            whereOperations['userId'] = userId
        }

        if ( walletId ) {
            whereOperations['walletId'] = walletId
        }
        
        if ( searchString ) {

            whereOperations[Op.or] = [
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
        
        if ( startDate || endDate ) {

            whereOperations[ 'date' ] = {}

            if ( startDate ) {
                whereOperations[ 'date' ][Op.gte] = startDate
            }

            if ( endDate ) {
                whereOperations[ 'date' ][Op.lte] = endDate
            }

        }
    }

    /*
    console.log('\n\n')
    console.log(util.inspect(whereOperations, false, null, true))
    console.log('\n\n')
    */

    transactionsList = await tabTransactionsAndCategories.tabTransactions.findAll( {where: whereOperations, include: ['fromCategory', 'fromWallet']} );

    if ( groupByDate ) {
        let groupedTransactions = {}

        transactionsList.forEach( transaction => {

            let groupItem = new Date( transaction.date ).toISOString().slice(0, 10).replace(/-/g, '')

            if ( !groupedTransactions[ groupItem ] ) {
                groupedTransactions[ groupItem ] = []
            }

            groupedTransactions[ groupItem ].push( transaction )
        })

        transactionsList = groupedTransactions
    }

    return transactionsList;
}

async function getTransactionsByDate(startDate = new Date(), endDate = new Date()) {
    startDate.setHours(21, 00, 00, 000)
    endDate.setHours(20, 59, 59, 999)
}

async function insertNewTransaction( parameters ) {

    // Creates a new transaction
    try {
        let category = await tabCategories.getCategoryById( parameters.categoryId )
        
        // console.log(`Data recebida -> ${new Date(parameters.date).toJSON()}`)

        if ( category.transactionType == 'D' ) {
            parameters.debitValue = parameters.value
            parameters.creditValue = 0
        }
        else {
            parameters.debitValue = 0
            parameters.creditValue = parameters.value
        }

        let insertionResult = await tabTransactions.create( parameters );
        // console.log('Resultado do cadastro:\n')
        // console.log( JSON.stringify(insertionResult, '', 4) )

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