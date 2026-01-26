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
    await queryInterface.createTable('master_wallet', {
      mw_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mw_employee_id: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      mw_previous_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      mw_current_amount: {
        type: Sequelize.DECIMAL(12, 2),
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
    await queryInterface.dropTable('master_wallet');
  }
};
