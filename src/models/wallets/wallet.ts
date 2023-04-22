import mongoose, { model, Schema } from "mongoose"
import { recalculateWalletBalance } from "./wallet-balance-helper"

interface IWallet extends mongoose.Document {
    id?: Schema.Types.ObjectId,
    fromUser: Schema.Types.ObjectId,
    walletName: string,
    currencySymbol: string,
    initialBalance: number,
    actualBalance: number,
    iconPath: string
}

const walletSchema = new Schema(
    {
        fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
        walletName: { type: String, required: true },
        currencySymbol: { type: String, required: true },
        initialBalance: { type: Number, required: true },
        actualBalance: { type: Number },
        iconPath: { type: String }
    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
                delete ret._id
            }
        },
        timestamps: true
    }
)

walletSchema.pre("save", async function (next) {
    if (this.isNew) {
        this.actualBalance = this.initialBalance
    }
    
    next()
})

walletSchema.pre("findOneAndUpdate", async function (next) {
    const docToUpdate: IWallet | null = await this.model.findOne(this.getQuery())
    const newInitialBalance: number = this.get("initialBalance")

    if (docToUpdate) {
        if (newInitialBalance !== docToUpdate.initialBalance) {
            this.set("actualBalance", await recalculateWalletBalance(docToUpdate._id!.toString(), newInitialBalance))
        }
    }

    next()
})

const Wallet = model<IWallet>("Wallet", walletSchema)

export { IWallet, Wallet }