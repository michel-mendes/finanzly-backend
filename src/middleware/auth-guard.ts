import { Response, NextFunction } from "express"
import { User } from "../models/user";
import { GenericModelCRUD } from "../classes/MongooseModelCRUD";
import { IAuthRequest } from "../types/auth-request";
import { AppError } from "./error-handler";
import jwt, {JwtPayload} from "jsonwebtoken"
import config from "config"

const usersCrud = new GenericModelCRUD(User)
const secret = config.get<string>("secret")

interface IJwtTokenData extends JwtPayload {
    userId: string;
}

async function authGuard(req: IAuthRequest, res: Response, next: NextFunction) {
    const { token } = req.cookies

    // Check if the token is in the cookies
    if ( !token ) {
        return res.status(401).json( { message: "Unauthorized access" } )
    }

    // Check if the token is valid
    try {
        const verifiedToken = jwt.verify( token, secret ) as IJwtTokenData
        const userThatRequested = await usersCrud.findDocumentById(verifiedToken.userId, "activeWallet")

        if (!userThatRequested) throw new AppError("Unauthorized access", 401)

        req.user = {
            id: userThatRequested._id,
            firstName: userThatRequested.firstName,
            lastName: userThatRequested.lastName,
            activeWallet: userThatRequested.activeWallet,
            firstDayOfMonth: userThatRequested.firstDayOfMonth,
            role: userThatRequested?.role!
        }

        next()
    } catch (error: any) {
        res.status(400).json( { message: "Invalid token" } )
    }
}

export { authGuard }