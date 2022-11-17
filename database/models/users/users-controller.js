const Joi = require('joi');
const validateRequest = require('../../request-validator.js');

// Here are the functions to handle each endpoint
const userServices = require('./users-services.js');

var express = require('express');
var router = express.Router();

router.get('/', listAllUsers); // List all users
router.get('/:id', listById); // Search user by ID
router.post('/', validateUserRequest, saveUser); // Create new user
router.put('/:id', editUser); // Update user
router.delete('/:id', deleteUser); // Delete user

router.post('/authenticate', authUser); // User authentication

function validateUserRequest(req, res, next) {
    
    const newUserSchema = Joi.object({
        firstName:  Joi.string().required(),
        userName:   Joi.string().required(),
        email:      Joi.string().required(),
        password:   Joi.string().min(6).required()
    });

    validateRequest(req, res, next, newUserSchema);
}

function authUser( req, res, next ) {
    
    userServices.authenticateUser( req.body.userIdentification, req.body.password )
        .then( function( result ) {
            res.json( result );
        } )
        .catch ( next );
}

function saveUser( req, res, next ) {

    userServices.insertNewUser( req.body )
        .then( function ( promiseResult ) {
            
            if (promiseResult.error) {
                res.status(400).json( promiseResult );
            }
            else {
                if ( promiseResult.password ) {
                    promiseResult.password = ""; // Delete the field 'password' from server response
                }

                res.status(200).json( promiseResult );
            }

        })
        .catch( next );
}

function editUser( req, res, next ) {
    
    console.log('Chegooou')
    console.log(req.body)
    req.body.id = req.params.id;

    userServices.editUser( req.body )
        .then( function ( promiseResult ) {
            
            if (promiseResult.error) {
                res.status(400).json( promiseResult );
            }
            else {
                if ( promiseResult.password ) {
                    promiseResult.password = ""; // Delete the field 'password' from server response
                }

                res.status(200).json( promiseResult );
            }

        })
        .catch( next );
}

function listAllUsers(req, res, next) {
    // Query strings
    // name: String; -> If assinged will use 'name' as search term under 'users.firstName' field
    // email: String; -> If assinged will use 'email' as search term under 'users.email' field
    // associate: any; -> If assinged will this user wallets
    
    if ( req.query.name ) {
        userServices.getUsersByName( req.query.name )
        .then(function( promiseUsers ) {
            res.json( promiseUsers );
        })
        .catch( next );
    }
    else if ( req.query.email ) {
        userServices.getUserByEmail( req.query.email )
        .then(function( promiseUsers ) {
            res.json( promiseUsers );
        })
        .catch( next );
    }
    else {
        userServices.getAllUsers( req.query.associate )
            .then(function( promiseUsers ) {
                res.json( promiseUsers );
            })
            .catch( next );
    }
}

function listById(req, res, next) {
    
    userServices.getUserById( req.params.id )
        .then( function( promiseUser ) {
            if ( !promiseUser ) {
                res.status(400).json( {
                    error: true,
                    message: `User with ID ${req.params.id} not found!`
                } )
            }
            
            res.status(200).json( promiseUser );
        } )
        .catch ( next );
}

function deleteUser(req, res, next) {

    userServices.deleteUser( req.params.id )
        .then( function ( deleteResult ) { 
            if ( deleteResult.error ) {
                res.status(400).json( deleteResult );
            }
            else {
                res.json( deleteResult );
            }
        } )
        .catch( next );

}

module.exports = router;