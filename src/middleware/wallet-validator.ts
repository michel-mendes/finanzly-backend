import { body } from "express-validator"

export {
    walletCreateValidation,
    walletEditValidation
}

const walletCreateValidation = () => {
   
    return [
        body('fromUser').notEmpty().isString().withMessage('Missing user ID'),
        body('walletName').notEmpty().withMessage("Wallet name must be sent."),
        body('currencySymbol').notEmpty().withMessage('Missing currency symbol'),
        body('initialBalance').notEmpty().withMessage("Missing initial balance")
                              .isNumeric().withMessage('Value is not a number'),
        body('actualBalance').isEmpty().withMessage("Wallet's balance must not be sent"),
    ]

}

const walletEditValidation = () => {

    return [
        body('fromUser').isEmpty().withMessage("Wallet's owner cannot be changed"),
        body('actualBalance').isEmpty().withMessage("Wallet's cannot be manually changed"),
        body('walletName').notEmpty().withMessage("Wallet name must be sent."),
        body('currencySymbol').notEmpty().withMessage('Missing currency symbol'),
        body('initialBalance').optional().isNumeric().withMessage("Value not a number")
    ]

}