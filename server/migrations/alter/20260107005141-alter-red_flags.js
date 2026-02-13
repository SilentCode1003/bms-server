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
    // await queryInterface.addColumn('red_flags', 'rf_nba2k26', {
    //   type: Sequelize.STRING(300),
    //   allowNull: true,
    // });
    
    await queryInterface.addColumn('red_flags', 'rf_approval_status', {
      type: Sequelize.ENUM('','PENDING', 'APPLIED', 'REJECTED'),
      allowNull: true,
    });
    await queryInterface.addColumn('red_flags', 'rf_updated_by', {
      type: Sequelize.STRING(300),
      allowNull: true,
    });
    await queryInterface.addColumn('red_flags', 'rf_updated_date', {
      type: Sequelize.STRING(20),
      allowNull: true,
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
