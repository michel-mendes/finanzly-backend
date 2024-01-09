import { Request } from "express"
import { TUserRoles } from "./user-roles"
import mongoose from "mongoose"

interface IAuthRequest extends Request {
    user?: {
        id: mongoose.Types.ObjectId;
        firstName: string;
        lastName?: string;
        activeWallet: string | null | undefined;
        firstDayOfMonth: number;
        role: TUserRoles;
    }
}

export { IAuthRequest }