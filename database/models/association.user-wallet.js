const seuqelize = require('../database-controller');

const relationship = {};

relationship.tabUsers = require('./users/users');
relationship.tabWallets = require('./wallets/wallets');
relationship.tabTransactions = require('./transactions/transactions')

relationship.tabUsers.hasMany( relationship.tabWallets, { foreignKey: 'userId', as: 'userWallets' } );
relationship.tabWallets.hasMany( relationship.tabTransactions, { foreignKey: 'walletId', as: 'walletTransactions' } )
relationship.tabWallets.belongsTo( relationship.tabUsers, { foreignKey: 'userId', as: 'fromUser' } );

module.exports = relationship;