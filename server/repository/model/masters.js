/*
npx sequelize-cli migration:generate --name master_route_access
npx sequelize-cli migration:generate --name master_wallet
npx sequelize-cli migration:generate --name master_wallet_activity
npx sequelize-cli migration:generate --name master_district
npx sequelize-cli migration:generate --name master_mode_of_transportation
npx sequelize-cli migration:generate --name master_purpose
npx sequelize-cli migration:generate --name red_flags
npx sequelize-cli migration:generate --name master_min_max
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
    master_district: {
        tablename: "master_district",
        prefix: "md_",
        insertColumns: [
            "store_number",
            "store_name",
            "region",
            "city_province",
            "status",
        ],
        selectColumns: [
            "md_id",
            "md_store_number",
            "md_store_name",
            "md_region",
            "md_city_province",
            "md_status",
        ],
        selectOptionsColumn: {
            id: "md_id",
            store_number: "md_store_number",
            store_name: "md_store_name",
            region: "md_region",
            city_province: "md_city_province",
            status: "md_status",
        },
    },
    master_mode_of_transportation: {
        tablename: "master_mode_of_transportation",
        prefix: "mmot_",
        insertColumns: [
            "name",
            "status",
        ],
        selectColumns: [
            "mmot_id",
            "mmot_name",
            "mmot_status",
        ],
        selectOptionsColumn: {
            id: "mmot_id",
            name: "mmot_name",
            status: "mmot_status",
        },
    },
    master_min_max: {
        tablename: "master_min_max",
        prefix: "mmm_",
        insertColumns: [
            "from",
            "to",
            "mode_of_transportation",
            "min_amount",
            "max_amount"
        ],
        selectColumns: [
            "mmm_id",
            "mmm_from",
            "mmm_to",
            "mmm_mode_of_transportation",
            "mmm_min_amount",
            "mmm_max_amount"
        ],
        selectOptionsColumn: {
            id: "mmm_id",
            from: "mmm_from",
            to: "mmm_to",
            mode_of_transportation: "mmm_mode_of_transportation",
            min_amount: "mmm_min_amount",
            max_amount: "mmm_max_amount"
        },
    },
    master_purpose: {
        tablename: "master_purpose",
        prefix: "mp_",
        insertColumns: [
            "code",
            "name",
            "type",
            "description",
            "status",
        ],
        selectColumns: [
            "mp_id",
            "mp_code",
            "mp_name",
            "mp_type",
            "mp_description",
            "mp_status",
        ],
        selectOptionsColumn: {
            id: "mp_id",
            code: "mp_code",
            name: "mp_name",
            type: "mp_type",
            description: "mp_description",
            status: "mp_status",
        },
    },
    red_flags: {
        tablename: "red_flags",
        prefix: "rf_",
        insertColumns: [
            "liquidation_id",
            "liquidation_item_id",
            "from",
            "to",
            "mode_of_transportation",
            "min_amount",
            "max_amount",
            "amount",
            "created_by",
            "created_date",
            "status",
            "approval_status",
            "updated_by",
            "updated_date",
        ],
        selectColumns: [
            "rf_id",
            "rf_liquidation_id",
            "rf_liquidation_item_id",
            "rf_from",
            "rf_to",
            "rf_mode_of_transportation",
            "rf_min_amount",
            "rf_max_amount",
            "rf_amount",
            "rf_created_by",
            "rf_created_date",
            "rf_status",
            "rf_approval_status",
            "rf_updated_by",
            "rf_updated_date",
        ],
        selectOptionsColumn: {
            id: "rf_id",
            liquidation_id: "rf_liquidation_id",
            liquidation_item_id: "rf_liquidation_item_id",
            from: "rf_from",
            to: "rf_to",
            mode_of_transportation: "rf_mode_of_transportation",
            min_amount: "rf_min_amount",
            max_amount: "rf_max_amount",
            amount: "rf_amount",
            created_by: "rf_created_by",
            created_date: "rf_created_date",
            status: "rf_status",
            approval_status: "rf_approval_status",
            updated_by: "rf_updated_by",
            updated_date: "rf_updated_date",
        },
    },
};

module.exports = { Masters };
