import { Router} from "express"

// Validations
import { validateData } from "../middleware/validation-handler"

import {
    userCreateValidation,
    userAuthenticationValidation,
    userForgotPasswordValidator,
    userResetPasswordValidator
} from "../middleware/user-validator"

import { authGuard } from "../middleware/auth-guard"

import { userController } from "../controllers/UserController"


// Routes related to Users
const userRouter = Router()

userRouter.post('/register', userCreateValidation(), validateData, userController.createNewUser)
userRouter.get('/verify-user', userController.verifyUserEmail)
userRouter.post('/authenticate', userAuthenticationValidation(), validateData, userController.authenticateUser)
userRouter.post('/logout', authGuard, userController.logoffUser)
userRouter.post('/forgot-password', userForgotPasswordValidator(), validateData, userController.forgotPassword)
userRouter.get('/reset-password', userController.renderChangePasswordPage)
userRouter.post('/reset-password', userResetPasswordValidator(), validateData, userController.resetPassword)
userRouter.get('/current', authGuard, userController.getLoggedInUser)
userRouter.get('/', authGuard, userController.getAllUsers)
userRouter.get('/:id', authGuard, userController.getUserById)
userRouter.put('/:id', authGuard, userController.editUser)
userRouter.delete('/:id', authGuard, userController.deleteUser)

export { userRouter }