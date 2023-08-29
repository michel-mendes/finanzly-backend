import { Router } from "express"

// Validations


// Controller
import { reportController } from "../controllers/ReportController"

// Authentication guardian
import { authGuard } from "../middleware/auth-guard"

// Categories related routes
const reportRouter = Router()

reportRouter.get("/", authGuard, reportController.getReport)

export { reportRouter }