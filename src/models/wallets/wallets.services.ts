import { ObjectId } from "mongoose";
import { GenericModelCRUD } from "../../classes/MongooseModelCRUD";
import { AppError } from "../../middleware/error-handler";
import { IWallet, Wallet } from "./wallet";

export const walletService = {
    createWallet,
    getWallets,
    getWalletById,
    editWallet,
    deleteWallet
}

const crud = new GenericModelCRUD( Wallet )

async function createWallet( walletData: IWallet ): Promise< IWallet > {
    const duplicateWalletName = await verifyDuplicateWalletName( walletData.walletName, walletData.fromUser ) 

    if ( duplicateWalletName ) throw new AppError("Wallet with duplicate name", 409)

    return await crud.insertDocument( walletData, "fromUser" )
}

async function getWallets(): Promise< Array<IWallet> > {
    return await crud.findDocuments({}, "fromUser")
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


// Helper functions
async function verifyDuplicateWalletName( walletName: string, userId: ObjectId ): Promise< boolean > {
    const walletWithSameName = await crud.findOneDocument( {walletName, fromUser: userId })

    return walletWithSameName ? true : false
}