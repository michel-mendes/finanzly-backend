import { Response, NextFunction } from "express"
import Logger from "../../config/logger"
import moment from "moment"

// Database manipulators
import { Wallet } from "../models/wallet"
import { Category, ICategory } from "../models/category"
import { Transaction, ITransaction } from "../models/transaction"
import { GenericModelCRUD } from "../classes/MongooseModelCRUD"

// Authenticated request
import { IAuthRequest } from "../types/auth-request"


// Controller exports
export const transactionController = {
    createNewTransaction,
    listAllTransactions,
    getTransactionsFromWallet,
    getTransactionsWithCategoryFromWallet,
    getTransactionById,
    editTransaction,
    deleteTransaction
}


// Declares data manipulation classes
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

        receivedData.date = new Date(receivedData.date).getTime()
        receivedData.creditValue = (category.transactionType == "C") ? receivedData.value : 0
        receivedData.debitValue = (category.transactionType == "D") ? receivedData.value : 0
        receivedData.description_Upper = receivedData.description.toUpperCase()
        receivedData.importedTransaction = (receivedData.csvImportId) ? true : false

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

        res.status(200).json(transactions)
    } catch (error: any) {
        Logger.error(`Error while listing Transactions: ${error.message}`)
        return next(error)
    }
}

async function getTransactionsFromWallet(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const seachTerms = _setUpSearchTerms(req)
        const transactions = await transactionsCrud.findDocuments(seachTerms)

        res.status(200).json(transactions)
    } catch (error: any) {
        Logger.error(`Error while getting wallet transactions: ${error.message}`)
        return next(error)
    }
}

async function getTransactionsWithCategoryFromWallet(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const seachTerms = _setUpSearchTerms(req)
        const transactions = await transactionsCrud.findDocuments(seachTerms, "fromCategory")

        res.status(200).json(transactions)
    } catch (error: any) {
        Logger.error(`Error while getting wallet transactions: ${error.message}`)
        return next(error)
    }
}

async function getTransactionById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const transactionId = req.params.id
        const transaction = await transactionsCrud.findDocumentById(transactionId)

        res.status(200).json(transaction)
    } catch (error: any) {
        Logger.error(`Error while getting transaction by ID: ${error.message}`)
        return next(error)
    }
}

async function editTransaction(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const transactionId = req.params.id
        const newTransactionData = req.body

        // Get current transaction & wallet data before update
        const oldTransaction = await transactionsCrud.findDocumentById(transactionId, "fromCategory")
        const oldCategory = <ICategory>(oldTransaction.fromCategory as any)
        const newCategory = (!newTransactionData.fromCategory) ? oldCategory : await categoriesCrud.findDocumentById(newTransactionData.fromCategory)
        const wallet = await walletsCrud.findDocumentById(oldTransaction.fromWallet)
        // **
        
                
        // Makes necessary edits to maintain data integrity
        newTransactionData.date = moment(newTransactionData.date)
        newTransactionData.debitValue = (newCategory.transactionType == "D") ? newTransactionData.value : 0
        newTransactionData.creditValue = (newCategory.transactionType == "C") ? newTransactionData.value : 0;
        (newTransactionData.description) && (newTransactionData.description_Upper = newTransactionData.description.toUpperCase());
        (newTransactionData.extraInfo) && (newTransactionData.extraInfo_Upper = newTransactionData.extraInfo.toUpperCase())
        // **
        
        
        // Updates the wallet balance considering the value impact if there is a change of category
        const balanceImpact = _calculateBalanceImpact(newTransactionData, oldTransaction, newCategory, oldCategory)
        wallet.actualBalance += balanceImpact
        
        if (wallet.isModified()) {
            await wallet.save()
        }
        // **
        
        
        // Send updates to database and return the updated transaction
        const updatedTransaction = await transactionsCrud.editDocument(transactionId, newTransactionData)

        res.status(200).json({ ...updatedTransaction.toJSON(), currentWalletBalance: wallet.actualBalance })
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
function _setUpSearchTerms(req: IAuthRequest) {
    // Get request parameters and query strings
    const fromWallet = req.params.id
    const startDate = (req.query.startDate) ? moment(String(req.query.startDate)) : ""
    const endDate = (req.query.endDate) ? moment(String(req.query.endDate)) : ""

    // Sets searchTerms object
    const searchTerms: any = {
        fromWallet,
        date: {
            $gte: startDate,
            $lte: endDate
        }
    };

    // Delete properties without data, preventing type errors or search malfunctions
    (String(startDate).length == 0) && delete searchTerms.date.$gte;
    (String(endDate).length == 0) && delete searchTerms.date.$lte;
    (String(startDate).length == 0 && String(endDate).length == 0) && delete searchTerms.date;

    return searchTerms
}

function _calculateBalanceImpact(transaction: ITransaction, oldTransaction: ITransaction, newCategory: ICategory, oldCategory: ICategory) {
    const categoryTypeHasChanged = newCategory.transactionType !== oldCategory.transactionType
    const oldValue = oldTransaction.value
    const newValue = transaction.value
    const isExpense = newCategory.transactionType === 'D'

    if (categoryTypeHasChanged) {
        return ((isExpense) ? oldValue * (-1) - newValue : oldValue + newValue)
    } else {
        return ((isExpense) ? oldValue - newValue : oldValue * (-1) + newValue)
    }
}