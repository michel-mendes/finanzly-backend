import { model, Schema } from "mongoose"
import mongoose from "mongoose"

interface ITransaction extends mongoose.Document {
    id?:                    string,
    fromCategory:           string,
    fromWallet:             string,
    fromUser:               string,
    utcDate:                Date,
    date:                   number,
    description:            string,
    description_Upper:      string,
    extraInfo?:             string,
    extraInfo_Upper?:       string,
    value:                  number,
    creditValue:            number,
    debitValue:             number,
    importedTransaction:    boolean,
    csvImportId?:           string,
}

const transactionSchema = new Schema(
    {
        fromCategory:       { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        fromWallet:         { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
        fromUser:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
        utcDate:            { type: Date },
        date:               { type: Number, required: true },
        description:        { type: String, required: true },
        description_Upper:  { type: String },
        extraInfo:          { type: String },
        extraInfo_Upper:    { type: String },
        value:              { type: Number, required: true },
        creditValue:        { type: Number },
        debitValue:         { type: Number },
        importedTransaction:{ type: Boolean },
        csvImportId:        { type: String }
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