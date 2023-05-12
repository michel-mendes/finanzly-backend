import { Router } from "express";

import { csvImportValidation } from "../middleware/UploadValidator";
import { validateData } from "../middleware/validation-handler";
import { uploadController } from "../controllers/UploadController";

import { authGuard } from "../middleware/auth-guard";

const uploadRouter = Router()

uploadRouter.post("/", authGuard, csvImportValidation(), validateData, uploadController.uploadCsv)

export { uploadRouter }