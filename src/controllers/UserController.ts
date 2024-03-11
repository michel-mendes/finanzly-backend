import { IAuthRequest } from "../types/auth-request"
import { Response, NextFunction } from "express"
import { AppError } from "../middleware/error-handler"
import { sendEmail } from "../_helpers/mailer"
import { CookieOptions } from "express"
import { TUserRoles } from "../types/user-roles"
import Logger from "../../config/logger"
import config from "config"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import appConfig from "../../config/default"

// Database manipulator
import { GenericModelCRUD } from "../classes/MongooseModelCRUD"

// Mongoose Models
import { IUser, IUserMethods, User } from "../models/user"

export const userController = {
    authenticateUser,
    verifyUserEmail,
    forgotPassword,
    resetPassword,
    renderChangePasswordPage,
    createNewUser,
    getLoggedInUser,
    logoffUser,
    setActiveWallet,
    getAllUsers,
    getUserById,
    editUser,
    deleteUser
}

const usersCrud = new GenericModelCRUD( User )
const environment = config.get<string>("env")

async function authenticateUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const { password, email } = req.body
        const ipAddress = req.ip
        const originHost = req.headers.origin

        // Log in user
        const loggedUser = await _checkUserDataAndLoginIfMatches( email, password, ipAddress )

        // Set a cookie session for this user
        _setCookies(res, originHost, loggedUser.authorizationToken)        

        res.status(200).json( loggedUser )
    }
    catch (error: any) {
        Logger.error(`Error while user authentication: ${ error.message }`)
        return next( error )
    }
}

async function verifyUserEmail(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const verificationToken = <string>req.query.token
        const user = await usersCrud.findOneDocument({ verificationToken })

        if (!verificationToken || !user) throw new AppError("Invalid token!", 404)

        user.verifiedAt = new Date()
        user.verificationToken = undefined

        await user.save()

        res.status(200).send("Success")
        // res.status(200).render('verify-user', { message: "User verification successful, now you can log in!" })
        // return res.status(200).json({message: "User verification successful, now you can log in!"})
    }
    catch (error: any) {
        const code = error.code ? error.code : 500

        Logger.error(`Error while user email verification: ${error.message}`)

        return res.status(code).json({ message: error.message })
        // return res.status(code).render('verify-user', { message: error.message })
        // return next( error )
    }
}

async function createNewUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const userData : (IUser & IUserMethods) = req.body

        const userAlreadyExists = await _checkIfEmailAlreadyExists(userData.email)
        if (userAlreadyExists) throw new AppError("Email address already registered", 409)
        
        const isFirstUser = (await User.countDocuments({})) === 0
        userData.role = isFirstUser ? "Admin" : "User"
        userData.verificationToken = _generateRandomTokenString()
        userData.firstDayOfMonth = 1

        await _sendUserVerificationEmail(userData)

        const createdUser = await usersCrud.insertDocument(userData)

        res.status(201).json(createdUser)
    }
    catch (error: any) {
        Logger.error(`Error while user registration: ${error.message}`)
        return next(error)
    }
}

function getLoggedInUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user

        // logs the user out, forcing a new login to correct the possible lack of definition of "firstDayOfMonth"
        if (!user?.firstDayOfMonth) {
            logoffUser(req, res, next)
            return
        }
    
        res.status(200).json( user )
    } catch (error:any) {
        Logger.error(`Error while getting the logged user: ${ error.message }`)
    }
}

function logoffUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        res.cookie("token", "", {
            httpOnly: (environment == "development") ? false : true,
            secure: (environment == "development") ? false : true,
            sameSite: (environment == "development") ? "strict" : "none"
        })

        res.status(200).json({message: "Logout successful"})
    } catch (error: any) {
        Logger.error(`Error while logging out current user: ${ error.message }`)
        return next(error)
    }
}

