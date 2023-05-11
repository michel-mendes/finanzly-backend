import { Response, NextFunction } from "express";
import { IAuthRequest } from "../types/auth-request";
import { Readable } from "stream";
import { UploadedFile } from "express-fileupload";
import csvParser from "papaparse";
import Logger from "../../config/logger";
import { GenericModelCRUD } from "../classes/MongooseModelCRUD";
import {Transaction} from "../models/transactions/transaction"

export const uploadController = {
    uploadCsv
}

type bankNames = "bb" | "cef" | "inter-mobile";

const transactionsCrud = new GenericModelCRUD(Transaction)

async function uploadCsv(req: IAuthRequest, res: Response, next: NextFunction) {
    try {

        const { bank, walletId }: { bank: bankNames, walletId: string } = req.body
        const uploadedFile = <UploadedFile>req.files!.csvFile

        const stream = Readable.from(uploadedFile.data)

        // Read CSV content
        csvParser.parse(stream, {
            encoding: (bank == "bb") ? "latin1" : "utf8",
            complete: async (result: any) => {
                
                const csvData: any[] = result.data

                switch (bank) {
                    case "bb": {
                        
                        break
                    }
                    case "cef": {
                        
                        break
                    }
                    case "inter-mobile": {
                        let transactionsList = []
                        
                        for (let i = 0; i < csvData.length; i++) {
                            
                            const item = csvData[i]

                            const fromCategory = ""
                            const fromWallet = walletId
                            const fromUser = req.user?.id

                            //                                            v--> remove excessive spaces
                            const description = `${item[1]} - ${item[2]}`.replace(/\s+/g, " ")
                            const description_Upper = description.toUpperCase()
                            const value = Math.abs(Number(String(item[3]).replaceAll(".", "").replace(",", ".")))
                            const debitValue = (value < 0) ? value : 0
                            const creditValue = (value >= 0) ? value : 0
                            const csvImportId = item.join("|").replaceAll(/\s+/g, "_")
                            
                            const splittedDate = String(item[0]).split("/")
                            const date = `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}T03:00:00.000Z`

                            const transactionAlreadyExists = (await transactionsCrud.findDocuments({csvImportId})).length > 0

                            const transaction = {
                                fromCategory,
		                        fromWallet,
		                        fromUser,
		                        date,
                                description,
                                description_Upper,
                                value,
                                debitValue,
                                creditValue,
                                csvImportId,
                                transactionAlreadyExists

                            }

                            transactionsList.push(transaction)
                        }
                        
                        return res.json(transactionsList)
                    }
                }

            }
        })

        // res.json({ status: "Working" })
    } catch (error: any) {
        Logger.error(`Error while uploading CSV file: ${error.message}`)
        return next(error)
    }
}

// Helpers
// async function decodeCsvInterMobile( csvData, userId, walletId ) {

//     try {
//         let xtraFunctions = require('../extra-functions')
//         let totalImportedTransactions = []

//         for (let i = 6; i < csvData.length; i++) {

//             let date =  String( csvData[i][0] ).slice(6) + '-' + 
//                         String( csvData[i][0] ).slice(3, 5) + '-' +
//                         String( csvData[i][0] ).slice(0, 2)
            
//             date = xtraFunctions.parseDate( date )

//             let value = Number( String( csvData[i][2] ).replaceAll('.', '').replace(',', '.') )
            
//             let transaction = {
//                 id:             0,
//                 categoryId:     0,
//                 walletId:       walletId,
//                 userId:         userId,
//                 date:           date,
//                 description:    `${ String(csvData[i][1]).toUpperCase() }`,
//                 extraInfo:      '',
//                 value:          value >= 0 ? value : value * (-1),
//                 creditValue:    value > 0 ? value : 0,
//                 debitValue:     value < 0 ? value * (-1) : 0,
//                 csvImportId:    `${ csvData[i].toString() }`
//             }

//             let existingTransaction = await tabTransactions.getTransactionByCsvId( userId, walletId, transaction.csvImportId )
//             transaction.alreadyExists = existingTransaction.length > 0 ? true : false

//             totalImportedTransactions.push( transaction )

//         }

//         return totalImportedTransactions
//     }
//     catch (error) {
//         return `Erro 'i-1' >> "${ error }"`
//     }

// }