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
    await queryInterface.createTable('cash_request_activity', {
      cra_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      cra_cash_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cash_request',
          key: 'cr_id',
        },
      },
      cra_action: {
        type: Sequelize.ENUM('REQUESTED','APPROVED','RECEIVED','REJECTED'),
        allowNull: false,
      },
      cra_remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cra_created_at: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      cra_requested_by: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
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
