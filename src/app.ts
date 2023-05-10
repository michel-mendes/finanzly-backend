// Load ENV variables
require("dotenv").config()

// Module imports
import { handle404Error, handleCustomErrors } from "./middleware/error-handler"
import { connectDatabase } from "../config/db"
import express from "express"
import fileUpload from "express-fileupload"
import cookieParser from "cookie-parser"
import cors from "cors"
import config from "config"
import Logger from "../config/logger"
import morganMiddleware from "./middleware/morgan-handler"
import apiRouter from './api.router'
import path from "path"

const app = express()
const port = config.get<number>( 'port' )
const allowedUrls = config.get<string>( 'frontEndUrl' )

// Set EJS to the default HTML rendering engine
app.use( express.static( path.join( __dirname, '..', 'public' ) ) )
// console.log(path.join( __dirname, '..', 'public' ))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs')

// Middlewares
app.use( fileUpload() )
app.use( express.json() )
app.use( cookieParser() )

app.use( cors(
    {
        // origin: ( origin: any, callback: any ) => { callback(null, true) }, // Bad idea :(
        origin: (requestOrigin: string | undefined, callback: Function) => {
            switch (true) {
                case allowedUrls.includes(requestOrigin!):
                    Logger.info(`CORS information: allowed access to origin: "${requestOrigin}"`);
                    callback(null, true)
                    break;
                default:
                    Logger.warn(`CORS information: denied access to origin: "${requestOrigin}"`);
                    callback(new Error(`Origin "${requestOrigin}" not allowed`), false)
            }
        },
        // origin: ["http://localhost:3001", "http://192.168.100.145:3001"],
        credentials: true
    }
) )


app.use( morganMiddleware )

// App "API" Route controller
app.use('/api', apiRouter)

// Error handler
app.use( handleCustomErrors )
app.use( handle404Error )

// Start app
app.listen( port, async () => {

    // Connect to MongoDB Atlas
    await connectDatabase()

    Logger.info(`Server successfully started and listening to port: ${port}`)

})