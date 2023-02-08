import { AppError } from "../middleware/error-handler";
import { Model } from "mongoose";
import mongoose from "mongoose";

export { GenericModelCRUD }

// Generic class for carrying out the operations of different Models in the database
class GenericModelCRUD< Type extends mongoose.Document > {
    model: Model< Type >

    constructor ( model: Model< Type > ) {
        this.model = model
    }

    async insertDocument( data: Type, populateFields: string | string[] = "" ): Promise< Type > {
        const populateFieldsArray = this.checkExistenceOfRefInModelAndConvertsToArray( populateFields )
        const newDocument = new this.model( data )
        await newDocument.save()

        return await this.model.findById( newDocument.id ).populate( populateFieldsArray ).exec() as Type
    }

    async findDocuments( searchQuery: mongoose.FilterQuery<Type> = {}, populateFields: string | string[] = "" ): Promise< Type[] > {
        const populateFieldsArray = this.checkExistenceOfRefInModelAndConvertsToArray( populateFields )
        
        return await this.model.find( searchQuery ).populate( populateFieldsArray ).exec()
    }

    async findOneDocument( searchQuery: mongoose.FilterQuery<Type> = {}, populateFields: string | string[] = "" ): Promise< Type | null > {
        const populateFieldsArray = this.checkExistenceOfRefInModelAndConvertsToArray( populateFields )
        const foundDocument = await this.model.findOne( searchQuery ).populate( populateFieldsArray ).exec() as Type

        if ( foundDocument ) {
            return foundDocument
        }
        else {
            return null
        }
    }

    async findDocumentById( docId : string, populateFields: string | string[] = "" ): Promise< Type > {
        const populateFieldsArray = this.checkExistenceOfRefInModelAndConvertsToArray( populateFields )

        const foundDocument = await this.model.findById( docId ).populate( populateFieldsArray ).exec() as Type

        if ( !foundDocument ) throw new AppError(`Document with ID:'${ docId }' not found in '${ this.model.collection.name }'`, 404 )

        return foundDocument
    }

    async editDocument( docId: string, data: Type ): Promise< Type > {
        const updatedDocument = await this.model.findOneAndUpdate( {_id: docId}, { $set: data }, { new: true } )

        if ( !updatedDocument ) throw new AppError(`Document with ID:'${ docId }' not found in '${ this.model.collection.name }'`, 404 )

        return updatedDocument
    }

    async deleteDocument( docId: string ): Promise< Type > {
        const deletedDocument = await this.model.findOneAndDelete( { _id: docId } )

        if ( !deletedDocument ) throw new AppError(`Document with ID:'${ docId }' not found in '${ this.model.collection.name }'`, 404 )
        
        return deletedDocument
    }

    
    // Class helper functions
    private checkExistenceOfRefInModelAndConvertsToArray( refFields: string | string[] = "" ): string[] {
        
        if ( refFields ) {

            const modelFields = this.model.schema.obj as any
            
            // Convert the entry value to an array in case of string
            refFields = typeof refFields === "string" ? [ refFields ] : [ ...refFields ]

            refFields.forEach( fieldName => {
                
                // Property exists and is
                if ( modelFields[ fieldName ] && modelFields[ fieldName ].ref ) {
                    // Just leave it alone or the function won't work like expected
                    // If the condition is removed, the App will show that the property ...
                    // ... does not exist even if it definitely exists
                }
                else if ( modelFields[ fieldName ] && !modelFields[ fieldName ].ref ) {
                    throw new AppError( `Property '${ fieldName }' exists in model '${ this.model.collection.name }' but has no reference with another model`, 400 )
                }
                else {
                    throw new AppError( `Property '${ fieldName }' does not exists in model '${ this.model.collection.name }'`, 400 )
                }

            } )

            return refFields

        }
        else {
            return []
        }

    }
}