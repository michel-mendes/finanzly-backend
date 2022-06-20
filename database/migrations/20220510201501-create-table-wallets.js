'use strict';

module.exports = {
  async up (queryInterface, DataTypes) {
    return await queryInterface.createTable('wallets', {
      id: {
        type:           DataTypes.INTEGER,
        primaryKey:     true,
        allowNull:      false,
        autoIncrement:  true
      },
      userId: {
          type:           DataTypes.INTEGER,
          allowNull:      false,
          references: {
            model: 'users',
            key: 'id'
          }
      },
      name: {
          type:           DataTypes.STRING,
          allowNull:      false
      },
      currencySymbol: {
          type:           DataTypes.STRING,
          allowNull:      false
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
    return await queryInterface.dropTable('wallets');
  }
};
