import { body } from "express-validator"

export {
    categoryCreateValidation,
    categoryEditValidation
}

const categoryCreateValidation = () => {
   
    return [
        body('fromUser').isString().withMessage('Missing user ID'),
        body('categoryName').isString().withMessage('Missing category name'),
        body('iconPath').isEmpty().withMessage("Read only"),
        body('transactionType').isString().withMessage('Missing transaction type')
                               .custom( (value: string) => {
                                if ( value === 'C' || value === 'D' ) { return Promise.resolve( value ) }
                                else { return Promise.reject("Send 'C' for credit or 'D' for debit") }
                               } )
    ]

}

const categoryEditValidation = () => {

    return [
        
        body('fromUser').isEmpty().withMessage("Category's owner cannot be changed"),
        body('categoryName').optional().isString().withMessage("Missing category name"),
        body('iconPath').isEmpty().withMessage("Read only"),
        body('transactionType').optional().isString().withMessage('Missing transaction type')
                               .custom( (value: string) => {
                                if ( value === 'C' || value === 'D' ) { return Promise.resolve( value ) }
                                else { return Promise.reject("Send 'C' for credit or 'D' for debit") }
                               } )
    ]

}