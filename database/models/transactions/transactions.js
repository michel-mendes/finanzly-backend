const Sequelize = require('sequelize');
const database = require('../../database-controller');

const Transaction = database.define('transactions', {
    id:             {
                        type: Sequelize.INTEGER,
                        primaryKey: true
                    },
    categoryId:     Sequelize.INTEGER,
    walletId:       Sequelize.INTEGER,
    date:           Sequelize.DATE,
    description:    Sequelize.STRING,
    extraInfo:      Sequelize.STRING,
    value:          Sequelize.DOUBLE,
    creditValue:    Sequelize.DOUBLE,
    debitValue:     Sequelize.DOUBLE,
    csvImportId:    Sequelize.STRING
});

module.exports = Transaction;