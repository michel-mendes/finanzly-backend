import { Response, NextFunction } from "express";
import { AppError } from "../middleware/error-handler";
import Logger from "../../config/logger";

// Authenticated request interface
import { IAuthRequest } from "../types/auth-request";

// Models
import { Wallet } from "../models/wallet";
import { Transaction } from "../models/transaction";
import { User } from "../models/user";

// Mongoose Collection manipulator
import { GenericModelCRUD } from "../classes/MongooseModelCRUD";

// Instanciate the collection manipulators
const usersCrud = new GenericModelCRUD( User )
const walletsCrud = new GenericModelCRUD( Wallet )
const transactionsCrud = new GenericModelCRUD( Transaction )

export const walletController = {
    createNewWallet,
    listAllWallets,
    listWalletById,
    getWalletsFromLoggedUser,
    editWallet,
    deleteWallet,
    recalculateWalletBalance
}


// Controller functions
//-----------------------------------------------------------------------------------
async function createNewWallet(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const walletData = req.body
        const nameAlreadyExists = await verifyDuplicateWalletName(walletData.walletName, walletData.fromUser)

        if (nameAlreadyExists) throw new AppError("Wallet with duplicate name", 409)

        const createdWallet = await walletsCrud.insertDocument(walletData)

        res.status(200).json(createdWallet)
    } catch (error: any) {
        Logger.error(`Error while creating a new Wallet: ${error.message}`)
        return next(error)
    }
}

async function listAllWallets(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const userRole = req.user!.role
        
        // Only admins can get all wallets of database, if necessary
        if (userRole !== "Admin") return new AppError("User not allowed", 400)
        
        const walletsList = await walletsCrud.findDocuments()

        res.status(200).json( walletsList )
    } catch (error: any) {
        Logger.error(`Error while getting all Wallets list: ${ error.message }`)
        return next( error )
    }
}

async function getWalletsFromLoggedUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const fromUser = req.user!.id
        const wallets = await walletsCrud.findDocuments({fromUser})

        res.status(200).json( wallets )
    } catch (error: any) {
        Logger.error(`Error while getting user's wallets: ${ error.message }`)
        return next( error )
    }
}

async function listWalletById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const walletId = req.params.id
        const wallet = await walletsCrud.findDocumentById(walletId)

        res.status(200).json( wallet )
    } catch (error: any) {
        Logger.error(`Error while getting Wallet by ID: ${ error.message }`)
        return next( error )
    }
}

async function editWallet(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const newWalletData = req.body
        const walletId = req.params.id
        const nameAlreadyExists = await verifyDuplicateWalletName(newWalletData.walletName, newWalletData.fromUser)

        if (nameAlreadyExists) throw new AppError("Wallet with duplicate name", 409)

        const updatedWallet = await walletsCrud.editDocument(walletId, newWalletData)

        res.status(200).json(updatedWallet)
    } catch (error: any) {
        Logger.error(`Error while editing Wallet: ${error.message}`)
        return next(error)
    }
}

async function deleteWallet(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const walletId = req.params.id
        const userId = req.user!.id

        const walletToDelete = await walletsCrud.findDocumentById(walletId)
        const user = await usersCrud.findDocumentById(userId.toString())

        await walletToDelete.delete()

        if (user.activeWallet == walletId) {
            user.activeWallet = null
        }

        res.status(200).json(walletToDelete)
    } catch (error: any) {
        Logger.error(`Error while removing Wallet: ${error.message}`)
        return next(error)
    }
}

async function recalculateWalletBalance(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const { walletId } = req.body
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
    
        res.status(200).json( walletBalance )
    } catch (error: any) {
        Logger.error(`Error while calculating wallet balance: ${ error.message }`)
        return next( error )
    }
}


// Helper functions
async function verifyDuplicateWalletName(walletName: string, userId: string): Promise<boolean> {
    const walletWithSameName = await walletsCrud.findOneDocument({ walletName, fromUser: userId })

    return walletWithSameName ? true : false
}