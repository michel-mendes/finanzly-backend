'use strict';

module.exports = {
  async up (queryInterface, DataTypes) {
    return await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      userName: {
        allowNull: false,
				unique: true,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    });
  },

  async down (queryInterface, DataTypes) {
    return await queryInterface.dropTable('users');
  }
};
