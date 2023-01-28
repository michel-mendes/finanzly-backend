const Sequelize = require('sequelize');
const database = require('../../database-controller');

const Category = database.define('categories', {
    id:                 {
                            type: Sequelize.INTEGER,
                            primaryKey: true
                        },
    // walletId:           Sequelize.INTEGER,
    userId:             Sequelize.INTEGER,
    name:               Sequelize.STRING,
    transactionType:    Sequelize.STRING,
    iconPath:           Sequelize.STRING
});

module.exports = Category;