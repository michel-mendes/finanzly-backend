import { model, Schema } from "mongoose"
import mongoose from "mongoose"

interface ICategory extends mongoose.Document {
    id?:                Schema.Types.ObjectId,
    fromUser:           Schema.Types.ObjectId,
    categoryName:       string,
    transactionType:    string,
    iconPath?:          string
}

const categorySchema = new Schema(
    {
        fromUser:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
        categoryName:       { type: String, required: true },
        transactionType:    { type: String, required: true },
        iconPath:           { type: String }
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

const Category =  model< ICategory >("Category", categorySchema)

export { ICategory, Category }