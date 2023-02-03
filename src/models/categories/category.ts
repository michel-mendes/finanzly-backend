import { model, Schema, Model } from "mongoose"

interface ICategory {
    id?:                Schema.Types.ObjectId,
    fromUser:           Schema.Types.ObjectId,
    categoryName:       string,
    transactionType:    string,
    iconPath?:          string
}

type CategoryModel = Model<ICategory, {}>

const categorySchema = new Schema<ICategory, CategoryModel>(
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
                delete ret.iconPath
            }
        },
        timestamps: true
    }
)

const Category =  model<ICategory, CategoryModel>("Category", categorySchema)

export { ICategory, Category }