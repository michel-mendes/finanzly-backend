'use strict';

module.exports = {
  async up (queryInterface, DataTypes) {
    return await queryInterface.createTable('transactions', {
      id: {
          type:           DataTypes.INTEGER,
          primaryKey:     true,
          allowNull:      false,
          autoIncrement:  true
      },
      categoryId: {
          type:           DataTypes.INTEGER,
          allowNull:      false,
          references: {
            model: 'categories',
            key: 'id'
          }
      },
      walletId: {
          type:           DataTypes.INTEGER,
          allowNull:      false,
          references: {
            model: 'wallets',
            key: 'id'
          }
      },
      date: {
          type:           DataTypes.DATE,
          allowNull:      false,
          defaultValue:   DataTypes.NOW
      },
      description: {
          type:           DataTypes.STRING,
          allowNull:      false
      },
      extraInfo: {
          type:           DataTypes.STRING
      },
      value: {
          type:           DataTypes.DOUBLE,
          allowNull:      false,
          comment:        "This is the value entered by the user"
      },
      creditValue: {
          type:           DataTypes.DOUBLE,
          comment:        "(category.transaction_type == 'c') ? credit_value = ${value} : credit_value = null"
      },
      debitValue: {
          type:           DataTypes.DOUBLE,
          comment:        "(category.transaction_type == 'd') ? debit_value = ${value} : debit_value = null"
      },
      csvImportId: {
          type:           DataTypes.STRING,
          comment:        "Used only when importing from CSV files"
      },
      createdAt: {
        type:             DataTypes.DATE
      },
      updatedAt: {
        type:             DataTypes.DATE
      }
    });
  },

  async down (queryInterface, DataTypes) {
    return await queryInterface.dropTable('transactions');
  }
};
