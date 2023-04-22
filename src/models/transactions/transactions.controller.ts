import { Request, Response, NextFunction, Router } from "express"
import Logger from "../../../config/logger"

// Validations
import { validateData } from "../../middleware/validation-handler"
import { newTransactionValidation, editTransactionValidation } from "../../middleware/transaction-validator"

// Category service
import { transactionService } from "./transactions.services"

import { IAuthRequest } from "../../types/auth-request"
import { authGuard } from "../../middleware/auth-guard"

// Transactions related routes
const transactionRouter = Router()

transactionRouter.get("/from-wallet/:id", authGuard, getWalletTransacions)
transactionRouter.post("/", newTransactionValidation(), validateData, newTransaction )
transactionRouter.get("/", getAll)
transactionRouter.get("/:id", getById)
transactionRouter.put("/:id", editTransactionValidation(), validateData, editTransaction )
transactionRouter.delete("/:id", )

export default transactionRouter

// Controller functions
//-----------------------------------------------------------------------------------
async function newTransaction(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body
        const newTransaction = await transactionService.createTransaction( data )

        return res.status(200).json( newTransaction )
    } catch (error: any) {
        Logger.error(`Error while creating a new Transaction: ${ error.message }`)
        return next( error )
    }
}

async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const transactions = await transactionService.getTransactions()
        
        return res.status(200).json( transactions )
    } catch (error: any) {
        Logger.error(`Error while listing Transactions: ${ error.message }`)
        return next( error )
    }
}

async function getWalletTransacions(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const walletId = req.params.id
        const transactions = await transactionService.getTransactionsFromWallet(walletId)

        return res.status(200).json( transactions )
    } catch (error: any) {
        Logger.error(`Error while getting user's transactions: ${ error.message }`)
        return next( error )
    }
}

async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const transactionId = req.params.id
        const transaction = await transactionService.getTransactionById( transactionId )

        return res.status(200).json( transaction )
    } catch (error: any) {
        Logger.error(`Error while getting Transaction by it's ID: ${ error.message }`)
        return next( error )
    }
}

async function editTransaction(req: Request, res: Response, next: NextFunction) {
    try {
        const transactionId = req.params.id
        const data = req.body

        const updatedTransaction = await transactionService.editTransaction( transactionId, data )

        return res.status(200).json( updatedTransaction )
    } catch (error: any) {
        Logger.error(`Error while editing Transaction: ${ error.message }`)
        return next( error )
    }
}