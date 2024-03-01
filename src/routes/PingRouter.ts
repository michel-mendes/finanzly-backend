import { Router } from "express"
import { telegram } from "../_helpers/telegram-bot"

const pingRouter = Router()

pingRouter.get("/", async (req, res, next) => {
    const fullUrl = req.protocol + '://' + req.headers.origin

    await telegram.sendMessage(`pong (${fullUrl})`)
    res.status(200).send(`pong (${fullUrl})`)
})

export { pingRouter }