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
    await queryInterface.createTable('liquidation_activity', {
      lia_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      lia_liquidation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'liquidation',
          key: 'l_id',
        },
      },
      lia_action: {
        type: Sequelize.ENUM('PREPARED','NOTED','CHECKED','APPROVED','REJECTED'),
        allowNull: false,
      },
      lia_remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      lia_receipts: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      lia_created_at: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      lia_created_by: {
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
