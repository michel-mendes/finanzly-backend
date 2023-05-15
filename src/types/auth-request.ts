import { Request } from "express"
import { TUserRoles } from "./user-roles"
import mongoose from "mongoose"

interface IAuthRequest extends Request {
    user?: {
        id: mongoose.Types.ObjectId;
        firstName: string;
        role: TUserRoles;
    }
}

export { IAuthRequest }