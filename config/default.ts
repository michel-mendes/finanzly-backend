const appSecret = process.env.SECRET_TOKEN
const frontEndDomain = process.env.FRONTEND_URL
const databaseName = process.env.DB_NAME
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS
const emailFrom = process.env.EMAIL_FROM
const emailHost = process.env.EMAIL_SMTP_HOST
const emailPort = process.env.EMAIL_SMTP_PORT
const emailUser = process.env.EMAIL_SMTP_AUTH_USER
const emailPass = process.env.EMAIL_SMTP_AUTH_PASSWORD
const env = process.env.NODE_ENV
const port = process.env.PORT || 3000
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || undefined
const telegramChatId = process.env.TELEGRAM_CHAT_ID || undefined

export default {
    env,
    port,
    telegramBotToken,
    telegramChatId,
    secret: appSecret,
    frontEndUrl: frontEndDomain?.replaceAll(" ", "").split(","),
    connectionString: `mongodb+srv://${dbUser}:${dbPassword}@cluster0.a4rqihe.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
    emailConfig: {
        from: emailFrom,
        smtpOptions: {
            host: emailHost!,
            port: emailPort,
            auth: {
                user: emailUser!,
                pass: emailPass!
            }
        }
    }
}