import { Router } from "express"

// Validations
import { validateData } from "../middleware/validation-handler"
import { categoryCreateValidation, categoryEditValidation } from "../middleware/category-validator"

// Controller
import { categoryController } from "../controllers/CategoryController"

// Authentication guardian
import { authGuard } from "../middleware/auth-guard"

// Categories related routes
const categoryRouter = Router()

categoryRouter.get("/from-user/", authGuard, categoryController.listUserCategories)
categoryRouter.post("/", categoryCreateValidation(), validateData, categoryController.createNewCategory)
categoryRouter.get("/", categoryController.listAllCategories)
categoryRouter.get("/:id", categoryController.listCategoryById)
categoryRouter.put("/:id", categoryEditValidation(), validateData, categoryController.editCategory)
categoryRouter.delete("/:id", categoryController.deleteCategory)

export { categoryRouter }