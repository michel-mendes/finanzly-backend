import { ObjectId } from "mongoose";
import { GenericModelCRUD } from "../../classes/MongooseModelCRUD";
import { AppError } from "../../middleware/error-handler";
import { IWallet, Wallet } from "./wallet";
import { ITransaction, Transaction } from "../transactions/transaction";

export const walletService = {
    createWallet,
    getWallets,
    getWalletById,
    editWallet,
    deleteWallet,
    calculateWalletBalance
}

const crud = new GenericModelCRUD( Wallet )
const transactionsCrud = new GenericModelCRUD( Transaction )

async function createWallet( walletData: IWallet ): Promise< IWallet > {
    const duplicateWalletName = await verifyDuplicateWalletName( walletData.walletName, walletData.fromUser ) 

    if ( duplicateWalletName ) throw new AppError("Wallet with duplicate name", 409)

    return await crud.insertDocument( walletData, "fromUser" )
}

async function getWallets(filter: {fromUser: string} | {} = {}): Promise< Array<IWallet> > {
    return await crud.findDocuments(filter)
}

async function getWalletById( walletId: string ): Promise< IWallet > {
    return await crud.findDocumentById( walletId, "fromUser" )
}

async function editWallet( walletId: string, newWalletData: IWallet ): Promise< IWallet > {
    const duplicateWalletName = await verifyDuplicateWalletName( newWalletData.walletName, newWalletData.fromUser ) 

    if ( duplicateWalletName ) throw new AppError("Wallet with duplicate name", 409)

    return await crud.editDocument( walletId, newWalletData )
}

async function deleteWallet( walletId: string ): Promise< IWallet > {
    return await crud.deleteDocument( walletId )
}

async function calculateWalletBalance( walletId: string ): Promise<number> {
    const [wallet, transactions] = await Promise.all(
        [
            crud.findDocumentById(walletId),
            transactionsCrud.findDocuments({fromWallet: walletId})
        ]
    )

    let walletBalance = wallet.initialBalance

    transactions.forEach( transaction => {
        (transaction.creditValue) ? walletBalance += transaction.creditValue : walletBalance -= transaction.debitValue
    } )

    wallet.actualBalance = walletBalance
    await wallet.save()

    return walletBalance
}


// Helper functions
async function verifyDuplicateWalletName( walletName: string, userId: ObjectId ): Promise< boolean > {
    const walletWithSameName = await crud.findOneDocument( {walletName, fromUser: userId })

    return walletWithSameName ? true : false
}