'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('master_purpose', {
      mp_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mp_code: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      mp_name: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      mp_type: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      mp_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      mp_status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
      },
    });

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
