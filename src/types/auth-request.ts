import { Request } from "express"
import mongoose from "mongoose"

interface IAuthRequest extends Request {
    user?: {
        id: mongoose.Types.ObjectId,
        firstName: string
        role: string
    }
}

export { IAuthRequest }