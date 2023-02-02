import { Router, Request, Response } from "express"
import userController from "./models/users/user.controller"
import walletController from "./models/wallets/wallets.controller"

const router = Router()

// Routes inside /api route
router.use("/user", userController)
router.use("/wallet", walletController)

export default router