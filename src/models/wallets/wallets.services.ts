import { ObjectId } from "mongoose";
import { AppError } from "../../middleware/error-handler";
import { IWallet, Wallet } from "./wallet";

export const walletService = {
    createWallet,
    getWallets,
    getWalletById,
    editWallet,
    deleteWallet
}

async function createWallet( walletData: IWallet ): Promise< IWallet > {
    const duplicateWalletName = await verifyDuplicateWalletName( walletData.walletName, walletData.fromUser ) 
    let newWallet, populatedWallet

    if ( duplicateWalletName ) throw new AppError("Wallet with duplicate name", 409)

    newWallet = new Wallet( walletData )
    newWallet.actualBalance = newWallet.initialBalance
    await newWallet.save()

    populatedWallet = await Wallet.findById( newWallet.id ).populate( "fromUser" )

    return populatedWallet!
}

async function getWallets(): Promise< Array<IWallet> > {
    return await Wallet.find().populate('fromUser')
}

async function getWalletById( walletId: string ): Promise< IWallet | [] > {
    let wallet: IWallet | null | [] = await Wallet.findById( walletId ).populate('fromUser')

    if ( !wallet ) { wallet = [] }
    
    return wallet
}

async function editWallet( walletId: string, newWalletData: IWallet ): Promise< IWallet > {
    const wallet = await Wallet.findById( walletId ).populate('fromUser')
    
    if ( !wallet ) throw new AppError("Wallet not found", 404)
    if ( await verifyDuplicateWalletName( newWalletData.walletName, wallet.fromUser ) ) throw new AppError( "Wallet with duplicate name", 409 )

    Object.assign( wallet, newWalletData )
    wallet.save()

    // return the updated wallet
    return wallet
}

async function deleteWallet( walletId: string ): Promise< IWallet > {
    const wallet = await Wallet.findById( walletId ).populate('fromUser')

    if ( !wallet ) throw new AppError("Wallet not found", 404)

    await wallet.remove()

    // return the deleted wallet
    return wallet
}


// Helper functions
async function verifyDuplicateWalletName( walletName: string, userId: ObjectId ): Promise< boolean > {
    const walletWithSameName = await Wallet.findOne({
        walletName: walletName,
        fromUser: userId
    })

    return walletWithSameName ? true : false
}