async function setActiveWallet(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const {activeWallet} = req.body
        const userId = req.user!.id

        const user = await usersCrud.findDocumentById(userId.toString())
        user.activeWallet = activeWallet
        await user.save()

        const userWithWallet = await usersCrud.findDocumentById(userId.toString(), "activeWallet")

        res.status(200).json(userWithWallet)
    } catch (error: any) {
        Logger.error(`Error while setting active wallet for current user: ${ error.message }`)
        return next(error)
    }
}

async function getAllUsers(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const usersList = await usersCrud.findDocuments()

        return res.status(200).json( usersList )
    }
    catch (e: any) {
        Logger.error( `Error while getting users list: ${ e.message }` )
        return next( e )
    }
}

async function getUserById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const requestingUserId = req.user!.id.toString()
        const requestingUserRole = req.user!.role
        const targetUserId = req.params.id

        // Allow Admin to get any user and normal users to get only themselves
        _blockRegularUserToGetOtherUsers( requestingUserId, requestingUserRole, targetUserId )
        
        let user = await usersCrud.findDocumentById( targetUserId )

        return res.status(200).json( user )
    }
    catch (e: any) {
        Logger.error( `Error while getting user by id: ${ e.message }` )
        return next( e )    
    }
}

async function editUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const requestingUserId = req.user!.id.toString()
        const requestingUserRole = req.user!.role
        const targetUserId = req.params.id
        const newUserData = req.body

        // Allow Admin to update any user and normal users to update only themselves
        _blockRegularUserToGetOtherUsers(requestingUserId, requestingUserRole, targetUserId)

        if (await _checkIfEmailAlreadyExists(newUserData.email)) throw new AppError("Email already registered", 409)

        const updatedUser = await usersCrud.editDocument(targetUserId, newUserData as (IUser & IUserMethods))

        return res.status(200).json(updatedUser)
    }
    catch (e: any) {
        Logger.error(`Error while updating user data: ${e.message}`)
        return next(e)
    }
}

async function deleteUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const requestingUserId = req.user!.id.toString()
        const requestingUserRole = req.user!.role
        const targetUserId = req.params.id
        
        // Allow Admin to delete any user and normal users to delete only themselves
        _blockRegularUserToGetOtherUsers( requestingUserId, requestingUserRole, targetUserId )
        
        const deletedUser = await usersCrud.deleteDocument( targetUserId )
        
        return res.status(200).json( {message: "User successfully deleted"} )
    }
    catch (e: any) {
        Logger.error( `Error while deleting user: ${ e.message }` )
        return next(e)
    }
}

async function forgotPassword(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const { email } = req.body
        const originHost = req.get("host")

        const user = await usersCrud.findOneDocument({ email })

        if (!user) {
            throw new AppError('Email not found', 404)
        }

        user.resetPasswordToken = {
            token: _generateRandomTokenString(),
            expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day expiration
        }

        await user.save()

        await _sendForgotPasswordEmail(user, originHost)

        return res.status(200).json({ message: `If there is a registered email address, you will receive an email containing the necessary instructions.` })
    }
    catch (error: any) {
        Logger.error(`Error while sending the reset password email: ${error.message}`)
        return next(error)
    }
}

async function resetPassword(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const resetToken = req.body.token
        const newPassword = req.body.password

        const user = await usersCrud.findOneDocument({
            'resetPasswordToken.token': resetToken,
            'resetPasswordToken.expireAt': { $gt: Date.now() }
        })

        if (!user) throw new AppError('Invalid reset token', 400)

        user.password = newPassword
        user.resetPasswordToken = undefined
        await user.save()

        return res.status(200).json({ message: `Password reset successful, you can now login` })
    }
    catch (error: any) {
        Logger.error(`Error while setting the new password: ${error.message}`)
        return next(error)
    }
}

function renderChangePasswordPage(req: IAuthRequest, res: Response, next: NextFunction) {
    // res.status(301).redirect( '[URL_TO_FRONTEND_CHANGE_PASSWORD_HERE]' + `?token=${ req.query.token }` )
    res.render('change-user-password-page')
}


