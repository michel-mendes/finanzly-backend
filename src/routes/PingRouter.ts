import { Router } from "express"

const pingRouter = Router()

pingRouter.get("/", (req, res, next) => {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl

    console.log(`Received ping from "${fullUrl}"`)
    res.status(200).send(`pong (${fullUrl})`)
})

export { pingRouter }