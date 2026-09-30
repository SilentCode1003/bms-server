"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("cash_request", "cr_request_type", {
      type: Sequelize.ENUM("BUDGET", "TRAVEL EXPENSES"),
      allowNull: true,
      after: "cr_request_date",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("cash_request", "cr_request_type");
  },
};
