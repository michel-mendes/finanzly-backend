import { ITransaction, Transaction } from "./transaction";
import { ICategory } from "../categories/category";
import { GenericModelCRUD } from "../../classes/MongooseModelCRUD";

import { categoryService } from "../categories/categories.services";
import { walletService } from "../wallets/wallets.services";

export const transactionService = {
    createTransaction,
    getTransactions,
    getTransactionById,
    editTransaction,
    deleteTransaction
}

const crud = new GenericModelCRUD( Transaction )

async function createTransaction( data: ITransaction ): Promise< ITransaction > {
    const category = await categoryService.getCategoryById( data.fromCategory )
    const wallet = await walletService.getWalletById( data.fromWallet )

    data.creditValue = category.transactionType == "C" ? data.value : 0
    data.debitValue = category.transactionType == "D" ? data.value : 0

    category.transactionType == "C" ? (wallet.actualBalance += data.value) : (wallet.actualBalance -= data.value)

    const newTransaction = await crud.insertDocument( data )
    await wallet.save()

    return newTransaction
}

async function getTransactions(): Promise< ITransaction[] > {
    return await crud.findDocuments()
}

async function getTransactionById( id: string ): Promise< ITransaction > {
    return await crud.findDocumentById( id )
}

async function editTransaction( id: string, data: ITransaction ): Promise< ITransaction > {
    const actualTransaction = await crud.findDocumentById( id, "fromCategory" )
    const actualTransactionCategory = <ICategory>( actualTransaction.fromCategory as any )
    const actualTransactionWallet = await walletService.getWalletById( actualTransaction.fromWallet )
    
    const newTransactionCategory = data.fromCategory == undefined ? actualTransactionCategory : await categoryService.getCategoryById( data.fromCategory )

    data.debitValue = newTransactionCategory.transactionType == "D" ? data.value : 0
    data.creditValue = newTransactionCategory.transactionType == "C" ? data.value : 0

    // Updates the 'actualBalance' of the wallet in which this transaction is registered
    if ( newTransactionCategory.transactionType == actualTransactionCategory.transactionType ) {
        
        actualTransactionWallet.actualBalance = newTransactionCategory.transactionType == "D" ?
                               (actualTransactionWallet.actualBalance + actualTransaction.value) - data.value :
                               (actualTransactionWallet.actualBalance - actualTransaction.value) + data.value

    } else {

        actualTransactionWallet.actualBalance = newTransactionCategory.transactionType == "D" ?
                               (actualTransactionWallet.actualBalance - actualTransaction.value) - data.value :
                               (actualTransactionWallet.actualBalance + actualTransaction.value) + data.value

    }

    const updatedTransaction = await crud.editDocument( id, data )
        
    if ( actualTransactionWallet.isModified() ) {
        await actualTransactionWallet.save()
    }

    return updatedTransaction
}

async function deleteTransaction( id: string ): Promise< ITransaction > {
    return await crud.deleteDocument( id )
}