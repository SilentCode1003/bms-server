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
    await queryInterface.createTable('liquidation', {
      l_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      l_cr_reference_id: {
        type: Sequelize.STRING(120),
        allowNull: false,
        references: {
          model: 'cash_request',
          key: 'cr_reference_id',
        },
      },
      l_description: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      l_amount_obtained: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      l_amount_expended: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      l_reimburse_return: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      l_created_date: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      l_status: {
        type: Sequelize.ENUM('pending', 'approved', 'verified', 'completed', 'incomplete', 'rejected'),
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
