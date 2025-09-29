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
    await queryInterface.createTable('master_wallet_activity', {
      mwa_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mwa_wallet_id: {
        type: Sequelize.INTEGER,  
        references: {
          model: 'master_wallet',
          key: 'mw_id',
        },
      },
      mwa_action: {
        type: Sequelize.TEXT,
      },
      mwa_date: {
        type: Sequelize.STRING(20),
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
