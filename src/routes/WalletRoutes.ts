import { Router } from "express"

// Validations
import { validateData } from "../middleware/validation-handler"
import { walletCreateValidation, walletEditValidation } from "../middleware/wallet-validator"

// Wallet controller
import { walletController } from "../controllers/WalletController"

// Authentication midware
import { authGuard } from "../middleware/auth-guard"

// Wallets related routes
const walletRouter = Router()

walletRouter.post("/calculate-balance", authGuard, walletController.recalculateWalletBalance)
walletRouter.get("/from-user", authGuard, walletController.getWalletsFromLoggedUser)
walletRouter.post("/", authGuard, walletCreateValidation(), validateData, walletController.createNewWallet)
walletRouter.get("/", authGuard, walletController.listAllWallets)
walletRouter.get("/:id", authGuard, walletController.listWalletById)
walletRouter.put("/:id", authGuard, walletEditValidation(), validateData, walletController.editWallet)
walletRouter.delete("/:id", authGuard, walletController.deleteWallet)

export { walletRouter }