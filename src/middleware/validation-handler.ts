import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"

export const validateData = (req: Request, res: Response, next: NextFunction) => {

    const errors = validationResult( req )

    if ( errors.isEmpty() ) {
        return next()
    }

    const extractedErrors: string[] = []

    errors.array().map(
        ( error ) => {
            extractedErrors.push( error.msg )
        }
    )

    return res.status(422).json({
        errors: extractedErrors
    })

}