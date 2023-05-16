// This module will be called directly by "wallets.ts" everytime a wallet's initial balance is updated

import { GenericModelCRUD } from "../classes/MongooseModelCRUD"
import { Transaction } from "../models/transaction"

export { recalculateWalletBalance }

async function recalculateWalletBalance(walletId: string, initialBalance: number): Promise<number> {
    const transactionsCrud = new GenericModelCRUD(Transaction)
    
    const transactions = await transactionsCrud.findDocuments({ fromWallet: walletId })
    let walletBalance = initialBalance
    
    transactions.forEach(transaction => {
        walletBalance = Number(walletBalance) + Number(transaction.creditValue) - Number(transaction.debitValue)
    })

    return walletBalance
}