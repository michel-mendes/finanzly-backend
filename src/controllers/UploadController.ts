import { Response, NextFunction } from "express";
import { IAuthRequest } from "../types/auth-request";
import csvParser from "papaparse";
import { Readable } from "stream";
import Logger from "../../config/logger";
import { UploadedFile } from "express-fileupload";

export const uploadController = {
    uploadCsv
}

async function uploadCsv(req: IAuthRequest, res: Response, next: NextFunction) {
    try {

        const uploadedFile = <UploadedFile>req.files!.csvFile
        const stream = Readable.from(uploadedFile.data)

        csvParser.parse(stream, {
            encoding: "utf8",
            complete: async (result) => {
                console.log(result)
            }
        })

        res.json({ status: "Working" })
    } catch (error: any) {
        Logger.error(`Error while uploading CSV file: ${error.message}`)
        return next(error)
    }
}