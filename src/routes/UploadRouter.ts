import { Router } from "express";

import { csvImportValidation } from "../middleware/UploadValidator";
import { validateData } from "../middleware/validation-handler";
import { uploadController } from "../controllers/UploadController";

const uploadRouter = Router()

uploadRouter.post("/", csvImportValidation(), validateData, uploadController.uploadCsv)

export { uploadRouter }