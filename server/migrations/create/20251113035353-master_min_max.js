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
    await queryInterface.createTable('master_min_max', {
      mmm_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mmm_from: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      mmm_to: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      mmm_mode_of_transportation: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      mmm_min_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      mmm_max_amount: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable('master_min_max');
  }
};
