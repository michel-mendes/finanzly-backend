const transactionsServices = require('./transactions-services');
const tabWallets = require('../wallets/wallets-services')

var express = require('express');
var router = express.Router();

router.get('/', generateTransactionsReport);

async function generateTransactionsReport( req, res, next ) {
    
    let result = await transactionsServices.generateTransactionsReport( req.session.userId, req.query.walletId, req.query.start, req.query.end )
    
    res.send( result )

}

module.exports = router;