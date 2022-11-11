const Joi = require('joi');
const validateRequest = require('../../request-validator.js');

// Here are the functions to handle each endpoint
const walletServices = require('./wallets-services.js');

var express = require('express');
// const { tabUsers, tabWallets } = require('../association.user-wallet.js');
var router = express.Router();

router.get('/', listAllWallets); // List all wallets
router.get('/:id', listById); // Search wallet by ID
router.post('/', saveWallet); // Create new wallet
router.put('/:id', editWallet); // Update user
router.delete('/:id', deleteWallet); // Delete user

router.get('/user/:userId', (req, res, next) => {
    
    walletServices.getWalletsFromUser( req.params.userId )
        .then( ( result ) => { res.json( result ) } )
        .catch( next );

})

function listAllWallets(req, res, next) {
    // Query strings:
    // accociate: Boolean; -> If assigned will show the user owner of the wallet

    walletServices.getAllWallets( req.query.associate )
        .then( function ( result ) {
            res.json( result );
        })
        .catch ( next );
}

function listById(req, res, next) {
    
    walletServices.getWalletById( req.params.id )
        .then( function( promiseWallet ) {
            // if ( !promiseWallet ) {
            //     res.status(400).json( {
            //         error: true,
            //         message: `Wallet not found!`
            //     } )
            // }
            
            res.status(200).json( promiseWallet );
        } )
        .catch ( next );
}

function saveWallet( req, res, next ) {

    if ( !req.body.userId ) { req.body.userId = req.session.userId };
    
    walletServices.insertNewWallet( req.body )
        .then( function ( promiseResult ) {
            
            if (promiseResult.error) {
                res.status(500).json( promiseResult.message );
            }
            else {
                res.status(200).json( promiseResult );
            }

        })
        .catch( next );
}

function editWallet( req, res, next ) {
    
    if ( !req.body.userId ) { req.body.userId = req.session.userId };
    
    req.body.id = req.params.id;

    walletServices.editWallet( req.body )
        .then( function ( promiseResult ) {
            
            if (promiseResult.error) {
                res.status(500).json( promiseResult.message );
            }
            else {
                res.status(200).json( promiseResult );
            }

        })
        .catch( next );
}

function deleteWallet(req, res, next) {

    walletServices.deleteWallet( req.params.id )
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