import mongoose, { model, Schema } from "mongoose"

interface IWallet extends mongoose.Document {
    id?:            Schema.Types.ObjectId,
    fromUser:       Schema.Types.ObjectId,
    walletName:     string,
    currencySymbol: string,
    initialBalance: number,
    actualBalance:  number
}

const walletSchema = new Schema(
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

walletSchema.pre("save", function( next ) {
    if ( this.isNew ) {
        this.actualBalance = this.initialBalance
    }

    next()
})

const Wallet =  model<IWallet>("Wallet", walletSchema)

export { IWallet, Wallet }