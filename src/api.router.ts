import { Router, Request, Response } from "express"
import userController from "./models/users/user.controller"
import categoryRouter from "./models/categories/categories.controller"
import transactionRouter from "./models/transactions/transactions.controller"
import { uploadRouter } from "./routes/UploadRouter"
import { walletRouter } from "./routes/WalletRoutes"

const router = Router()

// Routes inside /api route
router.use("/users", userController)
router.use("/wallets", walletRouter)
router.use("/categories", categoryRouter)
router.use("/transactions", transactionRouter)
router.use("/upload", uploadRouter)

export default router