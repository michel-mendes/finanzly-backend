import { Router } from "express"

// Validations
import { validateData } from "../middleware/validation-handler"
import { newTransactionValidation, editTransactionValidation } from "../middleware/transaction-validator"

// Route authenticator
import { authGuard } from "../middleware/auth-guard"

// Transaction controller
import { transactionController } from "../controllers/TransactionController"

// Transactions related routes
const transactionRouter = Router()

/*

Parameters and query strings for "/from-wallet/:id" route
- Mandatory parameter    = ":id"
- Optional query strings = [startDate, endDate]

*/
transactionRouter.get("/from-wallet/:id", authGuard, transactionController.getTransactionsFromWallet)

// The same as above, however, it returns transactions with the category of each one
transactionRouter.get("/from-wallet/:id/with-category", authGuard, transactionController.getTransactionsWithCategoryFromWallet)

transactionRouter.post("/", newTransactionValidation(), validateData, transactionController.createNewTransaction )
transactionRouter.get("/", transactionController.listAllTransactions)
transactionRouter.get("/:id", transactionController.getTransactionById)
transactionRouter.put("/:id", editTransactionValidation(), validateData, transactionController.editTransaction )
transactionRouter.delete("/:id", transactionController.deleteTransaction)

export { transactionRouter }