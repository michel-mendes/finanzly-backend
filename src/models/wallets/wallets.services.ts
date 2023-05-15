import { ObjectId } from "mongoose";
import { GenericModelCRUD } from "../../classes/MongooseModelCRUD";
import { AppError } from "../../middleware/error-handler";
import { IWallet, Wallet } from "./wallet";
import { Transaction } from "../transactions/transaction";
import { User } from "../users/user";

export const walletService = {
    createWallet,
    getWallets,
    getWalletById,
    editWallet,
    deleteWallet,
    calculateWalletBalance
}

const userCrud = new GenericModelCRUD(User)
const walletsCrud = new GenericModelCRUD(Wallet)
const transactionsCrud = new GenericModelCRUD(Transaction)

async function createWallet(walletData: IWallet): Promise<IWallet> {
    const duplicateWalletName = await verifyDuplicateWalletName(walletData.walletName, walletData.fromUser)

    if (duplicateWalletName) throw new AppError("Wallet with duplicate name", 409)

    return await walletsCrud.insertDocument(walletData)
}

async function getWallets(filter: { fromUser: string } | {} = {}): Promise<Array<IWallet>> {
    return await walletsCrud.findDocuments(filter)
}

async function getWalletById(walletId: string): Promise<IWallet> {
    return await walletsCrud.findDocumentById(walletId)
}

async function editWallet(walletId: string, newWalletData: IWallet): Promise<IWallet> {
    const duplicateWalletName = await verifyDuplicateWalletName(newWalletData.walletName, newWalletData.fromUser)

    if (duplicateWalletName) throw new AppError("Wallet with duplicate name", 409)

    return await walletsCrud.editDocument(walletId, newWalletData)
}

async function deleteWallet(walletId: string): Promise<IWallet> {
    const wallet = await walletsCrud.findDocumentById(walletId)
    const user = await userCrud.findOneDocument({ fromUser: wallet.fromUser })

    if (user!.activeWallet == wallet.id) {
        user!.activeWallet = undefined
    }

    await wallet.delete()

    return wallet
}

async function calculateWalletBalance(walletId: string): Promise<number> {
    const [wallet, transactions] = await Promise.all(
        [
            walletsCrud.findDocumentById(walletId),
            transactionsCrud.findDocuments({ fromWallet: walletId })
        ]
    )

    let walletBalance = wallet.initialBalance

    transactions.forEach(transaction => {
        (transaction.creditValue) ? walletBalance += transaction.creditValue : walletBalance -= transaction.debitValue
    })

    wallet.actualBalance = walletBalance
    await wallet.save()

    return walletBalance
}


// Helper functions
async function verifyDuplicateWalletName(walletName: string, userId: ObjectId): Promise<boolean> {
    const walletWithSameName = await walletsCrud.findOneDocument({ walletName, fromUser: userId })

    return walletWithSameName ? true : false
}