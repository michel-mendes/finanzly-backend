const mysql = require('mysql2/promise'); // Instead of 'mysql2' to run the function "await connection.query"
const config = require('./database/database-configs.js');

createDatabase();

async function createDatabase() {
    // console.log( JSON.stringify( config, null, 4 ) );

    try {
        const connection = await mysql.createConnection( {
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password
        } );

        console.log('\n>> Successfully connected to MySQL server.');

        // Now let's create the Database if it not exists yet
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` DEFAULT CHARACTER SET utf8;`);
        console.log(`>> Database '${config.database}' was successfully created...\n>> Have a nice day!\n\nPlease restart the application`);
        process.exit();
    }
    catch (errorMessage) {
        console.log(`Error while connecting to MySQL -> "${errorMessage}"`);
    }
}