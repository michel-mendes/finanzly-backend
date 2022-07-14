var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
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

router.post( '/authenticate', bodyParser.urlencoded(), authenticateUser );

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

router.get('/transactions', (req, res, next) => {
    if ( !req.session.loggedIn ) {
        res.redirect( '/app/login' )
    }
    else {
        
        // Retrieves the wallet in which the user recorded the last transaction
        if ( !req.session.selectedWallet ) {
            req.session.selectedWallet = -1;
        }
        
        res.render('./pages/transactions-listing', { selectedWallet: req.session.selectedWallet });
    }
});

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
}

module.exports = router;