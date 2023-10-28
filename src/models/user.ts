import { model, Schema, ObjectId } from "mongoose"
import { genSalt, hash, compare } from "bcryptjs"
import { TUserRoles } from "../types/user-roles"
import mongoose from "mongoose"

interface IUser extends mongoose.Document {
    id?:                    ObjectId;
    firstName:              string;
    lastName?:              string;
    role?:                  TUserRoles;
    email:                  string;
    password:               string;
    verificationToken?:     string;
    verifiedAt:             Date;
    authorizationToken?:    string;
    resetPasswordToken?: {
                            token: string;
                            expireAt: Date;
    };
    activeWallet?:          string | null;
    isVerified?:            boolean;
}

interface IUserMethods {
    checkIfPasswordIsCorrect(password: string): Promise<boolean>
}

const userSchema = new Schema(
    {
        firstName:          { type: String, required: true },
        lastName:           { type: String },
        role:               { type: String },
        email:              { type: String, required: true },
        password:           { type: String, required: true },
        verificationToken:  { type: String },
        verifiedAt:         { type: Date },
        authorizationToken: { type: String },
        resetPasswordToken: {
            token:      { type: String },
            expireAt:   { type: Date }
        },
        activeWallet:     { type: Schema.Types.ObjectId, required: false, ref: "Wallet" }
    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
                delete ret._id
                delete ret.password
                delete ret.verificationToken
                delete ret.authorizationToken
                delete ret.resetPasswordToken
            }
        },
        timestamps: true
    }
)

userSchema.method('checkIfPasswordIsCorrect', async function checkIfPasswordIsCorrect(password: string): Promise<boolean> {
    const user = this as IUser

    return await compare( password, user.password )
})

userSchema.virtual( 'isVerified' ).get( function () {
    return this.verifiedAt !== undefined
})

userSchema.pre("save", function( next ) {
    const user = this

    // If the user password has not changed then go out...
    if ( !user.isModified( 'password' ) ) return next()

    // Hash the new password
    genSalt( 10, function( err: Error, salt: string ) {
        if ( err ) return next( err )

        hash( user.password, salt, function ( err: Error, hashedPassword: string ) {
            if ( err ) return next( err )

            user.password = hashedPassword
            next()
        } )
    } )    
} )

const User = model<IUser & IUserMethods>('User', userSchema)

export { IUser, IUserMethods, User }