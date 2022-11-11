const sequelize = require('../../database-controller');
const { Op } = require('sequelize');
const tabTransactions = require('./transactions');
const tabCategories = require('../categories/categories-services')
const tabWallets = require('../wallets/wallets-services')
const tabTransactionsAndCategories = require('../association.transacation-category')
const extras = require('../../../extra-functions')

module.exports = {
    getAllTransactions,
    getTransactionById,
    getTransactionsByText,
    getTransactionByCsvId,
    insertNewTransaction,
    editTransaction,
    deleteTransaction,
    getGainsAndExpensesByWeek,
    generateListGroupedByCategory,
    generateListGroupedByDate,
    generateTransactionsReport
};

async function getAllTransactions( userId ) {

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

async function getTransactionByCsvId( userId, walletId, csvId ) {

    let transaction = await tabTransactions.findAll({
        where: {
            userId: userId,
            walletId: walletId,
            csvImportId: csvId
        }
    })

    return transaction

}

async function getTransactionsByText( params ) {
    
    let userId, walletId
    let searchString
    let startDate, endDate
    let groupByDate
    let groupByCategory
    let whereOperations = {}
    let transactionsList

    if ( params ) {
        userId = params.userId
        walletId = params.walletId
        searchString = params.searchString
        startDate = params.startDate ? extras.parseDate( params.startDate ) : undefined
        endDate = params.endDate ? extras.parseDate( params.endDate ) : undefined
        groupByDate = params.groupByDate
        groupByCategory = params.groupByCategory

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

    transactionsList = await tabTransactionsAndCategories.tabTransactions.findAll( {
        where: whereOperations,
        order: [['date', 'DESC']],
        include: ['fromCategory', 'fromWallet']
    } );

    if ( groupByDate ) {
                
        transactionsList = generateListGroupedByDate( transactionsList )

    }

    if ( groupByCategory ) {
                
        transactionsList = generateListGroupedByCategory( transactionsList )

    }

    return transactionsList;
}

async function insertNewTransaction( parameters ) {

    // Creates a new transaction
    try {
        let category = await tabCategories.getCategoryById( parameters.categoryId )
        let wallet = await tabWallets.getWalletById( parameters.walletId )
        
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

        if ( parameters.debitValue > 0 ) {
            wallet.actualBalance = Number(wallet.actualBalance) - Number(parameters.debitValue)
            await tabWallets.editWallet( wallet )
        }
        else {
            wallet.actualBalance = Number(wallet.actualBalance) + Number(parameters.creditValue)
            await tabWallets.editWallet( wallet )
        }

        return 'Transação cadastrada com sucesso!'
    }
    catch (e) {
        throw `Erro interno >> '${ e }'`
    }
}

async function editTransaction( parameters ) {
    
    try {

        let transaction = await getTransactionById( parameters.id )
        let actualCategory = await tabCategories.getCategoryById( transaction.categoryId )
        let newCategory = await tabCategories.getCategoryById( parameters.categoryId )
        let wallet = await tabWallets.getWalletById( parameters.walletId )

        let newWalletBalance = 0    
        let debitValue = newCategory.transactionType == 'D' ? parameters.value : 0
        let creditValue = newCategory.transactionType == 'C' ? parameters.value : 0
           
        const editedTransaction = {
            categoryId:     parameters.categoryId,
            date:           parameters.date,      
            description:    parameters.description,
            extraInfo:      parameters.extraInfo,
            value:          parameters.value,
            creditValue:    creditValue,
            debitValue:     debitValue,
        }
        // console.log('edited transaction = ')
        // console.log(editedTransaction)

        if ( newCategory.transactionType == actualCategory.transactionType ) {
            newWalletBalance = newCategory.transactionType == 'D' ? Number(wallet.actualBalance) + Number(transaction.value) - Number(editedTransaction.value) : Number(wallet.actualBalance) - Number(transaction.value) + Number(editedTransaction.value)
        }
        else {
            newWalletBalance = newCategory.transactionType == 'D' ? Number(wallet.actualBalance) - Number(transaction.value) - Number(editedTransaction.value) : Number(wallet.actualBalance) + Number(transaction.value) + Number(editedTransaction.value)
        }
    
        Object.assign(transaction, editedTransaction);
        // console.log('transaction = ')
        // console.log(transaction)
        
        await transaction.save();
        wallet.actualBalance = newWalletBalance
        await tabWallets.editWallet( wallet )

        return 'Transação alterada com sucesso!'

    }
    catch ( e ) {
        throw `Erro interno >> ${ e }`
    }

}

async function deleteTransaction( id ) {
    
    try {
        let transaction = await getTransactionById( id );
        let wallet = await tabWallets.getWalletById( transaction.walletId )

        if ( !transaction ) {
            return {
                error: true,
                message: `Transação não encontrada!`
            }
        }

        if ( transaction.creditValue > 0 ) {
            wallet.actualBalance -= transaction.creditValue

            await tabWallets.editWallet( wallet )
        }
        else {
            wallet.actualBalance += transaction.debitValue

            await tabWallets.editWallet( wallet )
        }

        await transaction.destroy();
        return `Transação excluída com sucesso!`
    }
    catch ( e ) {
        throw `Erro ao excluir transação >> "${ e }"`
    }

}

function generateListGroupedByDate( transactionsList ) {

    const groupedTransactions = {}

    transactionsList.forEach( transaction => {

        let monthGroup = `${ extras.getFullDateName_PtBr( transaction.date ).monthName }-${ extras.getFullDateName_PtBr( transaction.date ).yearNumber }`
        let dateGroup = new Date( transaction.date ).toISOString().split('T')[0]

        if ( !groupedTransactions[ monthGroup ] ) {
            groupedTransactions[ monthGroup ] = {}
        }
        
        if ( !groupedTransactions[ monthGroup ][ dateGroup ] ) {
            groupedTransactions[monthGroup][ dateGroup ] = []
        }

        groupedTransactions[ monthGroup ][ dateGroup ].push( transaction )
    })

    return groupedTransactions    

}

function generateListGroupedByCategory( transactionsList, groupByTransactionTypes ) {

    let groupedTransactions = {}

    transactionsList.forEach( transaction => {

        if ( !groupedTransactions[ transaction.fromCategory.name ] ) {
            groupedTransactions[ transaction.fromCategory.name ] = {
                type: transaction.fromCategory.transactionType,
                transactions: []
            }
        }

        groupedTransactions[ transaction.fromCategory.name ].transactions.push( transaction )

    })

    if ( groupByTransactionTypes ) {
        groupedTransactions = groupByType( groupedTransactions )
    }

    // console.log( JSON.stringify( groupedTransactions, '', 4) )
    return groupedTransactions


    function groupByType( groups ) {

        let typeGroups = {}
        let categories = Object.keys( groups )

        for ( let i = 0; i < categories.length; i++) {

            let type = groups[ categories[i] ].type
            
            if ( !typeGroups[ type ] ) {
                typeGroups[ type ] = {}
            }

            if ( !typeGroups[ type ][ categories[i] ] ) {
                typeGroups[ type ][ categories[i] ] = {}
            }

            typeGroups[ type ][ categories[i] ] = groups[ categories[i] ]

        }

        return typeGroups

    }

}

async function getGainsAndExpensesByWeek( transactions, start, end ) {

    if ( !start || !end ) {
        return `Parâmetros não enviados na query string:\n'start': Deverá ser informada a data inicial para consulta\n'end': Deverá ser informada a data final para consulta`
    }
    
    let startDate = extras.parseDate(start)
    let endDate = extras.parseDate(end)
    let weeks = {}
    
    weeks = extras.getWeeks( startDate, endDate)
    
    for ( let i = 1; i <= weeks.weeksCount; i++ ) {

        weeks.weeksList[i].totalGains = 0
        weeks.weeksList[i].totalExpenses = 0
        // console.log(`Inicial - ${ weeks.weeksList[i].firstDay }, Final - ${ weeks.weeksList[i].lastDay }`)

        transactions.forEach( transaction => {

            if ( transaction.date >= new Date(weeks.weeksList[i].firstDay) && transaction.date <= new Date(weeks.weeksList[i].lastDay) ) {
                // console.log(`Data Transação - ${transaction.date}`)
                weeks.weeksList[i].totalGains += transaction.creditValue > 0 ? transaction.value : 0
                weeks.weeksList[i].totalExpenses += transaction.debitValue > 0 ? transaction.value : 0
            }

        })

    }

    return weeks

}

async function generateTransactionsReport( userId, walletId, startDate, endDate ) {
    let userWallets = await tabWallets.getWalletsFromUser( userId )
    let userCategories = await tabCategories.getCategoriesFromUser( userId )
    let userTransactions = await getTransactionsByText({
        userId: userId,
        walletId: walletId,
        startDate: startDate,
        endDate: endDate
    })

    let result = {
        gainsAndExpensesByWeek: await getGainsAndExpensesByWeek( userTransactions, startDate, endDate ),
        transactionsGroupedByCategory: generateListGroupedByCategory( userTransactions, true ),
        walletDetails: userWallets.find( (wallet) => { return Number(wallet.id) == Number(walletId) } ),
        totalWalletsCount: userWallets.length,
        totalCategoriesCount: userCategories.length 
    }

    return result
}