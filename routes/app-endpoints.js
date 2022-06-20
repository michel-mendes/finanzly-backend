var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var { appDirectories } = require('../app');

router.get('/', function(req, res, next) {
    res.redirect( '/app/login' )
})

router.get('/dashboard', function(req, res, next) {
    console.log('Usuário logado? - ' + JSON.stringify(req.session, ' ', 4));
    
    if ( !req.session.loggedin ) {
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
    authenticateUser // Second middleware
)

function authenticateUser(req, res) {
    let userServ = require('../database/models/users/users-services');
        
    userServ.authenticateUser( req.body.userIdentification, req.body.password )
        .then( result => {
            let user = result;

            if ( user.error ) {
                res.json( user );
            }
            else {
                res.locals.username = user.userName;
                // res.locals.firstName = user.firstName;
                // res.locals.userEmail = user.email;

                req.session.loggedin = true;
                req.session.username = res.locals.username;

                res.json({
                    error: false,
                    message: 'Login efetuado com sucesso!'
                });
            }
        })
        .catch( reason => {
            console.log('Iniciando .catch');
            
            res.sendStatus(401).json({
                error: true,
                message: 'Erro!'
            });
        });
}

module.exports = router;