import { Router } from "express"
import { userRouter } from "./UserRouter"
import { walletRouter } from "./WalletRouter"
import { categoryRouter } from "./CategoryRouter"
import { transactionRouter } from "./TransactionRouter"
import { uploadRouter } from "./UploadRouter"

const router = Router()

// Routes inside /api route
router.use("/users", userRouter)
router.use("/wallets", walletRouter)
router.use("/categories", categoryRouter)
router.use("/transactions", transactionRouter)
router.use("/upload", uploadRouter)

export default router