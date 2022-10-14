// Here are the functions to handle each endpoint
const transactionsServices = require('./transactions-services');

var express = require('express');
var router = express.Router();

router.get('/', listTransactions);
router.get('/:id', listById); // Search transaction by ID
router.post('/', saveTransaction); // Create new transaction
router.put('/:id', editTransaction); // Update transaction
router.delete('/:id', deleteTransaction); // Delete category

router.get('/fromUser/:userId', async () => { // Gte user transactions grouped by date

});

function listTransactions( req, res, next ) {
    // Query strings
    // userid: Number; -> If assigned will get all transactions from that user
    // search: String; -> If assigned will try to find records that match the "search" parameter value

    let queryOptions = {
        userId: req.query.userid,
        walletId: req.query.walletid,
        searchString: req.query.search,
        startDate: req.query.start,
        endDate: req.query.end,
        groupByDate: req.query.groupdate
    }
    
    transactionsServices.getTransactionsByText( queryOptions )
    .then( result => res.json( result ) )
    .catch( next );
}

function listById(req, res, next) {
    
    transactionsServices.getTransactionById( req.params.id )
        .then( function( promiseResult ) {
            if ( !promiseResult ) {
                res.status(400).json( {
                    error: true,
                    message: `Transaction not found!`
                } )
            }
            
            res.status(200).json( promiseResult );
        } )
        .catch ( next );
}

function saveTransaction( req, res, next ) {

    transactionsServices.insertNewTransaction( req.body )
        .then( promiseResult => {
            
            res.status(200).json( promiseResult );

        })
        .catch( error => {
            res.status(500).send( error )
        });
}

async function editTransaction( req, res, next ) {
    
    try {
        req.body.id = req.params.id;

        let response = await transactionsServices.editTransaction( req.body )

        res.status(200).send( response )
    }
    catch ( e ) {
        res.status(500).send( e )
    }
    
}

async function deleteTransaction(req, res, next) {

    try {
        let response = await transactionsServices.deleteTransaction( req.params.id )

        res.status(200).send( response )
    }
    catch ( e ) {
        res.status(500).send( e )
    }

}

module.exports = router;