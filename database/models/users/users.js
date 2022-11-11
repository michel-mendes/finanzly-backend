const Sequelize = require('sequelize');
const database = require('../../database-controller');
//const tabWallets = require('../wallets/wallets')

const originalUserScope = {
    id: {
                type: Sequelize.INTEGER,
                primaryKey: true
    },
    firstName:  Sequelize.STRING,
    userName:   Sequelize.STRING,
    email:      Sequelize.STRING,
    password:   Sequelize.STRING,
    dashboardWalletId: Sequelize.INTEGER,
    transactionsSelectedWalletId: Sequelize.INTEGER
}

const User = database.define('users', originalUserScope, {
    defaultScope: {
        attributes: {exclude: 'password'}
    },
    scopes: {
        fullScope : originalUserScope
    }
});

//console.log(database)
//User.hasMany( tabWallets, { foreignKey: 'userId',as: 'userWallets' } );

module.exports = User;