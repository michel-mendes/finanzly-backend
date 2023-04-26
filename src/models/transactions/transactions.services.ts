import { ITransaction, Transaction } from "./transaction";
import { ICategory } from "../categories/category";
import { GenericModelCRUD } from "../../classes/MongooseModelCRUD";

import { categoryService } from "../categories/categories.services";
import { walletService } from "../wallets/wallets.services";

export const transactionService = {
    createTransaction,
    getTransactions,
    getTransactionsFromWallet,
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
    data.description_Upper = data.description.toUpperCase()

    wallet.actualBalance = Number(wallet.actualBalance) + Number(data.creditValue) - Number(data.debitValue)

    const newTransaction = await crud.insertDocument( data )
    await wallet.save()

    return newTransaction
}

async function getTransactions(): Promise< ITransaction[] > {
    return await crud.findDocuments()
}

async function getTransactionsFromWallet(walletId: string): Promise<ITransaction[]> {
    return await crud.findDocuments({fromWallet: walletId})
}

async function getTransactionById( id: string ): Promise< ITransaction > {
    return await crud.findDocumentById( id )
}

async function editTransaction( id: string, data: ITransaction ): Promise< ITransaction > {
    const actualTransaction = await crud.findDocumentById( id, "fromCategory" )
    const actualTransactionCategory = <ICategory>( actualTransaction.fromCategory as any )
    const actualTransactionWallet = await walletService.getWalletById( actualTransaction.fromWallet )
    
    const newTransactionCategory = (!data.fromCategory) ? actualTransactionCategory : await categoryService.getCategoryById( data.fromCategory )

    data.debitValue = newTransactionCategory.transactionType == "D" ? data.value : 0
    data.creditValue = newTransactionCategory.transactionType == "C" ? data.value : 0;
    (!data.description) ? null : data.description_Upper = data.description.toUpperCase();
    (!data.extraInfo) ? null : data.extraInfo_Upper = data.extraInfo.toUpperCase()

    // Updates the 'actualBalance' of the wallet in which this transaction is registered
    if ( newTransactionCategory.transactionType == actualTransactionCategory.transactionType ) {
        
        actualTransactionWallet.actualBalance = newTransactionCategory.transactionType == "D" ?
                               (Number(actualTransactionWallet.actualBalance) + Number(actualTransaction.value)) - Number(data.value) :
                               (Number(actualTransactionWallet.actualBalance) - Number(actualTransaction.value)) + Number(data.value)

    } else {

        actualTransactionWallet.actualBalance = newTransactionCategory.transactionType == "D" ?
                               (Number(actualTransactionWallet.actualBalance) - Number(actualTransaction.value)) - Number(data.value) :
                               (Number(actualTransactionWallet.actualBalance) + Number(actualTransaction.value)) + Number(data.value)

    }

    const updatedTransaction = await crud.editDocument( id, data )
        
    if ( actualTransactionWallet.isModified() ) {
        await actualTransactionWallet.save()
    }

    return updatedTransaction
}

async function deleteTransaction( id: string ): Promise< ITransaction > {
    const deletedTransaction = await crud.deleteDocument(id)
    const transactionWallet = await walletService.getWalletById(deletedTransaction.fromWallet);

    transactionWallet.actualBalance = Number(transactionWallet.actualBalance) - Number(deletedTransaction.creditValue) + Number(deletedTransaction.debitValue)
    await transactionWallet.save()

    return deletedTransaction
}