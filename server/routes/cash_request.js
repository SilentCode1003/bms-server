var express = require('express');
const {
        JsonResposeError,
        JsonResponseData,
        JsonResponseSuccess,
} = require("../repository/helper/enums");
const {
        GetCurrentDatetime,
        SelectStatement,
        SelectWhereStatement,
        SelectAllStatement,
        InsertStatement,
        UpdateStatement,
} = require("../repository/helper/customhelper");
const { CashRequests } = require("../repository/model/cash_request");
const { Masters } = require("../repository/model/masters");
const { Select, Insert, Update } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const { EncrypterString, DecrypterString } = require("../repository/helper/crytography");
const jwt = require('jsonwebtoken');
var router = express.Router();

/* GET cash_request page. */
router.get('/', function (req, res, next) {
        res.render('cash_request', { title: 'Express' });
});

module.exports = router;

router.get('/getcash_request', async (req, res) => {
        const { status, employee_id } = req.query;
        try {
                async function ProcessData() {
                        let whereConditions = [];
                        if (status) {
                                if (status.toLowerCase() === 'approved') {
                                        whereConditions.push(`cr.cr_status IN ('approved','completed')`);
                                } else {
                                        whereConditions.push(`cr.cr_status = '${status}'`);
                                }
                        }

                        if (employee_id) {
                                whereConditions.push(`cr.cr_employee_id = '${employee_id}'`);
                        }

                        let whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : "";

                        let select_cash_request_sql = SelectStatement(
                                `SELECT
                  cr.cr_id as id,
                  cr.cr_reference_id as reference_id,
                  cr.cr_cv_number as cv_number,
                  cr.cr_description as description,
                  cr.cr_team_lead as team_lead,
                  cr.cr_employee as employee,
                  cr.cr_employee_id as employee_id,
                  cr.cr_department as department,
                  cr.cr_position as position,
                  cr.cr_amount as amount,
                  cr.cr_request_date as request_date,
                  cr.cr_status as status,
                  (
                    SELECT 
                        JSON_ARRAYAGG(
                          JSON_OBJECT(
                            'id', cra.cra_id,
                            'cash_request_id', cra.cra_cash_request_id,
                            'action', cra.cra_action,
                            'remarks', cra.cra_remarks,
                            'created_at', cra.cra_created_at,
                            'requested_by', cra.cra_requested_by
                          )
                        )
                    FROM cash_request_activity cra
                    WHERE cra.cra_cash_request_id = cr.cr_id
                  ) AS activities
              FROM cash_request cr
              ${whereClause}
              GROUP BY cr.cr_id
              ${status && status.toLowerCase() === 'rejected'
                                        ? `HAVING 
                        EXISTS (
                          SELECT 1 
                          FROM cash_request_activity cra1
                          WHERE cra1.cra_cash_request_id = cr.cr_id
                          AND cra1.cra_action = 'REQUESTED'
                        )`
                                        : ""
                                }
              ORDER BY cr.cr_id DESC`
                        );

                        let result = await Select(select_cash_request_sql);
                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error fetching cash requests:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.get('/getapproved_cash_request', async (req, res) => {
        const { status } = req.query;
        try {
                async function ProcessData() {
                        let select_cash_request_sql = SelectStatement(
                                `SELECT
                                    cr.cr_id as id,
                                    cr.cr_reference_id as reference_id,
                                    cr.cr_cv_number as cv_number,
                                    cr.cr_description as description,
                                    cr.cr_team_lead as team_lead,
                                    cr.cr_employee as employee,
                                    cr.cr_employee_id as employee_id,
                                    cr.cr_department as department,
                                    cr.cr_position as position,
                                    cr.cr_amount as amount,
                                    cr.cr_request_date as request_date,
                                    cr.cr_status as status,
                              
                                    (
                                        SELECT JSON_ARRAYAGG(
                                            JSON_OBJECT(
                                                'id', cra.cra_id,
                                                'cash_request_id', cra.cra_cash_request_id,
                                                'action', cra.cra_action,
                                                'remarks', cra.cra_remarks,
                                                'created_at', cra.cra_created_at,
                                                'requested_by', cra.cra_requested_by
                                            )
                                        )
                                        FROM cash_request_activity cra
                                        WHERE cra.cra_cash_request_id = cr.cr_id
                                        AND cra.cra_action IN ('REQUESTED','APPROVED','REJECTED')
                                    ) AS cash_request_activities
                              
                                FROM cash_request cr
                                ${status ? `WHERE cr.cr_status = '${status}'` : ""}
                                GROUP BY cr.cr_id
                                ${status && status.toLowerCase() === 'rejected'
                                        ? `HAVING 
                                          (SELECT COUNT(DISTINCT cra_act.cra_action) 
                                           FROM cash_request_activity cra_act 
                                           WHERE cra_act.cra_cash_request_id = cr.cr_id 
                                           AND cra_act.cra_action IN ('REQUESTED','APPROVED','REJECTED')
                                          ) = 3`
                                        : ""
                                }
                                ORDER BY cr.cr_id DESC`
                        );

                        let result = await Select(select_cash_request_sql);
                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during getapproved_cash_request:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.get("/getexisting_liquidation", async (req, res) => {
        try {
                const { employee_id } = req.query;
                let select_liquidation_sql = '';
                async function ProcessData() {

                        let select_cash_request_sql = SelectStatement(
                                `SELECT
                                cr_id AS id
                                FROM cash_request cr
                                WHERE cr_employee_id = ?`,
                                [employee_id]
                        );

                        let select_cash_request_result = await Select(select_cash_request_sql);


                        if (select_cash_request_result.length === 0) {
                                select_liquidation_sql = SelectStatement(
                                        `SELECT
                                            cr_id AS id
                                          FROM cash_request cr       
                                          WHERE cr_employee_id = ?`,
                                        [employee_id]
                                );
                        } else {
                                select_liquidation_sql = SelectStatement(
                                        `SELECT
                                            cr_id AS id
                                          FROM cash_request cr
                                          LEFT JOIN liquidation l ON cr.cr_reference_id = l.l_cr_reference_id           
                                          WHERE isnull(l.l_status) and not cr.cr_status = 'rejected' or not l.l_status in ('verified','completed')
                                            AND cr_employee_id = ?`,
                                        [employee_id]
                                );
                        }


                        let result = await Select(select_liquidation_sql);
                        return res.status(200).json(result);
                }
                await ProcessData();
        } catch (error) {
                console.error("Error during getexisting_liquidation:", error);
                res.status(500).json(JsonResposeError(error));
        }
})

router.get("/getexisting_cash_request", async (req, res) => {
        try {
                const { id } = req.query;
                async function ProcessData() {
                        let select_liquidation_sql = SelectStatement(
                                `SELECT
                                    cr_id AS id
                                  FROM cash_request cr
                                  LEFT JOIN liquidation l ON cr.cr_reference_id = l.l_cr_reference_id
                                  WHERE isnull(l.l_status)
                                    AND cr_id = ?`,
                                [id]
                        );

                        let result = await Select(select_liquidation_sql);
                        return res.status(200).json(result);
                }
                await ProcessData();
        } catch (error) {
                console.error("Error during getexisting_cash_request:", error);
                res.status(500).json(JsonResposeError(error));
        }
})

router.post("/createcash_request", async (req, res) => {
        try {
                const { description, team_lead, employee, employee_id, department, position, amount, requested_by } = req.body;

                if (!description || !employee || !employee_id || !department || !position || !amount || !requested_by) {
                        return res.status(400).json(JsonResposeError("Missing required fields"));
                }

                let status = "PENDING";
                let request_date = GetCurrentDatetime();
                let action = "REQUESTED";
                let created_at = GetCurrentDatetime();

                async function ProcessData() {

                        let maxReferenceIdQuery = SelectStatement(
                                `SELECT MAX(CAST(SUBSTRING_INDEX(cr_reference_id, '-', -1) AS UNSIGNED)) AS max_sequence 
                                  FROM cash_request 
                                  WHERE cr_reference_id LIKE CONCAT('CR-', DATE_FORMAT(NOW(), '%y%m%d'), '-%')`
                        );
                        let maxReferenceIdResult = await Select(maxReferenceIdQuery);
                        let maxSequence = maxReferenceIdResult[0]?.max_sequence || 0;
                        let currentDate = new Date();
                        let year = currentDate.getFullYear().toString().slice(-2);
                        let month = String(currentDate.getMonth() + 1).padStart(2, '0');
                        let day = String(currentDate.getDate()).padStart(2, '0');
                        let sequence = (maxSequence + 1).toString().padStart(4, "0");
                        let reference_id = `CR-${year}${month}${day}-${sequence}`;

                        let data = [
                                [reference_id, 0, description, team_lead, employee, employee_id, department, position, amount, request_date, status],
                        ];

                        let insert_sql = InsertStatement(
                                CashRequests.cash_request.tablename,
                                CashRequests.cash_request.prefix,
                                CashRequests.cash_request.insertColumns
                        );

                        let cashRequestResult = await Insert(insert_sql, data);
                        let cash_request_id = cashRequestResult[0]?.id || cashRequestResult.id;
                        if (!cash_request_id) {
                                throw new Error("Failed to insert cash request");
                        }


                        let activityData = [
                                [
                                        cash_request_id,
                                        action,
                                        "",
                                        created_at,
                                        requested_by
                                ]
                        ];
                        let activity_insert_sql = InsertStatement(
                                CashRequests.cash_request_activity.tablename,
                                CashRequests.cash_request_activity.prefix,
                                CashRequests.cash_request_activity.insertColumns
                        );
                        await Insert(activity_insert_sql, activityData);




                        res.status(200).json(JsonResponseSuccess());
                }

                await ProcessData();
        } catch (error) {
                console.log(error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.put("/updatecash_request", async (req, res) => {
        try {
                const { status, id, remarks, updated_by, cash_voucher } = req.body;
                console.log(req.body);
                let created_at = GetCurrentDatetime();
                if (!id || !status) {
                        return res.status(400).json(JsonResposeError("Missing required fields"));
                }
                let select_employee_id = SelectStatement(
                        `SELECT cr_employee_id, cr_amount FROM cash_request WHERE cr_id = ?`,
                        [id]
                );
                let select_employee_id_result = await Select(select_employee_id);
                let employee_id = select_employee_id_result[0]?.cr_employee_id || select_employee_id_result.cr_employee_id;
                let amount = select_employee_id_result[0]?.cr_amount || select_employee_id_result.cr_amount;

                async function ProcessData() {

                        if (status === "approved") {
                                let data = [status, id];
                                let update_sql = UpdateStatement(
                                        CashRequests.cash_request.tablename,
                                        [CashRequests.cash_request.selectOptionsColumn.status],
                                        [CashRequests.cash_request.selectOptionsColumn.id]
                                );
                                await Update(update_sql, [data]);

                                let activityData = [
                                        [
                                                id,
                                                status,
                                                "APPROVED",
                                                created_at,
                                                updated_by
                                        ]
                                ];
                                let activity_insert_sql = InsertStatement(
                                        CashRequests.cash_request_activity.tablename,
                                        CashRequests.cash_request_activity.prefix,
                                        CashRequests.cash_request_activity.insertColumns
                                );
                                await Insert(activity_insert_sql, activityData);
                        } else if (status === "completed") {

                                let data = [
                                        [status, cash_voucher, id],
                                ];
                                let update_sql = UpdateStatement(
                                        CashRequests.cash_request.tablename,
                                        [CashRequests.cash_request.selectOptionsColumn.status, CashRequests.cash_request.selectOptionsColumn.cv_number],
                                        [CashRequests.cash_request.selectOptionsColumn.id],
                                );
                                await Update(update_sql, data);

                                let activityData = [
                                        [
                                                id,
                                                "RECEIVED",
                                                "",
                                                created_at,
                                                updated_by
                                        ]
                                ];
                                let activity_insert_sql = InsertStatement(
                                        CashRequests.cash_request_activity.tablename,
                                        CashRequests.cash_request_activity.prefix,
                                        CashRequests.cash_request_activity.insertColumns
                                );
                                await Insert(activity_insert_sql, activityData);

                                let select_cash_request = SelectStatement(
                                        `SELECT
                                        cr_department as department,
                                        cr_description as particulars,
                                        cr_cv_number as cash_voucher,
                                        cr_amount as amount_issue
                                        FROM cash_request
                                        WHERE cr_id = ?
                                        `,
                                        [id]
                                );
                                let cash_request = await Select(select_cash_request);
                                let walletData = SelectStatement(
                                        `SELECT * FROM master_wallet WHERE mw_employee_id = ?`,
                                        [employee_id],
                                );
                                let walletResult = await Select(walletData);


                                if (walletResult.length > 0) {
                                        let wallet_update_data = [
                                                Number(walletResult[0]?.mw_current_amount), Number(walletResult[0]?.mw_current_amount) + Number(amount), employee_id
                                        ];
                                        let wallet_update_sql = UpdateStatement(
                                                Masters.master_wallet.tablename,
                                                [Masters.master_wallet.selectOptionsColumn.previous_amount,
                                                Masters.master_wallet.selectOptionsColumn.current_amount],
                                                [Masters.master_wallet.selectOptionsColumn.employee_id]
                                        );
                                        let result = await Update(wallet_update_sql, [wallet_update_data]);
                                        if (result) {
                                                console.log("success");
                                        }

                                } else {
                                        walletResult = [
                                                [
                                                        employee_id,
                                                        0,
                                                        amount
                                                ]
                                        ];
                                        let wallet_insert_sql = InsertStatement(
                                                Masters.master_wallet.tablename,
                                                Masters.master_wallet.prefix,
                                                Masters.master_wallet.insertColumns
                                        );
                                        await Insert(wallet_insert_sql, walletResult);
                                }
                                let wallet_id = walletResult[0]?.id || walletResult.id;

                                let wallet_activityData = [
                                        [
                                                wallet_id,
                                                `Added new wallet balance ${amount}`,
                                                created_at
                                        ]
                                ];
                                let wallet_activity_insert_sql = InsertStatement(
                                        Masters.master_wallet_activity.tablename,
                                        Masters.master_wallet_activity.prefix,
                                        Masters.master_wallet_activity.insertColumns
                                );
                                await Insert(wallet_activity_insert_sql, wallet_activityData);

                                return res.status(200).json(cash_request);
                        } else if (status === "rejected") {
                                let data = [
                                        [status, id],
                                ];
                                let update_sql = UpdateStatement(
                                        CashRequests.cash_request.tablename,
                                        [CashRequests.cash_request.selectOptionsColumn.status],
                                        [CashRequests.cash_request.selectOptionsColumn.id],
                                );
                                await Update(update_sql, data);

                                let activityData = [
                                        [
                                                id,
                                                "REJECTED",
                                                remarks || "",
                                                created_at,
                                                updated_by
                                        ]
                                ];
                                let activity_insert_sql = InsertStatement(
                                        CashRequests.cash_request_activity.tablename,
                                        CashRequests.cash_request_activity.prefix,
                                        CashRequests.cash_request_activity.insertColumns
                                );
                                await Insert(activity_insert_sql, activityData);


                        }
                        res.status(200).json(JsonResponseSuccess());
                }

                await ProcessData();
        } catch (error) {
                console.log(error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.put("/updatecash_request_rejected", async (req, res) => {
        try {
                const { id, description, amount, team_lead } = req.body;
                let created_at = GetCurrentDatetime();
                if (!id || !description || !amount || !team_lead) {
                        return res.status(400).json(JsonResposeError("Missing required fields"));
                }
                let data = [
                        [description, amount, team_lead, id],
                ];
                let update_sql = UpdateStatement(
                        CashRequests.cash_request.tablename,
                        [CashRequests.cash_request.selectOptionsColumn.remarks, CashRequests.cash_request.selectOptionsColumn.updated_by],
                        [CashRequests.cash_request.selectOptionsColumn.id],
                );
                await Update(update_sql, data);

                res.status(200).json(JsonResponseSuccess());
        } catch (error) {
                console.log(error);
                res.status(500).json(JsonResposeError(error));
        }
});

// router.get('/getcash_request_by_id', async (req, res) => {
//         try {
//                 const { id } = req.query;
//                 async function ProcessData() {
//                         let select_cash_request = SelectStatement(
//                                 `SELECT
//                                 cr_department_id as department_id,
//                                 cr_description as description,
//                                 cr_cv_number as cv_number,
//                                 SUM(cri_subtotal) as subtotal
//                                 FROM cash_request
//                                 INNER JOIN cash_request_item ON cr_id = cri_cash_request_id
//                                 WHERE cr_id = ?
//                                 `,
//                                 [id]
//                         );
//                         let cash_request = await Select(select_cash_request);

//                         return res.status(200).json(cash_request);
//                 }

//                 await ProcessData();
//         } catch (error) {
//                 console.error("Error during login:", error);
//                 res.status(500).json(JsonResposeError(error));
//         }
// });
