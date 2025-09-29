/*
npx sequelize-cli migration:generate --name master_route_access
npx sequelize-cli migration:generate --name master_wallet
npx sequelize-cli migration:generate --name master_wallet_activity
*/

const Masters = {
    master_route_access: {
        tablename: "master_route_access",
        prefix: "mra_",
        insertColumns: [
            "access_id",
            "name",
            "status",
        ],
        selectColumns: [
            "mra_id",
            "mra_access_id",
            "mra_name",
            "mra_status",
        ],
        selectOptionsColumn: {
            id: "mra_id",
            access_id: "mra_access_id",
            name: "mra_name",
            status: "mra_status",
        },
    },
    master_wallet: {
        tablename: "master_wallet",
        prefix: "mw_",
        insertColumns: [
            "employee_id",
            "previous_amount",
            "current_amount",
        ],
        selectColumns: [
            "mw_id",
            "mw_employee_id",
            "mw_previous_amount",
            "mw_current_amount",
        ],
        selectOptionsColumn: {
            id: "mw_id",
            employee_id: "mw_employee_id",
            previous_amount: "mw_previous_amount",
            current_amount: "mw_current_amount",
        },
    },
    master_wallet_activity: {
        tablename: "master_wallet_activity",
        prefix: "mwa_",
        insertColumns: [
            "wallet_id",
            "action",
            "date",
        ],
        selectColumns: [
            "mwa_id",
            "mwa_wallet_id",
            "mwa_action",
            "mwa_date",
        ],
        selectOptionsColumn: {
            id: "mwa_id",
            wallet_id: "mwa_wallet_id",
            action: "mwa_action",
            date: "mwa_date",
        },
    },
};

module.exports = { Masters };
