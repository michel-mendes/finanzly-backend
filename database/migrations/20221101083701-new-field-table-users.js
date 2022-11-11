'use strict';

module.exports = {
  async up (queryInterface, DataTypes) {
    return await Promise.all([
      queryInterface.addColumn('users', 'dashboardWalletId', {
        type: DataTypes.INTEGER,
      }),
      queryInterface.addColumn('users', 'transactionsSelectedWalletId', {
        type: DataTypes.INTEGER,
      })
    ])
    
    // return await queryInterface.addColumn('users', 'dashboardWalletId', {
    //     type: DataTypes.INTEGER,
    //   }
    // );

  },

  async down (queryInterface, DataTypes) {
    return await Promise.all([
      queryInterface.removeColumn('users', 'dashboardWalletId'),
      queryInterface.removeColumn('users', 'transactionsSelectedWalletId')
    ])
    
    // return await queryInterface.removeColumn('users', 'dashboardWalletId');
  }
};
