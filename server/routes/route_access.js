var express = require("express");
const {
    JsonResposeError,
    JsonResponseData,
    JsonResponseSuccess,
} = require("../repository/helper/enums");
const {
    GetCurrentDatetime,
    SelectStatement,
    SelectAllStatement,
    InsertStatement,
    UpdateStatement,
    SelectWhereStatement,
    SelectAllStatementDesc,
} = require("../repository/helper/customhelper");
const { Masters } = require("../repository/model/masters");
const { Select, Insert, Update } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const { EncrypterString } = require("../repository/helper/crytography");
const { DataModeling } = require("../repository/model/datamodeling");
var router = express.Router();

/* GET route_access listing. */
router.get("/", function (req, res, next) {
    res.render('route_access', { title: 'Express', currentRoute: req.originalUrl });
});

module.exports = router;

router.get("/getroute_access", (req, res) => {
    try {
        async function ProcessData() {
            let select_sql = SelectAllStatement(
                Masters.master_route_access.tablename,
                Masters.master_route_access.selectColumns,
                Masters.master_route_access.selectOptionsColumn.id,
            );

            let result = await Select(select_sql);
            res.status(200).json(JsonResponseData(DataModeling(result, Masters.master_route_access.prefix)));
        }

        ProcessData();
    } catch (error) {
        res.status(500).json(JsonResposeError(error));
    }
});

router.get("/getroute_access_id", (req, res) => {
    try {
        const { id } = req.query;
        async function ProcessData() {
            let select_sql = SelectWhereStatement(
                Masters.master_route_access.tablename,
                Masters.master_route_access.selectColumns,
                [Masters.master_route_access.selectOptionsColumn.access_id]
            );

            let result = await Select(select_sql);

            res.status(200).json(JsonResponseData(DataModeling(result, Masters.master_route_access.prefix)));
        }

        ProcessData();
    } catch (error) {
        res.status(500).json(JsonResposeError(error));
    }
});

router.get("/getroute_access_table", (req, res) => {
    try {
        async function ProcessData() {
            let { access_id } = req.query;
            let select_sql;
            if (access_id) {
                select_sql = SelectStatement(
                    `SELECT
                        mra_id as id,
                        mra_access_id as access_id,
                        mra_name as name,
                        mra_status as status
                    FROM master_route_access
                    WHERE mra_access_id = ${access_id}
                    ORDER BY mra_id DESC`
                );
            } else {
                select_sql = SelectStatement(
                    `SELECT
                        mra_id as id,
                        mra_access_id as access_id,
                        mra_name as name,
                        mra_status as status
                    FROM master_route_access
                    ORDER BY mra_id DESC`
                );
            }

            let result = await Select(select_sql);
            res.status(200).json(JsonResponseData(DataModeling(result, Masters.master_route_access.prefix)));
        }

        ProcessData();
    } catch (error) {
        res.status(500).json(JsonResposeError(error));
    }
});

router.post("/createroute_access", async (req, res) => {
    try {
        const { name, status } = req.body;

        for (let access_id = 10; access_id <= 25; access_id++) {
            let select_duplicate = SelectStatement(`
                SELECT mra_name
                FROM master_route_access
                WHERE mra_name = '${name}' AND mra_access_id = ${access_id}
            `);

            let duplicate_result = await Select(select_duplicate);
            let route_access_name = duplicate_result[0]?.mra_name;

            if (!route_access_name) {
                let data = [[access_id, name, status]];

                let insert_sql = InsertStatement(
                    Masters.master_route_access.tablename,
                    Masters.master_route_access.prefix,
                    Masters.master_route_access.insertColumns
                );

                await Insert(insert_sql, data);
            } else {
                console.log(`Duplicate found: ${name} with ID ${access_id}`);
            }
        }

        res.status(200).json(JsonResponseSuccess());
    } catch (error) {
        console.error(error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.post("/createbulk_route_access", async (req, res) => {
    try {
        const { access_id } = req.body;

        if (!access_id) {
            return res.status(400).json({ message: "access_id is required" });
        }

        const routeNames = [
            "employee_request",
            "employee_liquidation",
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
            "final_approval",
            "all_request",
            "users",
            "access",
            "liquidation_form",
            "admin_liquid_form",
            "completed_liquidations",
            "admin_reject_liquidations"
        ];

        for (let name of routeNames) {
            let select_duplicate = SelectStatement(`
                SELECT mra_name
                FROM master_route_access
                WHERE mra_name = '${name}' AND mra_access_id = ${access_id}
            `);

            let duplicate_result = await Select(select_duplicate);
            let route_access_name = duplicate_result[0]?.mra_name;

            if (!route_access_name) {
                let data = [[access_id, name, "No Access"]];

                let insert_sql = InsertStatement(
                    Masters.master_route_access.tablename,
                    Masters.master_route_access.prefix,
                    Masters.master_route_access.insertColumns
                );

                await Insert(insert_sql, data);
            } else {
                console.log(`Duplicate found: ${name} with access_id ${access_id}`);
            }
        }

        res.status(200).json(JsonResponseSuccess());
    } catch (error) {
        console.error(error);
        res.status(500).json(JsonResposeError(error));
    }
});


router.put("/updateroute_access", (req, res) => {
    try {
        const { id, name, access_id } = req.body;

        async function UpdateData() {
            let data = [
                access_id,
                name,
                id
            ];

            let update_sql = UpdateStatement(
                Masters.master_route_access.tablename,
                [
                    Masters.master_route_access.selectOptionsColumn.access_id,
                    Masters.master_route_access.selectOptionsColumn.name,
                ],
                [Masters.master_route_access.selectOptionsColumn.id],
            );

            await Update(update_sql, data);
            res.status(200).json(JsonResponseSuccess());
        }

        UpdateData();
    } catch (error) {
        console.log(error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.put("/update_status", (req, res) => {
    try {
        const { id, status } = req.body;
        async function UpdateData() {
            let data = [
                status,
                id
            ];

            let update_sql = UpdateStatement(
                Masters.master_route_access.tablename,
                [
                    Masters.master_route_access.selectOptionsColumn.status,
                ],
                [Masters.master_route_access.selectOptionsColumn.id],
            );

            await Update(update_sql, data);
            res.status(200).json(JsonResponseSuccess());
        }

        UpdateData();
    } catch (error) {
        console.log(error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.delete('/deleteroute_access', (req, res) => {
    const { id } = req.body;

    async function DeleteData() {
        try {
            const delete_sql = `DELETE FROM ${Masters.master_route_access.tablename} WHERE ${Masters.master_route_access.selectOptionsColumn.id} = ?`;
            await Delete(delete_sql, [id]);

            res.status(200).json(JsonResponseSuccess("Deleted successfully"));
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete: This route_access is associated with existing records. Please contact The DEVELOEPER to Assist you."
                });
            }

            res.status(500).json(JsonResposeError(error));
        }
    }

    DeleteData();
});
