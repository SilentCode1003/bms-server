'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cash_request', {
      cr_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      cr_reference_id: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      cr_cv_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cr_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      cr_team_lead: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      cr_employee: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      cr_employee_id: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      cr_department: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      cr_position: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      cr_amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      cr_request_date: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      cr_status: {
        type: Sequelize.ENUM('pending', 'approved', 'completed', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('cash_request');
  }
};
