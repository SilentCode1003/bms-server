'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('master_route_access', {
      mra_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
      },
      mra_access_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      },
      mra_name: {
      type: Sequelize.STRING(300),
      allowNull: false
      },
      mra_status: {
      type: Sequelize.STRING(300),
      allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
