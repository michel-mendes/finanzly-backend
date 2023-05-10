import { body, Meta} from "express-validator";

export { csvImportValidation }

const csvImportValidation = () => {
    return [
        body("bank").notEmpty().withMessage("Bank name must be sent"),
        body("csvFile").custom((value, {req}: Meta) => {
            
            const missingCsvFile = !req.files;

            if (missingCsvFile) {
                return Promise.reject("Csv file must be sent")
            } else {
                return Promise.resolve(value)
            }
        })
    ]
}