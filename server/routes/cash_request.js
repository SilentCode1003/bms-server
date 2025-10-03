var express = require("express");
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
const { Liquidations } = require("../repository/model/liquidation");
const { Masters } = require("../repository/model/masters");
const { Select, Insert, Update } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const {
        EncrypterString,
        DecrypterString,
} = require("../repository/helper/crytography");
const jwt = require("jsonwebtoken");
var router = express.Router();

/* GET cash_request page. */
router.get("/", function (req, res, next) {
        res.render("cash_request", { title: "Express" });
});

module.exports = router;

router.get("/getcash_request", async (req, res) => {
        const { status, employee_id, start_date, end_date } = req.query;
        try {
                async function ProcessData() {
                        let whereConditions = [];
                        let whereClause = [];
                        if (status) {
                                whereConditions.push(`cr.cr_status = '${status}'`);
                        }

                        if (employee_id) {
                                whereConditions.push(`cr.cr_employee_id = '${employee_id}'`);
                        }

                        if (start_date && end_date) {
                                whereConditions.push(
                                        `DATE(cr.cr_request_date) BETWEEN '${start_date}' AND '${end_date}'`
                                );
                        } else {
                                whereConditions.push(`DATE(cr.cr_request_date) = CURDATE()`);
                        }

                        if (whereConditions.length > 0) {
                                whereClause.push(`WHERE ${whereConditions.join(" AND ")}`);
                        }

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
              ${whereClause.join(" ")}
              GROUP BY cr.cr_id
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

router.get("/getapproved_cash_request", async (req, res) => {
        const { status, start_date, end_date } = req.query;
        try {
                async function ProcessData() {
                        const whereConditions = [];
                        const whereClause = [];

                        if (status) {
                                whereConditions.push(`cr.cr_status = '${status}'`);
                        }

                        if (start_date && end_date) {
                                whereConditions.push(
                                        `DATE(cr.cr_request_date) BETWEEN '${start_date}' AND '${end_date}'`
                                );
                        } else {
                                whereConditions.push(`DATE(cr.cr_request_date) = CURDATE()`);
                        }

                        if (whereConditions.length > 0) {
                                whereClause.push(`WHERE ${whereConditions.join(" AND ")}`);
                        }

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
                                ${whereClause.join(" ")}
                                GROUP BY cr.cr_id
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
                let select_liquidation_sql = "";
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
                                return res.status(200).json([]);
                        }

                        select_liquidation_sql = SelectStatement(
                                `SELECT cr_id
        FROM cash_request
        LEFT JOIN liquidation ON cr_reference_id = l_cr_reference_id
        WHERE cr_employee_id = ?
        AND (isnull(l_status) OR l_status IN ('pending', 'approved', 'rejected'))
        AND not cr_status = 'rejected'`,
                                [employee_id]
                        );

                        let result = await Select(select_liquidation_sql);

                        console.log(result);
                        return res.status(200).json(result);
                }
                await ProcessData();
        } catch (error) {
                console.error("Error during getexisting_liquidation:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

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
});

router.post("/createcash_request", async (req, res) => {
        try {
                const {
                        description,
                        team_lead,
                        employee,
                        employee_id,
                        department,
                        position,
                        amount,
                        requested_by,
                } = req.body;

                if (
                        !description ||
                        !employee ||
                        !employee_id ||
                        !department ||
                        !position ||
                        !amount ||
                        !requested_by
                ) {
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
                        let month = String(currentDate.getMonth() + 1).padStart(2, "0");
                        let day = String(currentDate.getDate()).padStart(2, "0");
                        let sequence = (maxSequence + 1).toString().padStart(4, "0");
                        let reference_id = `CR-${year}${month}${day}-${sequence}`;

                        let data = [
                                [
                                        reference_id,
                                        0,
                                        description,
                                        team_lead,
                                        employee,
                                        employee_id,
                                        department,
                                        position,
                                        amount,
                                        request_date,
                                        status,
                                ],
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
                                [cash_request_id, action, "", created_at, requested_by],
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
                let employee_id =
                        select_employee_id_result[0]?.cr_employee_id ||
                        select_employee_id_result.cr_employee_id;
                let amount =
                        select_employee_id_result[0]?.cr_amount ||
                        select_employee_id_result.cr_amount;

                async function ProcessData() {
                        if (status === "approved") {
                                let data = [status, id];
                                let update_sql = UpdateStatement(
                                        CashRequests.cash_request.tablename,
                                        [CashRequests.cash_request.selectOptionsColumn.status],
                                        [CashRequests.cash_request.selectOptionsColumn.id]
                                );
                                await Update(update_sql, [data]);

                                let activityData = [[id, status, "APPROVED", created_at, updated_by]];
                                let activity_insert_sql = InsertStatement(
                                        CashRequests.cash_request_activity.tablename,
                                        CashRequests.cash_request_activity.prefix,
                                        CashRequests.cash_request_activity.insertColumns
                                );
                                await Insert(activity_insert_sql, activityData);
                        } else if (status === "completed") {
                                let data = [[status, cash_voucher, id]];
                                let update_sql = UpdateStatement(
                                        CashRequests.cash_request.tablename,
                                        [
                                                CashRequests.cash_request.selectOptionsColumn.status,
                                                CashRequests.cash_request.selectOptionsColumn.cv_number,
                                        ],
                                        [CashRequests.cash_request.selectOptionsColumn.id]
                                );
                                await Update(update_sql, data);

                                let activityData = [[id, "RECEIVED", "", created_at, updated_by]];
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
                                        [employee_id]
                                );
                                let walletResult = await Select(walletData);

                                if (walletResult.length > 0) {
                                        let wallet_update_data = [
                                                Number(walletResult[0]?.mw_current_amount),
                                                Number(walletResult[0]?.mw_current_amount) + Number(amount),
                                                employee_id,
                                        ];
                                        let wallet_update_sql = UpdateStatement(
                                                Masters.master_wallet.tablename,
                                                [
                                                        Masters.master_wallet.selectOptionsColumn.previous_amount,
                                                        Masters.master_wallet.selectOptionsColumn.current_amount,
                                                ],
                                                [Masters.master_wallet.selectOptionsColumn.employee_id]
                                        );
                                        let result = await Update(wallet_update_sql, [wallet_update_data]);
                                        if (result) {
                                                console.log("success");
                                        }
                                } else {
                                        walletResult = [[employee_id, 0, amount]];
                                        let wallet_insert_sql = InsertStatement(
                                                Masters.master_wallet.tablename,
                                                Masters.master_wallet.prefix,
                                                Masters.master_wallet.insertColumns
                                        );
                                        await Insert(wallet_insert_sql, walletResult);
                                }
                                let wallet_id = walletResult[0]?.id || walletResult.id;

                                let wallet_activityData = [
                                        [wallet_id, `Added new wallet balance ${amount}`, created_at],
                                ];
                                let wallet_activity_insert_sql = InsertStatement(
                                        Masters.master_wallet_activity.tablename,
                                        Masters.master_wallet_activity.prefix,
                                        Masters.master_wallet_activity.insertColumns
                                );
                                await Insert(wallet_activity_insert_sql, wallet_activityData);

                                return res.status(200).json(cash_request);
                        } else if (status === "rejected") {
                                let data = [[status, id]];
                                let update_sql = UpdateStatement(
                                        CashRequests.cash_request.tablename,
                                        [CashRequests.cash_request.selectOptionsColumn.status],
                                        [CashRequests.cash_request.selectOptionsColumn.id]
                                );
                                await Update(update_sql, data);

                                let activityData = [
                                        [id, "REJECTED", remarks || "", created_at, updated_by],
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
                let data = [[description, amount, team_lead, id]];
                let update_sql = UpdateStatement(
                        CashRequests.cash_request.tablename,
                        [
                                CashRequests.cash_request.selectOptionsColumn.remarks,
                                CashRequests.cash_request.selectOptionsColumn.updated_by,
                        ],
                        [CashRequests.cash_request.selectOptionsColumn.id]
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

router.put("/update_liquidation_rejected", async (req, res) => {
        try {
            const { liquidation_id, items, remarks, receipts } = req.body;
    
            if (!liquidation_id) {
                return res.status(400).json(JsonResposeError("Missing liquidation_id"));
            }
    
            let storedReceipts = [];
            if (Array.isArray(receipts)) {
                storedReceipts = receipts.map((r, index) => ({
                    id: r.id || (index + 1).toString(),
                    image: r.image || ""
                }));
            }
    
            let select_liquidation = SelectStatement(
                `SELECT
                l_amount_obtained as amount_obtained
                FROM liquidation
                WHERE l_id = ?
                `,
                [liquidation_id]
            );
            let liquidation = await Select(select_liquidation);
            let amount_obtained = liquidation[0]?.amount_obtained || 0;
            
            let amount_expended = 0;
            if (Array.isArray(items) && items.length > 0) {
                amount_expended = items.reduce((sum, item) => {
                    return sum + (parseFloat(item.amount) || 0);
                }, 0);
            }
            
            let reimburse_return = amount_obtained - amount_expended;
            if (reimburse_return < 0) reimburse_return = 0;
            
            let data = [
                amount_expended,
                reimburse_return,
                liquidation_id
            ];
            
            let update_liquidation_sql = UpdateStatement(
                Liquidations.liquidation.tablename,
                [
                    Liquidations.liquidation.selectOptionsColumn.amount_expended,
                    Liquidations.liquidation.selectOptionsColumn.reimburse_return,
                ],
                [Liquidations.liquidation.selectOptionsColumn.id]
            );
            
            await Update(update_liquidation_sql, [data]);
            
            if (Array.isArray(items) && items.length > 0) {
                for (const item of items) {
                    if (!item.id || !item.date || !item.particulars || !item.amount) {
                        return res.status(400).json(JsonResposeError("Each item must have id, date, particulars, and amount"));
                    }
            
                    let itemData = [
                        item.date,
                        item.rt || "",
                        item.store_name || "",
                        item.particulars,
                        item.from || "",
                        item.to || "",
                        item.mode_of_transportation || "",
                        parseFloat(item.amount),
                        item.id,
                    ];
            
                    let update_item_sql = UpdateStatement(
                        Liquidations.liquidation_item.tablename,
                        [
                            Liquidations.liquidation_item.selectOptionsColumn.date,
                            Liquidations.liquidation_item.selectOptionsColumn.rt,
                            Liquidations.liquidation_item.selectOptionsColumn.store_name,
                            Liquidations.liquidation_item.selectOptionsColumn.particulars,
                            Liquidations.liquidation_item.selectOptionsColumn.from,
                            Liquidations.liquidation_item.selectOptionsColumn.to,
                            Liquidations.liquidation_item.selectOptionsColumn.mode_of_transportation,
                            Liquidations.liquidation_item.selectOptionsColumn.amount,
                        ],
                        [Liquidations.liquidation_item.selectOptionsColumn.id]
                    );
            
                    await Update(update_item_sql, [itemData]);
                }
            }
            
    
            let activityData = [
                remarks || "",
                JSON.stringify(storedReceipts),
                liquidation_id,
                "PREPARED"
            ];
    
            let update_activity_sql = UpdateStatement(
                Liquidations.liquidation_activity.tablename,
                [
                    Liquidations.liquidation_activity.selectOptionsColumn.remarks,
                    Liquidations.liquidation_activity.selectOptionsColumn.receipts,
                ],
                [
                    Liquidations.liquidation_activity.selectOptionsColumn.liquidation_id,
                    Liquidations.liquidation_activity.selectOptionsColumn.action,
                ]
            );
    
            await Update(update_activity_sql, [activityData]);
    
            let itemData = [
                "pending",
                liquidation_id,
            ];
    
            let update_item_sql = UpdateStatement(
                Liquidations.liquidation.tablename,
                [
                    Liquidations.liquidation.selectOptionsColumn.status,
                ],
                [Liquidations.liquidation.selectOptionsColumn.id]
            );
    
            await Update(update_item_sql, [itemData]);
    
            await Delete(`DELETE FROM liquidation_activity WHERE lia_liquidation_id = ? AND lia_action != 'PREPARED'`, [liquidation_id]);
    
    
            res.status(200).json(JsonResponseSuccess());
        } catch (error) {
            console.error("Error in updatecash_request_rejected:", error);
            res.status(500).json(JsonResposeError(error));
        }
    });

