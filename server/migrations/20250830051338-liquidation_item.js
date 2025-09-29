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
    await queryInterface.createTable('liquidation_item', {
      li_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      li_liquidation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'liquidation',
          key: 'l_id',
        },
      },
      li_date: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      li_rt: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      li_store_name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      li_particulars: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      li_from: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      li_to: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      li_mode_of_transportation: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      li_amount: {
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
  }
};
