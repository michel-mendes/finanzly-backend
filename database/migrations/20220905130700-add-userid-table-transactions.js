'use strict';

module.exports = {
  async up (queryInterface, DataTypes) {
    return await queryInterface.addColumn('transactions', 'userId', {
      type: DataTypes.INTEGER
      });
  },

  async down (queryInterface, DataTypes) {
    return await queryInterface.removeColumn('transactions', 'userId');
  }
};