// Helper functions
async function _checkUserDataAndLoginIfMatches(requestEmail: string, requestPassword: string, ipAddress: string | undefined): Promise<any> {
    const user = await usersCrud.findOneDocument( {email: requestEmail}, "activeWallet" )

    const userNotFound = ( !user )
    const incorrectPassword = ( user ) ? !(await user.checkIfPasswordIsCorrect( requestPassword )) : true

    if ( userNotFound || incorrectPassword ) throw new AppError("Invalid email / password", 400)
    
    // Unverified users can't login
    if ( !user.isVerified ) throw new AppError("Unauthorized access, unverified user", 401)

    
    // Successful user authentication
    const signedObjectData = { userId: user.id }

    user.authorizationToken = _generateAuthorizationJwtToken( signedObjectData )
    await avoidNulledFirstDayOfMonth(user, false)
    await user.save()
      
    return { ...user.toJSON(), authorizationToken: user.authorizationToken}
}

async function _checkIfEmailAlreadyExists( email: string ): Promise<boolean> {
    const existingUser = await usersCrud.findOneDocument( {email} )

    if ( existingUser ) {
        return true
    } else {
        return false
    }
}

function _generateRandomTokenString(): string {
    return crypto.randomBytes( 40 ).toString('hex')
}

async function _sendUserVerificationEmail( user: IUser ) {
    let bodyMessage: string
    
    {
        const verifyUrl = `${ appConfig.frontEndUrl }?token=${ user.verificationToken }`
        const lastName = user.lastName ? ` ${user.lastName}` :  ``
        
        bodyMessage = `<h2>Email verification</h2>
        <p>Hi ${ user.firstName }${ lastName },
        We just need to verify your email address before you can access our platform.</p><br>
        <p>Please, click the button below to proceed the confirmation:</p>
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
        <a href="${ verifyUrl }" style="width: 250px; height: 50px;">
                            <button style="width: 100%; height: 100%; border-color: silver; border-radius: 7px;font-size: 18px; cursor: pointer;">Verify my email address</button>
                            </a>
                       </div>`
                       
    }

    await sendEmail(user.email, "Please, verify your email address", bodyMessage)
}

async function _sendForgotPasswordEmail( user: IUser, hostAddress: string | undefined = undefined ) {
    let bodyMessage: string
    
    bodyMessage = `<p>Hi ${ user.firstName },</p>
    <p>There was a request to change your password!</p><br>
    <p>If you did not make this request then please ignore this email.</p><br>`
    
    {
        const changePasswordUrl = `http://${ hostAddress }/api/user/reset-password?token=${ user.resetPasswordToken?.token }`
        
        bodyMessage += `<p>Otherwise, please click the button below to change your password</p>
        <a href="${ changePasswordUrl }" style="cursor: pointer;">
        <button style="display: block; margin: 0 auto; height: 50px; border-color: silver; border-radius: 7px;font-size: 18px;">Change my password</button>
        </a>`
    }
    
    await sendEmail( user.email, `Instructions for resetting your password`, bodyMessage )
}

function _generateAuthorizationJwtToken( payload: string | object | Buffer ): string {
    return jwt.sign( payload, config.get<string>('secret'), { expiresIn: '7d' } )
}

function _setCookies(res: Response, originHost: string | undefined, authToken: string) {
    
    const cookiesConfig: CookieOptions = {
        httpOnly: (environment == "development") ? false : true,
        secure: (environment == "development") ? false : true,
        sameSite: (environment == "development") ? "strict" : "none",
        maxAge: 1000 * 60 * 60 * 24 * 7   /* 7 days expiration */
    }

    res.set('Access-Control-Allow-Origin', originHost);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.cookie("token", authToken, cookiesConfig)
}

function _blockRegularUserToGetOtherUsers(requestingUserId: string, requestingUserRole: TUserRoles, targetUserId: string) {
    if ( requestingUserId !== targetUserId && requestingUserRole !== "Admin" ) {
        throw new AppError( 'Unauthorized access', 401 )
    }
}

async function avoidNulledFirstDayOfMonth(user: IUser, saveOnChange = true) {
    if (!user.firstDayOfMonth) {
        user.firstDayOfMonth = 1;

        (saveOnChange) && await user.save()
    }
}