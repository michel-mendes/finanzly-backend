import mongoose, { model, Schema, Model, ObjectId } from "mongoose"

interface IWallet {
    id?:            Schema.Types.ObjectId,
    fromUser:       Schema.Types.ObjectId,
    walletName:     string,
    currencySymbol: string,
    initialBalance: number,
    actualBalance?: number
}

type WalletModel = Model<IWallet, {}>

const walletSchema = new Schema<IWallet, WalletModel>(
    {
        fromUser:       { type: Schema.Types.ObjectId, ref: "User", required: true },
        walletName:     { type: String, required: true },
        currencySymbol: { type: String, required: true },
        initialBalance: { type: Number, required: true },
        actualBalance:  { type: Number }
    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: ( doc, ret ) => {
                delete ret._id
            }
        },
        timestamps: true
    }
)

const Wallet =  model<IWallet, WalletModel>("Wallet", walletSchema)

export { IWallet, Wallet }