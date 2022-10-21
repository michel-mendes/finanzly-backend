var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var Papa = require('papaparse')
var tabWallets = require('../database/models/wallets/wallets-services')
var tabCategories = require('../database/models/categories/categories-services')
var tabTransactions = require('../database/models/transactions/transactions-services')
var { appDirectories } = require('../app');

router.get('/', function(req, res, next) {
    res.redirect( '/app/login' )
})

router.get('/login', function(req, res, next) {
    if ( req.session.loggedIn ) {
        // You're logged, go to dashboard page
        res.redirect( '/app/dashboard' )
    }
    else {
        // Not logged so render the login page
        res.render(`login`);
    }
});

router.get('/logout', function (req, res, next) {
    if ( req.session.loggedIn ) {
        // You're logged, destroy the session here 'n after go to login page
        req.session = null;
    }
    
    res.redirect( '/app/login' );
});

router.post( '/authenticate', bodyParser.urlencoded({extended: true}), authenticateUser );

router.get('/dashboard', function(req, res, next) {
    if ( !req.session.loggedIn ) {
        res.redirect( '/app/login' )
    }
    else {
        res.render( './pages/main-page', {
            userId: req.session.userId,
            userFirstName: req.session.userFirstName
        });
    }
})

router.get('/registration', function(req, res, next) {
    res.sendFile(`./registration.html`, {root: appDirectories.viewsDirectory})
});

router.get('/registration/success', function(req, res, next) {
    res.sendFile(`./registration-success.html`, {root: appDirectories.viewsDirectory})
});

router.get('/categories', (req, res, next) => {
    if ( !req.session.loggedIn ) {
        res.redirect( '/app/login' )
    }
    else {
        let categoryServices = require('../database/models/categories/categories-services');

        categoryServices.getCategoriesFromUser( req.session.userId )
        .then( result => { res.render('./pages/categories-listing', { categoriesList: result, userId: req.session.userId }) } )
        .catch( next );
    }
});

router.get('/transactions', async (req, res, next) => {
    
    try {
        if ( !req.session.loggedIn ) {
            res.redirect( '/app/login' )
        }
        else {
            
            let selectedWallet = {}
            let userCategoriesList
    
            // Retrieves the wallet in which the user recorded the last transaction
            if ( !req.session.selectedWallet ) {
                req.session.selectedWallet = -1;
            }
            else {
                selectedWallet = await tabWallets.getWalletById( req.session.selectedWallet )

                if ( !selectedWallet ) req.session.selectedWallet = -1
            }

            userCategoriesList = await tabCategories.getCategoriesFromUser( req.session.userId )
            
            res.render('./pages/transactions-listing', {
                userId: req.session.userId,
                selectedWallet: req.session.selectedWallet,
                wallet: selectedWallet,
                userCategoriesList: userCategoriesList
            });
        }
    }
    catch (e) {
        next()
    }

});

router.get( '/transactions/import', async ( req, res, next ) => {

    if ( !req.session.loggedIn ) {
        res.redirect( '/app/login' )
    }
    else {

        let userCategoriesList
        let selectedWallet
        
        if ( !req.query.walletId ) {
            selectedWallet = -1
        }
        else {
            selectedWallet = await tabWallets.getWalletById( req.query.walletId )

            if ( !selectedWallet ) selectedWallet = -1
        }

        userCategoriesList = await tabCategories.getCategoriesFromUser( req.session.userId )
        
        res.render('./pages/import-transactions',  {
            userId: req.session.userId,
            walletId: req.session.selectedWallet,
            selectedWallet: selectedWallet,
            userCategoriesList: userCategoriesList
        })

    }

})

router.post( '/transactions/import', async (req, res, next) => {

    try {

        const {Readable} = require('stream')
        const stream = Readable.from( req.files.csvFile.data )
        
        Papa.parse( stream, {

            encoding: req.query.bank == 'bb' ? 'latin1' : 'utf8',
            complete: async (result) => {

                switch ( req.query.bank ) {
                    case 'bb': {
                        res.send( await decodeCsvBancoDoBrasil(result.data, req.session.userId, req.session.selectedWallet) )
                        break
                    }
                    case 'inter': {
                        res.send( await decodeCsvInter(result.data, req.session.userId, req.session.selectedWallet) )
                        break
                    }
                    case 'cef': {
                        res.send( await decodeTxtCef(result.data, req.session.userId, req.session.selectedWallet) )
                        break
                    }
                }

            }}
        )

    }
    catch ( error ) {
        res.send( `Erro 'i-2' >>> ${ error }` )
    }

})

router.post('/transactions/setSelectedWallet', (req, res, next) => {
    
    try {
        req.session.selectedWallet = req.body.selectedWalletId

        res.send('OK')
    }
    catch (e) {
        res.send(`ERRO >>> '${e}'`)
    }

})

router.get('/wallets', (req, res, next) => {
    if ( !req.session.loggedIn ) {
        res.redirect( '/app/login' )
    }
    else {
        let walletServices = require('../database/models/wallets/wallets-services');

        walletServices.getWalletsFromUser( req.session.userId )
        .then( result => { res.render('./pages/wallets-listing', { walletsList: result, userId: req.session.userId }) } )
        .catch( next );
    }
});




