/*
npx sequelize-cli migration:generate --name liquidation
npx sequelize-cli migration:generate --name liquidation_item
npx sequelize-cli migration:generate --name liquidation_activity
*/

const Liquidations = {
    liquidation: {
        tablename: "liquidation",
        prefix: "l_",
        insertColumns: [
            "cr_reference_id",
            "description",
            "amount_obtained",
            "amount_expended",
            "reimburse_return",
            "created_date",
            "status"
        ],
        selectColumns: [
            "l_id",
            "l_cr_reference_id",
            "l_description",
            "l_amount_obtained",
            "l_amount_expended",
            "l_reimburse_return",
            "l_created_date",
            "l_status",
            "l_notification",
        ],
        selectOptionsColumn: {
            id: "l_id",
            cr_reference_id: "l_cr_reference_id",
            description: "l_description",
            amount_obtained: "l_amount_obtained",
            amount_expended: "l_amount_expended",
            reimburse_return: "l_reimburse_return",
            created_date: "l_created_date",
            status: "l_status",
            notification: "l_notification",
        },
    },
    liquidation_item: {
        tablename: "liquidation_item",
        prefix: "li_",
        insertColumns: [
            "liquidation_id",
            "date",
            "rt",
            "store_name",
            "particulars",
            "from",
            "to",
            "mode_of_transportation",
            "amount",
        ],
        selectColumns: [
            "li_id",
            "li_liquidation_id",
            "li_date",
            "li_rt",
            "li_store_name",
            "li_particulars",
            "li_from",
            "li_to",
            "li_mode_of_transportation",
            "li_amount",
        ],
        selectOptionsColumn: {
            id: "li_id",
            liquidation_id: "li_liquidation_id",
            date: "li_date",
            rt: "li_rt",
            store_name: "li_store_name",
            particulars: "li_particulars",
            from: "li_from",
            to: "li_to",
            mode_of_transportation: "li_mode_of_transportation",
            amount: "li_amount",
        },
    },
    liquidation_activity: {
        tablename: "liquidation_activity",
        prefix: "lia_",
        insertColumns: [
            "liquidation_id",
            "action",
            "remarks",
            "receipts",
            "created_at",
            "created_by",
        ],
        selectColumns: [
            "lia_id",
            "lia_liquidation_id",
            "lia_action",
            "lia_remarks",
            "lia_receipts",
            "lia_created_at",
            "lia_created_by",
        ],
        selectOptionsColumn: {
            id: "lia_id",
            liquidation_id: "lia_liquidation_id",
            action: "lia_action",
            remarks: "lia_remarks",
            receipts: "lia_receipts",
            created_at: "lia_created_at",
            created_by: "lia_created_by",
        },
    },
};

module.exports = { Liquidations };
