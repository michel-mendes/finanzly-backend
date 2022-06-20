var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var { appDirectories } = require('../app');

router.get('/', function(req, res, next) {
    res.redirect( '/app/login' )
})

router.get('/dashboard', function(req, res, next) {
    if ( !req.session.loggedIn ) {
        res.redirect( '/app/login' )
    }
    
    res.render( 'main-page', {userName: req.query.un, firstName: 'uai so'});
})

router.get('/login', function(req, res, next) {
    res.render(`login`);
});

router.get('/registration', function(req, res, next) {
    res.sendFile(`./registration.html`, {root: appDirectories.viewsDirectory})
});

router.get('/registration/success', function(req, res, next) {
    res.sendFile(`./registration-success.html`, {root: appDirectories.viewsDirectory})
});

router.post( '/authenticate',
    bodyParser.urlencoded(), //First middleware
    authenticateUser, // Second middleware
    authSuccess // Last middleware
)

function authenticateUser(req, res, next) {
    let userServ = require('../database/models/users/users-services');
        
    userServ.authenticateUser( req.body.userIdentification, req.body.password )
        .then( result => {
            console.log('Iniciando');
            let user = result;

            if ( user.error ) {
                res.json( user );
            }
                
            res.locals.username = user.userName;
            // res.locals.firstName = user.firstName;
            // res.locals.userEmail = user.email;

            next(req, res, user);
        })
        .catch( reason => {
            res.sendStatus(401).json({
                error: true,
                message: 'Erro!'
            });
        });
}

function authSuccess(req, res, userData) {
    req.session.loggedIn = true;
    req.session.username = res.locals.username;

    // console.log('Registro de sessão -> ' + JSON.stringify(req.session, ' ', 4));

    
    //res.render( 'main-page', {userName: req.session.username, firstName: 'teste'} );
    //res.render( 'main-page' );

    res.json({message: 'Login efetuado com sucesso!'});
}

module.exports = router;