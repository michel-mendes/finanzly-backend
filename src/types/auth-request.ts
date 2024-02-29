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
    },

    // v---- Used only for deployment in Render.com in order to avoid type error during build
    [key: string]: any
}

export { IAuthRequest }