async function authenticateUser(req, res) {
    let userServ = require('../database/models/users/users-services');
        
    let authenticationResponse = await userServ.authenticateUser( req.body.userIdentification, req.body.password )

    if ( authenticationResponse.error ) {
        
        res.json( authenticationResponse )

    }
    else {

        req.session.loggedIn = true;
        req.session.userId = authenticationResponse.id;
        req.session.userFirstName = authenticationResponse.firstName;

        res.json({
            error: false,
            message: 'Login efetuado com sucesso!'
        });

    }


    /*
    userServ.authenticateUser( req.body.userIdentification, req.body.password )
        .then( result => {
            let user = result;

            if ( user.error ) {
                res.json( user );
            }
            else {
                req.session.loggedIn = true;
                req.session.userId = user.id;
                req.session.userFirstName = user.firstName;

                res.json({
                    error: false,
                    message: 'Login efetuado com sucesso!'
                });
            }
        })
        .catch( reason => {
            res.sendStatus(401).json({
                error: true,
                message: 'Erro!'
            });
        });
        */
}

async function decodeCsvBancoDoBrasil( csvData, userId, walletId ) {

    try {
        let xtraFunctions = require('../extra-functions')
        let totalImportedTransactions = []

        for (let i = 0; i < csvData.length; i++) {

            let date =  String( csvData[i][3] ).slice(4) + '-' + 
                        String( csvData[i][3] ).slice(2, 4) + '-' +
                        String( csvData[i][3] ).slice(0, 2)
            
            date = xtraFunctions.parseDate( date )

            let value = Number( xtraFunctions.addString( csvData[i][10], '.', 15) )
            
            let transaction = {
                id:             0,
                categoryId:     0,
                walletId:       walletId,
                userId:         userId,
                date:           date,
                description:    `${ String(csvData[i][9]).toUpperCase() }, DOC. Nº "${Number(csvData[i][7])}"`,
                extraInfo:      csvData[i][12],
                value:          value,
                creditValue:    csvData[i][11] == 'C' ? value : 0,
                debitValue:     csvData[i][11] == 'D' ? value : 0,
                csvImportId:    `${ csvData[i].toString() }`
            }

            let existingTransaction = await tabTransactions.getTransactionByCsvId( userId, walletId, transaction.csvImportId )
            transaction.alreadyExists = existingTransaction.length > 0 ? true : false

            totalImportedTransactions.push( transaction )

        }

        return totalImportedTransactions
    }
    catch (error) {
        return `Erro 'i-1' >> "${ error }"`
    }

}

async function decodeCsvInter( csvData, userId, walletId ) {

    try {
        let xtraFunctions = require('../extra-functions')
        let totalImportedTransactions = []

        for (let i = 6; i < csvData.length; i++) {

            let date =  String( csvData[i][0] ).slice(6) + '-' + 
                        String( csvData[i][0] ).slice(3, 5) + '-' +
                        String( csvData[i][0] ).slice(0, 2)
            
            date = xtraFunctions.parseDate( date )

            let value = Number( String( csvData[i][2] ).replaceAll('.', '').replace(',', '.') )
            
            let transaction = {
                id:             0,
                categoryId:     0,
                walletId:       walletId,
                userId:         userId,
                date:           date,
                description:    `${ String(csvData[i][1]).toUpperCase() }`,
                extraInfo:      '',
                value:          value >= 0 ? value : value * (-1),
                creditValue:    value > 0 ? value : 0,
                debitValue:     value < 0 ? value * (-1) : 0,
                csvImportId:    `${ csvData[i].toString() }`
            }

            let existingTransaction = await tabTransactions.getTransactionByCsvId( userId, walletId, transaction.csvImportId )
            transaction.alreadyExists = existingTransaction.length > 0 ? true : false

            totalImportedTransactions.push( transaction )

        }

        return totalImportedTransactions
    }
    catch (error) {
        return `Erro 'i-1' >> "${ error }"`
    }

}

async function decodeTxtCef( csvData, userId, walletId ) {

    try {
        let xtraFunctions = require('../extra-functions')
        let totalImportedTransactions = []

        for (let i = 1; i < csvData.length; i++) {

            let date =  String( csvData[i][1] ).slice(0, 4) + '-' + 
                        String( csvData[i][1] ).slice(4, 6) + '-' +
                        String( csvData[i][1] ).slice(6, 8)
            
            date = xtraFunctions.parseDate( date )

            let value = Number( csvData[i][4] )
            
            let transaction = {
                id:             0,
                categoryId:     0,
                walletId:       walletId,
                userId:         userId,
                date:           date,
                description:    `${ String(csvData[i][2]).toUpperCase() } - ${ String(csvData[i][3]).toUpperCase() }`,
                extraInfo:      '',
                value:          value,
                creditValue:    String(csvData[i][5]).toUpperCase() == 'C' ? value : 0,
                debitValue:     String(csvData[i][5]).toUpperCase() == 'D' ? value : 0,
                csvImportId:    `${ csvData[i].toString() }`
            }

            let existingTransaction = await tabTransactions.getTransactionByCsvId( userId, walletId, transaction.csvImportId )
            transaction.alreadyExists = existingTransaction.length > 0 ? true : false

            totalImportedTransactions.push( transaction )

        }

        return totalImportedTransactions
    }
    catch (error) {
        return `Erro 'i-1' >> "${ error }"`
    }

}

module.exports = router;