import { Router } from "express"
import { userRouter } from "./UserRouter"
import { walletRouter } from "./WalletRouter"
import { categoryRouter } from "./CategoryRouter"
import { transactionRouter } from "./TransactionRouter"
import { uploadRouter } from "./UploadRouter"
import { reportRouter } from "./ReportRouter"

const router = Router()

// Routes inside /api route
router.use("/users", userRouter)
router.use("/wallets", walletRouter)
router.use("/categories", categoryRouter)
router.use("/transactions", transactionRouter)
router.use("/upload", uploadRouter)
router.use("/report", reportRouter)

export default router