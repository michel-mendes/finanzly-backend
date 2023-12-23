import { Response, NextFunction } from "express";
import { IAuthRequest } from "../types/auth-request";
import { Readable } from "stream";
import { UploadedFile } from "express-fileupload";
import { GenericModelCRUD } from "../classes/MongooseModelCRUD";
import { Transaction } from "../models/transaction"
import csvParser from "papaparse";
import Logger from "../../config/logger";
import moment from "moment";

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
                        const transactionsList = await parseCsvInterMobile(csvData, walletId)

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


// Helper
async function parseCsvInterMobile(csvData: any, walletId: string) {
    const transactionsList = []

    // First line of data = 5
    for (let i = 5; i < csvData.length; i++) {

        const item = csvData[i]
        const temp_splittedDate = String(item[0]).split("/")
        const temp_value = Number(String(item[3]).replaceAll(".", "").replace(",", "."))

        const fromUser = ""
        const fromWallet = walletId
        const fromCategory = ""

        //                              v--> `replace(/\s+/g, " ")` removes excessive spaces
        const description = `${item[1]}`.replace(/\s+/g, " ")
        const extraInfo = `${item[2]}`.replace(/\s+/g, " ")
        const value = Math.abs(temp_value)
        const transactionType = (temp_value >= 0) ? "C" : "D"
        const csvImportId = item.join("|").replaceAll(/\s+/g, "_")

        const date = moment(`${temp_splittedDate[2]}-${temp_splittedDate[1]}-${temp_splittedDate[0]}`).startOf("day").toDate()

        // Checks if this transaction being requested for import already exists in the database.
        // It will be filtered in the frontend, preventing it from being imported twice
        const transactionAlreadyExists = (await transactionsCrud.findDocuments({ csvImportId, fromWallet })).length > 0

        const transaction = {
            fromCategory,
            fromWallet,
            fromUser,
            date,
            description,
            extraInfo,
            value,
            transactionType,
            csvImportId,
            transactionAlreadyExists

        }

        transactionsList.push(transaction)
    }

    return transactionsList
}