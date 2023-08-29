import { Response, NextFunction } from "express";
import { IAuthRequest } from "../types/auth-request";
import Logger from "../../config/logger";
import moment from "moment"

// Interface
interface ITotalValuesGrouped {
    totalIncomes: {
        byDate: {
            [date: string]: number
        },
        byCategory: {
            [category: string]: number
        },
        total: number
    },
    totalExpenses: {
        byDate: {
            [date: string]: number
        },
        byCategory: {
            [category: string]: number
        },
        total: number
    },
    currencySymbol: string
}

// Models
import { ITransaction, Transaction } from "../models/transaction";
import { Wallet } from "../models/wallet";
import { GenericModelCRUD } from "../classes/MongooseModelCRUD";

export const reportController = {
    getReport
}

const transactionCrud = new GenericModelCRUD(Transaction)
const walletCrud = new GenericModelCRUD(Wallet)

async function getReport(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
        const fromUser = req.user?.id.toString()
        const { start, end, wallet } = req.query as { start: string, end: string, wallet: string }

        // Convert incoming start and end dates to milliseconds
        const startDate = moment(start)
        const endDate = moment(end)
        
        const currencySymbol = (await walletCrud.findDocumentById(wallet)).currencySymbol
        const transactions = await transactionCrud.findDocuments({
            fromUser,
            fromWallet: wallet,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }, "fromCategory")

        const groupedTotalValues = groupTotalValuesByDate(transactions, currencySymbol)

        res.status(200).json(groupedTotalValues)
    } catch (error: any) {
        Logger.error(`Error while generating user report: ${error.message}`)
        return next(error)
    }
}

// Helpers
function groupTotalValuesByDate(transactionsList: ITransaction[], currencySymbol: string) {
    let groupedTransactions: ITotalValuesGrouped = {
        totalExpenses: {
            byDate: {},
            byCategory: {},
            total: 0
        },
        totalIncomes: {
            byDate: {},
            byCategory: {},
            total: 0
        },
        currencySymbol
    }
    
    for (let transaction of transactionsList) {
        const date = moment(transaction.date).toJSON()
        const categoryName = (transaction.fromCategory as any).categoryName
        const isIncome = transaction.creditValue > 0

        if (isIncome) {

            if (!groupedTransactions.totalIncomes.byDate[date]) {
                groupedTransactions.totalIncomes.byDate[date] = 0
            }

            if (!groupedTransactions.totalIncomes.byCategory[categoryName]) {
                groupedTransactions.totalIncomes.byCategory[categoryName] = 0
            }

            groupedTransactions.totalIncomes.byDate[date] += Number(transaction.value)
            groupedTransactions.totalIncomes.byCategory[categoryName] += Number(transaction.value)

            groupedTransactions.totalIncomes.total += Number(transaction.value)

        } else {

            if (!groupedTransactions.totalExpenses.byDate[date]) {
                groupedTransactions.totalExpenses.byDate[date] = 0
            }

            if (!groupedTransactions.totalExpenses.byCategory[categoryName]) {
                groupedTransactions.totalExpenses.byCategory[categoryName] = 0
            }

            groupedTransactions.totalExpenses.byDate[date] += Number(transaction.value)
            groupedTransactions.totalExpenses.byCategory[categoryName] += Number(transaction.value)

            groupedTransactions.totalExpenses.total += Number(transaction.value)

        }
    }

    return groupedTransactions
}