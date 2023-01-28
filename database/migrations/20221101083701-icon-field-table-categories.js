'use strict';

module.exports = {
  async up (queryInterface, DataTypes) {
    return await queryInterface.addColumn('categories', 'iconPath', {
      type: DataTypes.STRING
      });
  },

  async down (queryInterface, DataTypes) {
    return await queryInterface.removeColumn('categories', 'iconPath');
  }
};
