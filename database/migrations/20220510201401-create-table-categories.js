'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.createTable('categories', {
      id: {
        type:           Sequelize.INTEGER,
        primaryKey:     true,
        allowNull:      false,
        autoIncrement:  true
      },
      userId: {
        type:           Sequelize.INTEGER,
        allowNull:      false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      name: {
        type:           Sequelize.STRING,
        allowNull:      false
      },
      transactionType: {
        type:           Sequelize.STRING,
        allowNull:      false,
        comment:        'Transaction types:\n\nc - credit (money in)\nd - debit (money out)'
      },
      createdAt: {
        type:           Sequelize.DATE
      },
      updatedAt: {
        type:           Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.dropTable('categories');
  }
};
