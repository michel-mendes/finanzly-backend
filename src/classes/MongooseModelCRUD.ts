import { Model } from "mongoose";
import mongoose from "mongoose";

export { GenericModelCRUD }

// Generic class for carrying out the operations of different Models in the database
class GenericModelCRUD< Type extends mongoose.Document > {
    model: Model< Type >

    constructor ( model: Model< Type > ) {
        this.model = model
    }

    async insertDocument( data: Type ): Promise< Type > {
        const newDocument = new this.model( data )

        return await newDocument.save()
    }

    async findDocuments( query: mongoose.Query<Type[], Type> ): Promise< Type[] > {
        return await this.model.find( query ).exec()
    }

    async editDocument( documentId: mongoose.Types.ObjectId, data: Type ): Promise< void > {
        await this.model.updateOne( {_id: documentId}, { $set: data } ).exec()
    }

    async deleteDocument( documentId: mongoose.Types.ObjectId ): Promise< void > {
        await this.model.deleteOne( {_id: documentId} ).exec()
    }
}