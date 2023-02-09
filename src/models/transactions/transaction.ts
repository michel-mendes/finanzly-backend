import { model, Schema } from "mongoose"
import mongoose from "mongoose"

interface ITransaction extends mongoose.Document {
    id?:            Schema.Types.ObjectId,
    fromCategory:   string,
    fromWallet:     string,
    fromUser:       string,
    date:           Date,
    description:    string,
    extraInfo?:     string,
    value:          number,
    creditValue?:   number,
    debitValue?:    number,
    csvImportId?:   string
}

const transactionSchema = new Schema(
    {
        fromCategory:   { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        fromWallet:     { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
        fromUser:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date:           { type: String, required: true },
        description:    { type: String, required: true },
        extraInfo:      { type: String },
        value:          { type: String, required: true },
        creditValue:    { type: String },
        debitValue:     { type: String },
        csvImportId:    { type: String }
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

const Transaction =  model< ITransaction >("Transaction", transactionSchema)

export { ITransaction, Transaction }