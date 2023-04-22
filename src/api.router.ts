import { Router, Request, Response } from "express"
import userController from "./models/users/user.controller"
import walletController from "./models/wallets/wallets.controller"
import categoryRouter from "./models/categories/categories.controller"
import transactionRouter from "./models/transactions/transactions.controller"

const router = Router()

// Routes inside /api route
router.use("/users", userController)
router.use("/wallets", walletController)
router.use("/categories", categoryRouter)
router.use("/transactions", transactionRouter)

export default router