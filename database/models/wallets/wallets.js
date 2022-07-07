const Sequelize = require('sequelize');
const database = require('../../database-controller');

const Wallet = database.define('wallets', {
    id:             {
                      type: Sequelize.INTEGER,
                      primaryKey: true
                    },
    userId:         Sequelize.INTEGER,
    name:           Sequelize.STRING,
    currencySymbol: Sequelize.STRING,
    balance:        Sequelize.DOUBLE
});

// Relashionship "userId"
//Wallet.belongsTo( database.models.users, { foreignKey: 'userId', as: 'userOwner' } );

module.exports = Wallet;