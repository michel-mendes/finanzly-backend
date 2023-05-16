import { Response, NextFunction } from "express"
import Logger from "../../config/logger"

// Database manipulators
import { Wallet, IWallet } from "../models/wallet"
import { Category, ICategory } from "../models/category"
import { Transaction, ITransaction } from "../models/transaction"
import { GenericModelCRUD } from "../classes/MongooseModelCRUD"

// Authenticated request
import { IAuthRequest } from "../types/auth-request"

export const transactionController = {
    createNewTransaction,
    listAllTransactions,
    getTransactionsFromWallet,
    getTransactionById,
    editTransaction,
    deleteTransaction
}

const walletsCrud = new GenericModelCRUD(Wallet)
const categoriesCrud = new GenericModelCRUD(Category)
const transactionsCrud = new GenericModelCRUD(Transaction)

// Controller functions
//-----------------------------------------------------------------------------------
async function createNewTransaction(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const receivedData = <ITransaction>req.body

        const category = await categoriesCrud.findDocumentById(receivedData.fromCategory)
        const wallet = await walletsCrud.findDocumentById(receivedData.fromWallet)

        receivedData.creditValue = (category.transactionType == "C") ? receivedData.value : 0
        receivedData.debitValue = (category.transactionType == "D") ? receivedData.value : 0
        receivedData.description_Upper = receivedData.description.toUpperCase()

        wallet.actualBalance = wallet.actualBalance + receivedData.creditValue - receivedData.debitValue

        const createdTransaction = await transactionsCrud.insertDocument(receivedData)
        await wallet.save()

        res.status(200).json({ ...createdTransaction.toJSON(), currentWalletBalance: wallet.actualBalance })
    } catch (error: any) {
        Logger.error(`Error while creating a new Transaction: ${error.message}`)
        return next(error)
    }
}

async function listAllTransactions(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const transactions = await transactionsCrud.findDocuments()
        
        res.status(200).json( transactions )
    } catch (error: any) {
        Logger.error(`Error while listing Transactions: ${ error.message }`)
        return next( error )
    }
}

async function getTransactionsFromWallet(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const fromWallet = req.params.id
        const transactions = await transactionsCrud.findDocuments({fromWallet})

        res.status(200).json( transactions )
    } catch (error: any) {
        Logger.error(`Error while getting wallet transactions: ${ error.message }`)
        return next( error )
    }
}

async function getTransactionById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const transactionId = req.params.id
        const transaction = await transactionsCrud.findDocumentById(transactionId)

        res.status(200).json( transaction )
    } catch (error: any) {
        Logger.error(`Error while getting transaction by ID: ${ error.message }`)
        return next( error )
    }
}

async function editTransaction(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const transactionId = req.params.id
        const receivedData = req.body

        // 
        const prevTransaction = await transactionsCrud.findDocumentById(transactionId, "fromCategory")
        const prevTransactionCategory = <ICategory>(prevTransaction.fromCategory as any)
        const wallet = await walletsCrud.findDocumentById(prevTransaction.fromWallet)

        const newTransactionCategory = (!receivedData.fromCategory) ? prevTransactionCategory : await categoriesCrud.findDocumentById(receivedData.fromCategory)

        receivedData.debitValue = (newTransactionCategory.transactionType == "D") ? receivedData.value : 0
        receivedData.creditValue = (newTransactionCategory.transactionType == "C") ? receivedData.value : 0;
        (!receivedData.description) ? null : receivedData.description_Upper = receivedData.description.toUpperCase();
        (!receivedData.extraInfo) ? null : receivedData.extraInfo_Upper = receivedData.extraInfo.toUpperCase()

        const categoryTypeHasChanged = newTransactionCategory.transactionType !== prevTransactionCategory.transactionType
        
        _updateWalletBalance({wallet, prevTransaction, newTransaction: receivedData, newTransactionCategory, categoryTypeHasChanged})

        const updatedTransaction = await transactionsCrud.editDocument(transactionId, receivedData)

        if (wallet.isModified()) {
            await wallet.save()
        }

        res.status(200).json({...updatedTransaction.toJSON(), currentWalletBalance: wallet.actualBalance})
    } catch (error: any) {
        Logger.error(`Error while updating transaction: ${error.message}`)
        return next(error)
    }
}

async function deleteTransaction(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const transactionId = req.params.id

        const deletedTransaction = await transactionsCrud.deleteDocument(transactionId)
        const wallet = await walletsCrud.findDocumentById(deletedTransaction.fromWallet)

        // Updates wallet balance
        wallet.actualBalance = wallet.actualBalance - deletedTransaction.creditValue + deletedTransaction.debitValue
        await wallet.save()

        res.status(200).json({ ...deletedTransaction.toJSON(), currentWalletBalance: wallet.actualBalance })
    } catch (error: any) {
        Logger.error(`Error while deleting transaction: ${error.message}`)
        return next(error)
    }
}


// Helper functions
function _updateWalletBalance(data: {
    wallet: IWallet,
    prevTransaction: ITransaction,
    newTransaction: ITransaction,
    newTransactionCategory: ICategory,
    categoryTypeHasChanged: boolean
}) {

    const {wallet, prevTransaction, newTransaction, newTransactionCategory, categoryTypeHasChanged} = data

    // Updates the 'actualBalance' of the wallet in which this transaction is registered
    if (!categoryTypeHasChanged) {

        wallet.actualBalance = newTransactionCategory.transactionType == "D" ?
            (wallet.actualBalance + prevTransaction.value) - newTransaction.value :
            (wallet.actualBalance - prevTransaction.value) + newTransaction.value

    } else {

        wallet.actualBalance = newTransactionCategory.transactionType == "D" ?
            (wallet.actualBalance - prevTransaction.value) - newTransaction.value :
            (wallet.actualBalance + prevTransaction.value) + newTransaction.value

    }

}