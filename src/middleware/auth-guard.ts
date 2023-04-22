import { Request, Response, NextFunction } from "express"
import { User } from "../models/users/user";
import { IAuthRequest } from "../types/auth-request";
import jwt from "jsonwebtoken"
import config from "config"

const secret = config.get<string>("secret")

async function authGuard(req: IAuthRequest, res: Response, next: NextFunction) {
    const { token } = req.cookies

    // Check if the header has a token
    if ( !token ) {
        return res.status(401).json( { message: "Unauthorized access" } )
    }

    // Check if the token is valid
    try {
        const verifiedToken = jwt.verify( token, secret ) as any
        const userThatRequested = await User.findById( verifiedToken.userId )

        req.user = {
            id: userThatRequested?._id,
            firstName: userThatRequested?.firstName!,
            role: userThatRequested?.role!
        }

        next()
    } catch (error: any) {
        res.status(400).json( { message: "Invalid token" } )
    }
}

export { authGuard }