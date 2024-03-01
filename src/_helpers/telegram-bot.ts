import Logger from "../../config/logger"
import telegramBotApi from "node-telegram-bot-api"
import config from "config"

const botToken = config.get<string>("telegramBotToken")
const chatId = config.get<string>("telegramChatId")

const telegramBot = new telegramBotApi(botToken)

export const telegram = {
    sendMessage
}

async function sendMessage(text: string) {
    try {
        await telegramBot.sendMessage(chatId, text, {parse_mode: "HTML"})
    } catch (error: any) {
        Logger.error(`Error while trying to send Telegram message: '${error}'`)
    }
}