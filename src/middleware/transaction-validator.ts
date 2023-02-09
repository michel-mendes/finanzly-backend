import { body } from "express-validator"

export {
    newTransactionValidation,
    editTransactionValidation
}

const newTransactionValidation = () => {
   
    return [
        body('id').isEmpty().withMessage("Must not be sent"),
        body('_id').isEmpty().withMessage("Must not be sent"),
        body('fromCategory').notEmpty().withMessage("Can't be empty"),
        body('fromWallet').notEmpty().withMessage("Can't be empty"),
        body('fromUser').notEmpty().withMessage("Can't be empty"),
        body('date').notEmpty().withMessage("Can't be empty").isISO8601().withMessage("Must be a valid ISO 8601 date string"),
        body('description').notEmpty().withMessage("Can't be empty"),
        body('extraInfo').optional(),
        body('value').notEmpty().withMessage("Can't be empty").isNumeric().withMessage("Must be a valid number"),
        body('creditValue').isEmpty().withMessage("Must not be sent"),
        body('debitValue').isEmpty().withMessage("Must not be sent"),
        body('csvImportId').isEmpty().withMessage("Must not be sent")
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
        body('value').optional().isNumeric().withMessage("Must be a number"),
        body('creditValue').isEmpty().withMessage("Not changeable property"),
        body('debitValue').isEmpty().withMessage("Not changeable property"),
        body('csvImportId').isEmpty().withMessage("Must not be sent")
    ]

}