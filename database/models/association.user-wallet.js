const seuqelize = require('../database-controller');

const relationship = {};

relationship.tabUsers = require('./users/users');
relationship.tabWallets = require('./wallets/wallets');

relationship.tabUsers.hasMany( relationship.tabWallets, { foreignKey: 'userId', as: 'userWallets' } );
relationship.tabWallets.belongsTo( relationship.tabUsers, { foreignKey: 'userId', as: 'fromUser' } );

module.exports = relationship;