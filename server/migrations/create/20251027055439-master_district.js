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
    await queryInterface.createTable('master_district', {
      md_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      md_store_number: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      md_store_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      md_region: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      md_city_province: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      md_status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
      }
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
