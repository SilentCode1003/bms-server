"use strict";
//npx sequelize-cli db:seed --seed 20250530052136-master_route_access.js
//npx sequelize-cli seed:generate --name master-route-access
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const names = [
      "employee_request",
      "approved_request",
      "rejected_request",
      "employee_liquidation",
      "liquidated_request",
      "completed_request",
      "view_cash_request",
      "view_liquidation_form",
      "teamlead_pendings",
      "my_approvals",
      "rejected_requests",
      "liquidation_review",
      "liquidation_reviewed",
      "reject_liquidations",
      "lead_history",
      "cash_approval_form",
      "liquid_approval_form",
      "finance_dashboard",
      "finance_processing",
      "finance_released",
      "finance_rejected",
      "finance_verify",
      "finance_verified",
      "finance_rejected_liquidations",
      "finance_liquid_form",
      "finance_approval_form",
      "budget_allocation",
      "revolving_fund",
      "cash_disbursement",
      "finance_history",
      "red_tagging",
      "final_approval",
      "all_request",
      "users",
      "access",
      "liquidation_form",
      "admin_liquid_form",
      "completed_liquidations",
      "admin_reject_liquidations",
      "stores",
      "store_routes",
      "transport",
      "particulars",
      "reporting"
    ];

    const adminExcluded = ["route_access", "dashboard", "generate_reports"];
    const adminNames = names.filter((name) => !adminExcluded.includes(name));

    await queryInterface.bulkInsert(
      "master_route_access",
      [
        ...names.map((name, idx) => ({
          mra_id: adminNames.length + names.length + idx + 1,
          mra_access_id: 10,
          mra_name: name,
          mra_status: (name === "employee_request" || name === "employee_liquidation" || name === "view_cash_request" || name === "view_liquidation_form") ? "Full Access" : "No Access",
        })),
        ...names.map((name, idx) => ({
          mra_id: adminNames.length + names.length * 2 + idx + 1,
          mra_access_id: 11,
          mra_name: name,
          mra_status: "Full Access",
        })),
        ...names.map((name, idx) => ({
          mra_id: adminNames.length + names.length * 3 + idx + 1,
          mra_access_id: 12,
          mra_name: name,
          mra_status: (name === "final_approval" || name === "completed_liquidations" || name === "admin_reject_liquidations" || name === "all_request" || name === "liquidation_form" || name === "admin_liquid_form") ? "Full Access" : "No Access",
        })),
        ...names.map((name, idx) => ({
          mra_id: adminNames.length + names.length * 4 + idx + 1,
          mra_access_id: 13,
          mra_name: name,
          mra_status: (name === "teamlead_pendings" || name === "my_approvals" || name === "rejected_requests" || name === "liquidation_review" || name === "liquidation_reviewed" || name === "reject_liquidations" || name === "cash_approval_form" || name === "liquid_approval_form") ? "Full Access" : "No Access",
        })),
        ...names.map((name, idx) => ({
          mra_id: adminNames.length + names.length * 5 + idx + 1,
          mra_access_id: 20,
          mra_name: name,
          mra_status: (name === "finance_dashboard" || name === "budget_allocation" || name === "revolving_fund" || name === "cash_disbursement" || name === "finance_history" || name === "finance_processing" || name === "finance_released" || name === "finance_rejected" || name === "finance_verify" || name === "finance_verified" || name === "finance_rejected_liquidations" || name === "finance_liquid_form" || name === "finance_approval_form") ? "Full Access" : "No Access",
        })),
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("master_route_access", null, {});
  },
};
