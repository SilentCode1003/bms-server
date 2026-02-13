'use strict';
//npx sequelize-cli db:seed --seed 20251127004322-master_mode_of_transportation.js
//npx sequelize-cli seed:generate --name master-mode-of-transportation

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('master_mode_of_transportation', [{
        mmot_name: 'BUS',
        mmot_status: 'Active'
      },{
        mmot_name: 'JEEP',
        mmot_status: 'Active'
      },{
        mmot_name: 'MODERN JEEPNEY',
        mmot_status: 'Active'
      },{
        mmot_name: 'FX / UV EXPRESS',
        mmot_status: 'Active'
      },{
        mmot_name: 'TAXI',
        mmot_status: 'Active'
      },{
        mmot_name: 'MOTORCYCLE',
        mmot_status: 'Active'
      },{
        mmot_name: 'TRICYCLE',
        mmot_status: 'Active'
      },{
        mmot_name: 'PEDICAB',
        mmot_status: 'Active'
      },{
        mmot_name: 'TRAIN (LRT/MRT/PNR)',
        mmot_status: 'Active'
      },{
        mmot_name: 'FERRY / BOAT',
        mmot_status: 'Active'
      },{
        mmot_name: 'RORO',
        mmot_status: 'Active'
      },{
        mmot_name: 'AIRPLANE',
        mmot_status: 'Active'
      },{
        mmot_name: 'PRIVATE CAR',
        mmot_status: 'Active'
      },{
        mmot_name: 'BICYCLE',
        mmot_status: 'Active'
      },{
        mmot_name: 'WALKING',
        mmot_status: 'Active'
      }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
