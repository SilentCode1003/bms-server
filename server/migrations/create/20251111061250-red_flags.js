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
    await queryInterface.createTable('red_flags', {
      rf_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      rf_liquidation_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'liquidation',
          key: 'l_id',
        },
      },
      rf_liquidation_item_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'liquidation_item',
          key: 'li_id',
        },
      },
      rf_from: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      rf_to: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      rf_mode_of_transportation: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      rf_min_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      rf_max_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      rf_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      rf_created_by: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      rf_created_date: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      rf_status: {
        type: Sequelize.ENUM('MINIMUM', 'MAXIMUM', ''),
        allowNull: false,
      },
      rf_approval_status: {
        type: Sequelize.ENUM('PENDING', 'APPLIED', 'REJECTED'),
        allowNull: false,
      },
      rf_updated_by: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      rf_updated_date: {
        type: Sequelize.STRING(20),
        allowNull: true,
      }
    });
    
    // await queryInterface.addColumn('red_flags', 'rf_approval_status', {
    //   type: Sequelize.ENUM('','PENDING', 'APPLIED', 'REJECTED'),
    //   allowNull: true,
    // });
    // await queryInterface.addColumn('red_flags', 'rf_updated_by', {
    //   type: Sequelize.STRING(300),
    //   allowNull: true,
    // });
    // await queryInterface.addColumn('red_flags', 'rf_updated_date', {
    //   type: Sequelize.STRING(20),
    //   allowNull: true,
    // });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('red_flags');
  }
};
