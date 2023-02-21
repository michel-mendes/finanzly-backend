import { Request, Response, NextFunction, Router } from "express"
import Logger from "../../../config/logger"

// Validations
import { validateData } from "../../middleware/validation-handler"
import { walletCreateValidation, walletEditValidation } from "../../middleware/wallet-validator"

// Wallet service
import { walletService } from "./wallets.services"

import { userAuthorize } from "../../middleware/user-authorize"

// Wallets related routes
const walletRouter = Router()

walletRouter.post("/", walletCreateValidation(), validateData, newWallet)
walletRouter.get("/", listWallets)
walletRouter.get("/:id", listWalletById)
walletRouter.put("/:id", walletEditValidation(), validateData, editWallet)
walletRouter.delete("/:id", deleteWallet)

export default walletRouter

// Controller functions
//-----------------------------------------------------------------------------------
async function newWallet(req: Request, res: Response, next: NextFunction) {
    try {
        const walletData = req.body
        const newWallet = await walletService.createWallet( walletData )
        
        res.status(200).json( newWallet )
    } catch (error: any) {
        Logger.error(`Error while creating a new Wallet: ${ error.message }`)
        return next( error )
    }
}

async function listWallets(req: Request, res: Response, next: NextFunction) {
    try {
        const walletsList = await walletService.getWallets()

        res.status(200).json( walletsList )
    } catch (error: any) {
        Logger.error(`Error while getting all Wallets list: ${ error.message }`)
        return next( error )
    }
}

async function listWalletById(req: Request, res: Response, next: NextFunction) {
    try {
        const walletId = req.params.id
        const wallet = await walletService.getWalletById( walletId )

        res.status(200).json( wallet )
    } catch (error: any) {
        Logger.error(`Error while getting Wallet by ID: ${ error.message }`)
        return next( error )
    }
}

async function editWallet(req: Request, res: Response, next: NextFunction) {
    try {
        const newWalletData = req.body
        const walletId = req.params.id
        const editedWallet = await walletService.editWallet( walletId, newWalletData )

        res.status(200).json( editedWallet )
    } catch (error: any) {
        Logger.error(`Error while editing Wallet: ${ error.message }`)
        return next( error )
    }
}

async function deleteWallet(req: Request, res: Response, next: NextFunction) {
    try {
        const walletId = req.params.id
        const removedWallet = await walletService.deleteWallet( walletId )

        res.status(200).json( removedWallet )
    } catch (error: any) {
        Logger.error(`Error while removing Wallet: ${ error.message }`)
        return next( error )
    }
}