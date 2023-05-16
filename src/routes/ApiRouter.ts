import { Router, Request, Response } from "express"
import { userRouter } from "./UserRouter"
import { walletRouter } from "./WalletRouter"
import categoryRouter from "../models/categories/categories.controller"
import transactionRouter from "../models/transactions/transactions.controller"
import { uploadRouter } from "./UploadRouter"

const router = Router()

// Routes inside /api route
router.use("/users", userRouter)
router.use("/wallets", walletRouter)
router.use("/categories", categoryRouter)
router.use("/transactions", transactionRouter)
router.use("/upload", uploadRouter)

export default router