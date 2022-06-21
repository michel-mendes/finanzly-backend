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
    
    res.render( 'main-page', {
        userName: req.session.userName,
        firstName: req.session.userFirstName,
        email: req.session.userEmail
    });
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
                res.locals.firstName = user.firstName;
                res.locals.userEmail = user.email;

                req.session.loggedIn = true;
                req.session.userName = res.locals.username;
                req.session.userFirstName = res.locals.firstName;
                req.session.userEmail = res.locals.userEmail;

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