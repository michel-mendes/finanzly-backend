import { body } from "express-validator"

export {
    newTransactionValidation,
    editTransactionValidation
}

const newTransactionValidation = () => {
   
    return [
        body('id').isEmpty().withMessage("ID must not be sent"),
        body('_id').isEmpty().withMessage("ID must not be sent"),
        body('fromCategory').notEmpty().withMessage("Missing transaction category"),
        body('fromWallet').notEmpty().withMessage("Missing transaction wallet"),
        body('fromUser').notEmpty().withMessage("Missing transaction user"),
        body('date').notEmpty().withMessage("Missing date").isISO8601().withMessage("Transaction date must be a valid ISO 8601 date string"),
        body('description').notEmpty().withMessage("Missing transaction description"),
        body('extraInfo').optional(),
        body('value').notEmpty().withMessage("Missing transaction value").isDecimal().withMessage("Transaction value must be a valid number").toFloat(),
        body('creditValue').isEmpty().withMessage("Credit value must not be sent"),
        body('debitValue').isEmpty().withMessage("Debit value must not be sent"),
        // body('csvImportId').isEmpty().withMessage("CSV import ID must not be sent")
    ]

}

const editTransactionValidation = () => {

    return [
        body('id').isEmpty().withMessage("Not changeable property"),
        body('_id').isEmpty().withMessage("Not changeable property"),
        body('fromCategory').optional().notEmpty().withMessage("Can't be empty"),
        body('fromWallet').isEmpty().withMessage("Transaction's wallet cannot be changed"),
        body('fromUser').isEmpty().withMessage("Transaction's owner cannot be changed"),
        body('date').optional().isISO8601().withMessage("'date' must be a valid ISO 8601 date string"),
        body('description').optional().notEmpty().withMessage("Can't be empty"),
        body('extraInfo').optional(),
        body('value').optional().isNumeric().withMessage("Must be a number").toFloat(),
        body('creditValue').isEmpty().withMessage("Not changeable property"),
        body('debitValue').isEmpty().withMessage("Not changeable property"),
        // body('csvImportId').isEmpty().withMessage("Must not be sent")
    ]

}