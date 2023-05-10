import { body, Meta } from "express-validator";

export { csvImportValidation }

const csvImportValidation = () => {
    return [
        body("bank").notEmpty().withMessage("Bank name must be sent"),
        body("walletId").notEmpty().withMessage("Target wallet ID must be sent"),
        body("csvFile").custom((value, { req }: Meta) => {

            const missingCsvFile = !req.files.csvFile;

            if (missingCsvFile) { return Promise.reject("Csv file must be sent") }

            return Promise.resolve(value)
        })
    ]
}