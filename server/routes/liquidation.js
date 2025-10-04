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
const { Liquidations } = require("../repository/model/liquidation");
const { Masters } = require("../repository/model/masters");
const { Select, Insert, Update, Delete } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const { EncrypterString, DecrypterString } = require("../repository/helper/crytography");
const jwt = require('jsonwebtoken');
var router = express.Router();

/* GET liquidation page. */
router.get('/', function (req, res, next) {
    res.render('liquidation', { title: 'Express' });
});

module.exports = router;

router.get('/getcash_liquidation', async (req, res) => {
    const { status, employee_id } = req.query;
    console.log(req.query)
    try {
        async function ProcessData() {
            let whereConditions = [];
            if (status) {
                if (status.toLowerCase() === 'verified') {
                    whereConditions.push(`l.l_status IN ('verified','completed')`);
                } else {
                    whereConditions.push(`l.l_status = '${status}'`);
                }
            }

            if (employee_id) {
                whereConditions.push(`cr.cr_employee_id = '${employee_id}'`);
            }

            let whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : "";

            let select_liquidation_sql = SelectStatement(
                `SELECT
                    l.l_id as id,
                    l.l_cr_reference_id as reference_id,
                    cr.cr_cv_number as cv_number,
                    cr.cr_employee as employee,
                    cr.cr_employee_id as employee_id,
                    cr.cr_department as department,
                    cr.cr_position as position,
                    l.l_description as description,
                    l.l_amount_obtained as amount_obtained,
                    l.l_amount_expended as amount_expended,
                    l.l_reimburse_return as reimburse_return,
                    l.l_created_date as created_date,
                    l.l_status as status,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', li.li_id,
                                'liquidation_id', li.li_liquidation_id,
                                'date', li.li_date,
                                'rt', li.li_rt,
                                'store_name', li.li_store_name,
                                'particulars', li.li_particulars,
                                'from', li.li_from,
                                'to', li.li_to,
                                'mode_of_transportation', li.li_mode_of_transportation,
                                'amount', li.li_amount
                            )
                        )
                        FROM liquidation_item li
                        WHERE li.li_liquidation_id = l.l_id
                    ) AS liquidation_items
                FROM liquidation l
                INNER JOIN cash_request cr ON l.l_cr_reference_id = cr.cr_reference_id
                ${whereClause}
                GROUP BY l.l_id
                ${status && status.toLowerCase() === 'rejected'
                    ? `HAVING 
                            EXISTS (
                                SELECT 1 
                                FROM liquidation_activity lia1
                                WHERE lia1.lia_liquidation_id = l.l_id
                                AND lia1.lia_action = 'PREPARED'
                            )`
                    : ""
                }
                ORDER BY l.l_id DESC`
            );

            let result = await Select(select_liquidation_sql);
            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error fetching liquidations:", error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.get('/getcash_liquidation_id', async (req, res) => {
    try {
        const { id } = req.query;
        console.log(req.query)

        if (!id) {
            return res.status(400).json({ error: 'Liquidation ID is required' });
        }

        async function ProcessData() {
            const query = `
                SELECT 
                    lia_id as id,
                    lia_liquidation_id as liquidation_id,
                    lia_action as action,
                    lia_remarks as remarks,
                    lia_receipts as receipts,
                    lia_created_at as created_at,
                    lia_created_by as created_by
                FROM liquidation_activity
                WHERE lia_liquidation_id = ${parseInt(id, 10)}
            `;

            const result = await Select(query);

            // if (result.length === 0) {
            //     return res.status(404).json({ message: 'No activities found for this liquidation' });
            // }

            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error fetching liquidation activities:", error.sqlMessage);
        res.status(500).json({ error: 'Internal server error', details: error.sqlMessage });
    }
});

router.get('/getapproved_liquidation', async (req, res) => {
    const { status } = req.query;
    try {
        async function ProcessData() {
            let select_liquidation_sql = SelectStatement(
                `SELECT
              l.l_id as id,
              l.l_cr_reference_id as cr_reference_id,
              cr.cr_cv_number as cv_number,
              cr.cr_employee as employee,
              cr.cr_employee_id as employee_id,
              cr.cr_department as department,
              cr.cr_position as position,
              l.l_description as description,
              l.l_amount_obtained as amount_obtained,
              l.l_amount_expended as amount_expended,
              l.l_reimburse_return as reimburse_return,
              l.l_created_date as created_date,
              l.l_status as status,
              SUM(li.li_amount) AS amount,
              
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', li.li_id,
                  'liquidation_id', li.li_liquidation_id,
                  'date', li.li_date,
                  'rt', li.li_rt,
                  'store_name', li.li_store_name,
                  'particulars', li.li_particulars,
                  'from', li.li_from,
                  'to', li.li_to,
                  'mode_of_transportation', li.li_mode_of_transportation,
                  'amount', li.li_amount
                )
              ) AS liquidation_items,
  
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'id', lia.lia_id,
                    'liquidation_id', lia.lia_liquidation_id,
                    'action', lia.lia_action,
                    'remarks', lia.lia_remarks,
                    'receipts', lia.lia_receipts,
                    'created_at', lia.lia_created_at,
                    'created_by', lia.lia_created_by
                  )
                )
                FROM liquidation_activity lia
                WHERE lia.lia_liquidation_id = l.l_id
                AND lia.lia_action IN ('PREPARED','NOTED','REJECTED','APPROVED','CHECKED')
              ) AS liquidation_activities
            
          FROM liquidation l
          LEFT JOIN cash_request cr
            ON l.l_cr_reference_id = cr.cr_reference_id
          LEFT JOIN liquidation_item li
            ON l.l_id = li.li_liquidation_id
          ${status ? `WHERE l.l_status = '${status}'` : ""}
          GROUP BY l.l_id
          ORDER BY l.l_id DESC`
            );

            let result = await Select(select_liquidation_sql);
            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error during getapproved_liquidation:", error);
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

router.post("/create_liquidation", async (req, res) => {
    try {
        const { reference_id, description, amount_obtained, amount_expended, reimburse_return, request_items, remarks, receipts, created_by } = req.body;
        console.log("request_items", request_items);
        let status = "PENDING";
        let request_date = GetCurrentDatetime();
        let action = "PREPARED";
        let created_at = GetCurrentDatetime();
        if (!Array.isArray(request_items) || request_items.length === 0) {
            let select_sql = SelectStatement(
                `SELECT * FROM liquidation WHERE l_cr_reference_id = ?`,
                [reference_id]
            );
            let result = await Select(select_sql);

            if (result.length > 0) {
                return res.status(400).json(JsonResposeError("Liquidation with same reference id already exists"));
            }

            let data = [
                [reference_id, description, amount_obtained, amount_expended, reimburse_return, request_date, status],
            ];

            let insert_sql = InsertStatement(
                Liquidations.liquidation.tablename,
                Liquidations.liquidation.prefix,
                Liquidations.liquidation.insertColumns
            );

            let liquidationResult = await Insert(insert_sql, data);
            let liquidation_id = liquidationResult[0]?.id || liquidationResult.id;
            if (!liquidation_id) {
                return res.status(400).json(JsonResposeError("Failed to insert liquidation"));
            }
            // return res.status(400).json(JsonResposeError("At least one request item is required"));
            res.status(200).json(JsonResponseSuccess());
        }
        else {
            let itemsData = [];
            for (const [index, item] of request_items.entries()) {

                if (!item.date || !item.particulars) {
                    return res.status(400).json(
                        JsonResposeError(`Request item at index ${index} is missing required fields (date, particulars, amount).`)
                    );
                }
            }
            await ProcessData();
        }

        async function ProcessData() {
            let select_sql = SelectStatement(
                `SELECT * FROM liquidation WHERE l_cr_reference_id = ?`,
                [reference_id]
            );
            let result = await Select(select_sql);

            if (result.length > 0) {
                return res.status(400).json(JsonResposeError("Liquidation with same reference id already exists"));
            }

            let data = [
                [reference_id, description, amount_obtained, amount_expended, reimburse_return, request_date, status],
            ];

            let insert_sql = InsertStatement(
                Liquidations.liquidation.tablename,
                Liquidations.liquidation.prefix,
                Liquidations.liquidation.insertColumns
            );

            let liquidationResult = await Insert(insert_sql, data);
            let liquidation_id = liquidationResult[0]?.id || liquidationResult.id;
            if (!liquidation_id) {
                return res.status(400).json(JsonResposeError("Failed to insert liquidation"));
            }

            let itemsData = [];
            for (const item of request_items) {
                if (item.date && item.rt && item.store_name && item.particulars && item.from && item.to && item.mode_of_transportation && item.amount) {
                    itemsData.push([
                        liquidation_id,
                        item.date,
                        item.rt,
                        item.store_name,
                        item.particulars,
                        item.from.replace(/[^a-zA-Z ]/g, "").toUpperCase(),
                        item.to.replace(/[^a-zA-Z ]/g, "").toUpperCase(),
                        item.mode_of_transportation.replace(/[^a-zA-Z ]/g, "").toUpperCase(),
                        parseFloat(item.amount) || 0
                    ]);
                }
            }

            if (itemsData.length === 0) {
                return res.status(400).json(JsonResposeError("No valid request items provided"));
            }

            if (itemsData.length > 0) {
                let item_insert_sql = InsertStatement(
                    Liquidations.liquidation_item.tablename,
                    Liquidations.liquidation_item.prefix,
                    Liquidations.liquidation_item.insertColumns
                );
                await Insert(item_insert_sql, itemsData);
            }

            let formattedReceipts = [];
            if (Array.isArray(receipts)) {
                formattedReceipts = receipts.map((img, index) => ({
                    id: String(index + 1),
                    image: img
                }));
            }

            let activityData = [
                [
                    liquidation_id,
                    action,
                    remarks || "",
                    JSON.stringify(formattedReceipts),
                    created_at,
                    created_by
                ]
            ];
            let activity_insert_sql = InsertStatement(
                Liquidations.liquidation_activity.tablename,
                Liquidations.liquidation_activity.prefix,
                Liquidations.liquidation_activity.insertColumns
            );
            await Insert(activity_insert_sql, activityData);

            let select_emmployee_id = SelectStatement(
                `SELECT
                cr_employee_id as employee_id
                FROM cash_request
                WHERE cr_reference_id = "${reference_id}"`
            );
            let employee_id = await Select(select_emmployee_id);
            employee_id = employee_id[0]?.employee_id;

            let select_wallet_sql = SelectStatement(
                `SELECT
                mw_id as id,
                mw_employee_id as employee_id,
                mw_previous_amount as previous_amount,
                mw_current_amount as current_amount
                FROM master_wallet
                WHERE mw_employee_id = ${employee_id}`
            );
            let walletResult = await Select(select_wallet_sql);

            let previous_amount = walletResult[0]?.previous_amount;
            let current_amount = amount_obtained - amount_expended;
            if (current_amount < 0) {
                current_amount = 0;
            }

            let wallet_data = [previous_amount, current_amount, employee_id];
            let update_wallet_sql = UpdateStatement(
                Masters.master_wallet.tablename,
                [Masters.master_wallet.selectOptionsColumn.previous_amount,
                Masters.master_wallet.selectOptionsColumn.current_amount],
                [Masters.master_wallet.selectOptionsColumn.employee_id]
            );
            await Update(update_wallet_sql, [wallet_data]);

            let wallet_activityData = [
                [
                    walletResult[0]?.id,
                    `Updated wallet balance from:${previous_amount} to ${current_amount}`,
                    created_at
                ]
            ];
            let wallet_activity_insert_sql = InsertStatement(
                Masters.master_wallet_activity.tablename,
                Masters.master_wallet_activity.prefix,
                Masters.master_wallet_activity.insertColumns
            );
            await Insert(wallet_activity_insert_sql, wallet_activityData);


            res.status(200).json(JsonResponseSuccess());
        }


    } catch (error) {
        console.log(error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.put("/update_liquidation", async (req, res) => {
    try {
        const { status, id, remarks, receipts, created_by } = req.body;
        console.log("test", req.body)
        let created_at = GetCurrentDatetime();
        if (!id || !status) {
            return res.status(400).json(JsonResposeError("Missing required fields"));
        }

        async function ProcessData() {

            if (status === "approved") {
                let data = [status, id];
                let update_sql = UpdateStatement(


                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status],
                    [Liquidations.liquidation.selectOptionsColumn.id]
                );
                await Update(update_sql, [data]);

                let activityData = [
                    [
                        id,
                        "NOTED",
                        remarks || "",
                        receipts,
                        created_at,
                        created_by
                    ]
                ];
                let activity_insert_sql = InsertStatement(
                    Liquidations.liquidation_activity.tablename,
                    Liquidations.liquidation_activity.prefix,
                    Liquidations.liquidation_activity.insertColumns
                );
                await Insert(activity_insert_sql, activityData);

            } else if (status === "verified") {
                let data = [status, id];
                let update_sql = UpdateStatement(
                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status],
                    [Liquidations.liquidation.selectOptionsColumn.id]
                );
                await Update(update_sql, [data]);

                let activityData = [
                    [
                        id,
                        "CHECKED",
                        "",
                        receipts,
                        created_at,
                        created_by
                    ]
                ];
                let activity_insert_sql = InsertStatement(
                    Liquidations.liquidation_activity.tablename,
                    Liquidations.liquidation_activity.prefix,
                    Liquidations.liquidation_activity.insertColumns
                );
                await Insert(activity_insert_sql, activityData);
                let select_liquidation = SelectStatement(
                    `SELECT
                    l_cr_reference_id as reference_id,
                    l_amount_obtained as amount_issued,
                    l_amount_expended as amount_expended,
                    IF(l_amount_expended > l_amount_obtained, l_amount_expended - l_amount_obtained, 0) as amount_reimburse,
                    IF(l_amount_expended < l_amount_obtained, l_amount_obtained - l_amount_expended, 0) as amount_return,
                    cr_cv_number as cash_voucher
                    FROM liquidation
                    INNER JOIN cash_request ON l_cr_reference_id = cr_reference_id
                    WHERE l_id = ?
                    `,
                    [id]
                );
                let liquidation = await Select(select_liquidation);

                let select_emmployee_id = SelectStatement(
                    `SELECT
                    cr_employee_id as employee_id
                    FROM cash_request
                    WHERE cr_reference_id = "${liquidation[0]?.reference_id}"`
                );
                let employee_id = await Select(select_emmployee_id);
                employee_id = employee_id[0]?.employee_id;

                let select_wallet_sql = SelectStatement(
                    `SELECT
                    mw_id as id,
                    mw_employee_id as employee_id,
                    mw_previous_amount as previous_amount,
                    mw_current_amount as current_amount
                    FROM master_wallet
                    WHERE mw_employee_id = "${employee_id}"`
                );
                let walletResult = await Select(select_wallet_sql);
                let { previous_amount, current_amount } = walletResult[0];

                let wallet_data = [current_amount, 0, employee_id];
                let update_wallet_sql = UpdateStatement(
                    Masters.master_wallet.tablename,
                    [Masters.master_wallet.selectOptionsColumn.previous_amount,
                    Masters.master_wallet.selectOptionsColumn.current_amount],
                    [Masters.master_wallet.selectOptionsColumn.employee_id]
                );
                await Update(update_wallet_sql, [wallet_data]);

                let wallet_activityData = [
                    [
                        walletResult[0]?.id,
                        `Updated wallet balance from:${previous_amount} to ${current_amount}`,
                        created_at
                    ]
                ];
                let wallet_activity_insert_sql = InsertStatement(
                    Masters.master_wallet_activity.tablename,
                    Masters.master_wallet_activity.prefix,
                    Masters.master_wallet_activity.insertColumns
                );
                await Insert(wallet_activity_insert_sql, wallet_activityData);

                return res.status(200).json(liquidation);
            } else if (status === "completed") {


                let data = [status, id];
                let update_sql = UpdateStatement(
                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status],
                    [Liquidations.liquidation.selectOptionsColumn.id]
                );
                await Update(update_sql, [data]);

                let activityData = [
                    [
                        id,
                        "APPROVED",
                        "",
                        receipts,
                        created_at,
                        created_by
                    ]
                ];
                let activity_insert_sql = InsertStatement(
                    Liquidations.liquidation_activity.tablename,
                    Liquidations.liquidation_activity.prefix,
                    Liquidations.liquidation_activity.insertColumns
                );
                await Insert(activity_insert_sql, activityData);


            } else if (status === "rejected") {
                let data = [
                    [status, id],
                ];
                let update_sql = UpdateStatement(
                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status],
                    [Liquidations.liquidation.selectOptionsColumn.id],
                );
                await Update(update_sql, data);

                let activityData = [
                    [
                        id,
                        "REJECTED",
                        remarks || "",
                        receipts,
                        created_at,
                        created_by
                    ]
                ];
                let activity_insert_sql = InsertStatement(
                    Liquidations.liquidation_activity.tablename,
                    Liquidations.liquidation_activity.prefix,
                    Liquidations.liquidation_activity.insertColumns
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

router.put("/update_liquidation_rejected", async (req, res) => {
    try {
        const { liquidation_id, items, remarks, receipts } = req.body;
        console.log("rejected", items);

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
          WHERE l_id = ?`,
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

        let data = [amount_expended, reimburse_return, liquidation_id];
        let update_liquidation_sql = UpdateStatement(
            Liquidations.liquidation.tablename,
            [
                Liquidations.liquidation.selectOptionsColumn.amount_expended,
                Liquidations.liquidation.selectOptionsColumn.reimburse_return,
            ],
            [Liquidations.liquidation.selectOptionsColumn.id]
        );
        await Update(update_liquidation_sql, [data]);

        let existingItems = await Select(
            SelectStatement(
                `SELECT li_id FROM liquidation_item WHERE li_liquidation_id = ?`,
                [liquidation_id]
            )
        );
        let existingIds = existingItems.map(row => row.li_id);

        let incomingIds = items && Array.isArray(items) ? items.map(i => i.id).filter(id => id) : [];

        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (!item.date || !item.particulars || !item.amount) {
                    return res.status(400).json(JsonResposeError("Each item must have id, date, particulars, and amount"));
                }

                if (item.id && existingIds.includes(item.id)) {
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
                } else if (!item.id) {
                    // --- Insert new item if no id ---
                    let insertData = [[
                        liquidation_id,
                        item.date,
                        item.rt || "",
                        item.store_name || "",
                        item.particulars,
                        item.from || "",
                        item.to || "",
                        item.mode_of_transportation || "",
                        parseFloat(item.amount),
                    ]];

                    let insert_item_sql = InsertStatement(
                        Liquidations.liquidation_item.tablename,
                        Liquidations.liquidation_item.prefix,
                        Liquidations.liquidation_item.insertColumns
                    );


                    await Insert(insert_item_sql, insertData);
                }
            }
        }

        let idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
        if (idsToDelete.length > 0) {
            await Delete(
                `DELETE FROM liquidation_item WHERE li_id IN (${idsToDelete.map(() => "?").join(",")})`,
                idsToDelete
            );
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

        let statusData = ["pending", liquidation_id];
        let update_status_sql = UpdateStatement(
            Liquidations.liquidation.tablename,
            [Liquidations.liquidation.selectOptionsColumn.status],
            [Liquidations.liquidation.selectOptionsColumn.id]
        );
        await Update(update_status_sql, [statusData]);

        await Delete(
            `DELETE FROM liquidation_activity WHERE lia_liquidation_id = ? AND lia_action != 'PREPARED'`,
            [liquidation_id]
        );

        res.status(200).json(JsonResponseSuccess());
    } catch (error) {
        console.error("Error in update_liquidation_rejected:", error);
        res.status(500).json(JsonResposeError(error));
    }
});


