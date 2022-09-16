const relationship = {};

relationship.tabTransactions = require('./transactions/transactions');
relationship.tabCategories = require('./categories/categories');
relationship.tabWallets = require('./wallets/wallets')

relationship.tabCategories.hasMany( relationship.tabTransactions, { foreignKey: 'categoryId', as: 'thisCategoryTransactions' } );
relationship.tabTransactions.belongsTo( relationship.tabCategories, { foreignKey: 'categoryId', as: 'fromCategory' } );
relationship.tabTransactions.belongsTo( relationship.tabWallets, { foreignKey: 'walletId', as: 'fromWallet' } );

module.exports = relationship;