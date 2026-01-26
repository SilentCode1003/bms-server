'use strict';
//npx sequelize-cli db:seed --seed 20260105032528-master_purpose.js
//npx sequelize-cli seed:generate --name master_purpose
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('master_purpose', [
      { mp_code: '100-1102', mp_name: 'Petty Cash', mp_type: 'Assets', mp_description: 'Revolving Fund', mp_status: 'INACTIVE' },
      { mp_code: '100-1101', mp_name: 'Cash On Hand', mp_type: 'Assets', mp_description: 'Cash On Hand', mp_status: 'INACTIVE' },
      { mp_code: '100-1201', mp_name: 'Cash in Bank - BPI 5915', mp_type: 'Assets', mp_description: 'Cash in Bank', mp_status: 'INACTIVE' },
      { mp_code: '100-1202', mp_name: 'Cash in Bank - EastWest Bank 8877', mp_type: 'Assets', mp_description: 'Cash in Bank', mp_status: 'INACTIVE' },
      { mp_code: '100-1203', mp_name: 'Cash in Bank - Sterling Bank 4929', mp_type: 'Assets', mp_description: 'Cash in Bank', mp_status: 'INACTIVE' },
      { mp_code: '100-1204', mp_name: 'Cash in Bank - Security Bank 4522', mp_type: 'Assets', mp_description: 'Cash in Bank', mp_status: 'INACTIVE' },
      { mp_code: '100-1205', mp_name: 'Cash in Bank - Metrobank 4929', mp_type: 'Assets', mp_description: 'Cash in Bank', mp_status: 'INACTIVE' },
      { mp_code: '100-1299', mp_name: 'Cash Clearing Account', mp_type: 'Assets', mp_description: 'Temporary clearing account', mp_status: 'INACTIVE' },
      { mp_code: '100-2101', mp_name: 'Accounts Receivables', mp_type: 'Assets', mp_description: 'Accounts Receivables', mp_status: 'INACTIVE' },
      { mp_code: '100-2201', mp_name: 'Advances to Officers and Employees', mp_type: 'Assets', mp_description: 'Advances to Officers and Employees', mp_status: 'INACTIVE' },
      { mp_code: '100-3000', mp_name: 'Inventory', mp_type: 'Assets', mp_description: 'Inventory', mp_status: 'INACTIVE' },
      { mp_code: '100-4000', mp_name: 'Input VAT', mp_type: 'Assets', mp_description: 'Input VAT', mp_status: 'INACTIVE' },
      { mp_code: '100-4100', mp_name: 'Creditable Withholding Tax', mp_type: 'Assets', mp_description: 'Creditable Withholding Tax', mp_status: 'INACTIVE' },
      { mp_code: '100-4200', mp_name: 'Prepaid Expenses', mp_type: 'Assets', mp_description: 'Prepaid Expenses', mp_status: 'INACTIVE' },
      { mp_code: '100-4210', mp_name: 'Prepaid Income Tax', mp_type: 'Assets', mp_description: 'Prepaid Income Tax', mp_status: 'INACTIVE' },
      { mp_code: '100-4300', mp_name: 'Other Current Assets', mp_type: 'Assets', mp_description: 'Other Current Assets', mp_status: 'INACTIVE' },
      { mp_code: '100-7110', mp_name: 'Office Equipment', mp_type: 'Assets', mp_description: 'Office Equipment', mp_status: 'INACTIVE' },
      { mp_code: '100-7120', mp_name: 'Accumulated Depreciation: Office Equipment', mp_type: 'Assets', mp_description: 'Accumulated Depreciation: Office Equipment', mp_status: 'INACTIVE' },
      { mp_code: '100-7210', mp_name: 'Tools and Equipment', mp_type: 'Assets', mp_description: 'Tools and Equipment', mp_status: 'INACTIVE' },
      { mp_code: '100-7220', mp_name: 'Accumulated Depreciation: Tools and Equipment', mp_type: 'Assets', mp_description: 'Accumulated Depreciation: Tools and Equipment', mp_status: 'INACTIVE' },
      { mp_code: '100-7310', mp_name: 'Furniture and Fixtures', mp_type: 'Assets', mp_description: 'Furniture and Fixtures', mp_status: 'INACTIVE' },
      { mp_code: '100-7320', mp_name: 'Accumulated Depreciation: Furniture and Fixtures', mp_type: 'Assets', mp_description: 'Accumulated Depreciation: Furniture and Fixtures', mp_status: 'INACTIVE' },
      { mp_code: '100-7410', mp_name: 'Transportation Equipment', mp_type: 'Assets', mp_description: 'Transportation Equipment', mp_status: 'INACTIVE' },
      { mp_code: '100-7420', mp_name: 'Accumulated Depreciation: Transportation Equipment', mp_type: 'Assets', mp_description: 'Accumulated Depreciation: Transportation Equipment', mp_status: 'INACTIVE' },
      { mp_code: '100-9000', mp_name: 'Other Noncurrent Assets', mp_type: 'Assets', mp_description: 'Other Noncurrent Assets', mp_status: 'INACTIVE' },
      { mp_code: '200-1000', mp_name: 'Accounts Payable', mp_type: 'Liabilities', mp_description: 'Accounts Payable', mp_status: 'INACTIVE' },
      { mp_code: '200-1100', mp_name: 'Accrued Expenses', mp_type: 'Liabilities', mp_description: 'Accrued Expenses', mp_status: 'INACTIVE' },
      { mp_code: '200-1200', mp_name: 'Withholding Tax - Compensation', mp_type: 'Liabilities', mp_description: 'Withholding Tax - Compensation', mp_status: 'INACTIVE' },
      { mp_code: '200-1300', mp_name: 'Withholding Tax - Expanded', mp_type: 'Liabilities', mp_description: 'Withholding Tax - Expanded', mp_status: 'INACTIVE' },
      { mp_code: '200-1400', mp_name: 'Percentage Tax', mp_type: 'Liabilities', mp_description: 'Percentage Tax', mp_status: 'INACTIVE' },
      { mp_code: '200-1500', mp_name: 'Output VAT', mp_type: 'Liabilities', mp_description: 'Output VAT', mp_status: 'INACTIVE' },
      { mp_code: '200-1600', mp_name: 'Income Tax Payable', mp_type: 'Liabilities', mp_description: 'Income Tax Payable', mp_status: 'INACTIVE' },
      { mp_code: '200-1700', mp_name: 'SSS Payable', mp_type: 'Liabilities', mp_description: 'SSS Payable', mp_status: 'INACTIVE' },
      { mp_code: '200-1800', mp_name: 'Philhealth Payable', mp_type: 'Liabilities', mp_description: 'Philhealth Payable', mp_status: 'INACTIVE' },
      { mp_code: '200-1900', mp_name: 'Pag-Ibig Fund Payable', mp_type: 'Liabilities', mp_description: 'Pag-Ibig Fund Payable', mp_status: 'INACTIVE' },
      { mp_code: '200-2000', mp_name: 'Loans Payable', mp_type: 'Liabilities', mp_description: 'Loans Payable', mp_status: 'INACTIVE' },
      { mp_code: '200-2100', mp_name: 'Other Current Liabilities', mp_type: 'Liabilities', mp_description: 'Other Current Liabilities', mp_status: 'INACTIVE' },
      { mp_code: '200-3000', mp_name: 'Other Noncurrent Liabilities', mp_type: 'Liabilities', mp_description: 'Other Noncurrent Liabilities', mp_status: 'INACTIVE' },
      { mp_code: '300-1000', mp_name: "Shareholder's Equity", mp_type: 'Equities', mp_description: "Shareholder's Equity", mp_status: 'INACTIVE' },
      { mp_code: '300-2000', mp_name: 'Retained Earnings', mp_type: 'Equities', mp_description: 'Retained Earnings', mp_status: 'INACTIVE' },
      { mp_code: '400-1000', mp_name: 'Income from Trading', mp_type: 'Revenues', mp_description: 'Income from Trading', mp_status: 'INACTIVE' },
      { mp_code: '400-1100', mp_name: 'Income from Services', mp_type: 'Revenues', mp_description: 'Income from Services', mp_status: 'INACTIVE' },
      { mp_code: '400-2000', mp_name: 'Sales Discounts', mp_type: 'Revenues', mp_description: 'Sales Discounts', mp_status: 'INACTIVE' },
      { mp_code: '400-3000', mp_name: 'Interest Income', mp_type: 'Revenues', mp_description: 'Interest Income', mp_status: 'INACTIVE' },
      { mp_code: '400-4000', mp_name: 'Other Income', mp_type: 'Revenues', mp_description: 'Other Income', mp_status: 'INACTIVE' },
      
      { mp_code: '500-1000', mp_name: 'Cost of Sales', mp_type: 'Expenses', mp_description: 'Cost of Sales', mp_status: 'ACTIVE' },
      { mp_code: '500-1100', mp_name: 'Purchases', mp_type: 'Expenses', mp_description: 'Purchases', mp_status: 'ACTIVE' },
      { mp_code: '500-1200', mp_name: 'Purchase Discounts', mp_type: 'Expenses', mp_description: 'Purchase Discounts', mp_status: 'ACTIVE' },
      { mp_code: '500-1101', mp_name: 'Direct Charges - Salaries, Wages & Benefits', mp_type: 'Expenses', mp_description: 'Direct Charges - Salaries, Wages & Benefits', mp_status: 'INACTIVE' },
      { mp_code: '500-1201', mp_name: 'Direct Charges - Materials, Supplies & Facilities', mp_type: 'Expenses', mp_description: 'Direct Charges - Materials, Supplies & Facilities', mp_status: 'INACTIVE' },
      { mp_code: '500-2101', mp_name: 'Salaries and Wages - Operating', mp_type: 'Expenses', mp_description: 'Salaries and Wages - Operating', mp_status: 'ACTIVE' },
      { mp_code: '500-2102', mp_name: 'SSS, PHIC & Pag-Ibig Contributions', mp_type: 'Expenses', mp_description: 'SSS, PHIC & Pag-Ibig Contributions', mp_status: 'ACTIVE' },
      { mp_code: '500-3101', mp_name: 'Transportation and Travel', mp_type: 'Expenses', mp_description: 'Transportation and Travel', mp_status: 'ACTIVE' },
      { mp_code: '500-3102', mp_name: 'Fuel and Oil', mp_type: 'Expenses', mp_description: 'Fuel and Oil', mp_status: 'ACTIVE' },
      { mp_code: '500-3201', mp_name: 'Communication, Light & Water', mp_type: 'Expenses', mp_description: 'Communication, Light & Water', mp_status: 'ACTIVE' },
      { mp_code: '500-3202', mp_name: 'Meals and Allowances', mp_type: 'Expenses', mp_description: 'Meals and Allowances', mp_status: 'ACTIVE' },
      { mp_code: '500-3203', mp_name: 'Accommodation Expenses', mp_type: 'Expenses', mp_description: 'Hotel accommodation', mp_status: 'ACTIVE' },
      { mp_code: '500-3204', mp_name: 'Representation Expense', mp_type: 'Expenses', mp_description: 'Representation Expense', mp_status: 'ACTIVE' },
      { mp_code: '500-3205', mp_name: 'Professional Fees', mp_type: 'Expenses', mp_description: 'Professional Fees', mp_status: 'ACTIVE' },
      { mp_code: '500-4101', mp_name: 'Rent Expense', mp_type: 'Expenses', mp_description: 'Rent Expense', mp_status: 'ACTIVE' },
      { mp_code: '500-4102', mp_name: 'Office Supplies Expense', mp_type: 'Expenses', mp_description: 'Office Supplies', mp_status: 'ACTIVE' },
      { mp_code: '500-4103', mp_name: 'Medical Expense', mp_type: 'Expenses', mp_description: 'Medical Expense', mp_status: 'ACTIVE' },
      { mp_code: '500-4104', mp_name: 'Repairs and Maintenance - Office', mp_type: 'Expenses', mp_description: 'Repairs and Maintenance - Office', mp_status: 'ACTIVE' },
      { mp_code: '500-4105', mp_name: 'Repairs and Maintenance - Equipment', mp_type: 'Expenses', mp_description: 'Repairs and Maintenance - Equipment', mp_status: 'ACTIVE' },
      { mp_code: '500-4106', mp_name: 'Repairs and Maintenance - Vehicle', mp_type: 'Expenses', mp_description: 'Repairs and Maintenance - Vehicle', mp_status: 'ACTIVE' },
      { mp_code: '500-4107', mp_name: 'Permits & Licenses', mp_type: 'Expenses', mp_description: 'Taxes & Licenses', mp_status: 'ACTIVE' },
      { mp_code: '500-2800', mp_name: 'Bank Charges', mp_type: 'Expenses', mp_description: 'GCash and bank service fees', mp_status: 'ACTIVE' },
      { mp_code: '500-4109', mp_name: 'Miscellaneous Expense', mp_type: 'Expenses', mp_description: 'Miscellaneous Expense', mp_status: 'ACTIVE' },
      
      { mp_code: '500-7100', mp_name: 'Depreciation Expense: Office Equipment', mp_type: 'Expenses', mp_description: 'Depreciation for office equipment', mp_status: 'INACTIVE' },
      { mp_code: '500-7200', mp_name: 'Depreciation Expense: Tools and Equipment', mp_type: 'Expenses', mp_description: 'Depreciation for tools and equipment', mp_status: 'INACTIVE' },
      { mp_code: '500-7300', mp_name: 'Depreciation Expense: Furniture and Fixtures', mp_type: 'Expenses', mp_description: 'Depreciation for furniture and fixtures', mp_status: 'INACTIVE' },
      { mp_code: '500-7400', mp_name: 'Depreciation Expense: Transportation Equipment', mp_type: 'Expenses', mp_description: 'Depreciation for transportation equipment', mp_status: 'INACTIVE' },
      { mp_code: '500-8000', mp_name: 'Income Tax Expense', mp_type: 'Expenses', mp_description: 'Income Tax Expense', mp_status: 'INACTIVE' },
      { mp_code: '500-8100', mp_name: 'Subscription', mp_type: 'Expenses', mp_description: 'Subscription', mp_status: 'ACTIVE' },
      { mp_code: '500-8200', mp_name: 'Postage & Delivery Fee', mp_type: 'Expenses', mp_description: 'PhilPost, Shipping Cost, etc. (Lalamove, Grab, Food Panda)', mp_status: 'ACTIVE' },
    ], {});

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
