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

// Function to emit liquidation updates
const emitLiquidationUpdate = (req, event, data) => {
    const io = req.app.get('io');
    if (io) {
        io.emit(`liquidation:${event}`, data);
    }
};

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
                } else if (status.toLowerCase() === 'pending') {
                    whereConditions.push(`l.l_status = '${status}'`);
                } else {
                    whereConditions.push(`l.l_status = '${status}'`);
                }
            }

            if (employee_id) {
                whereConditions.push(`cr.cr_employee_id = '${employee_id}'`);
            }

            let whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')} ` : "";

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
                                'store', li.li_store_name,
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

            emitLiquidationUpdate(req, 'fetched', {
                event: 'liquidation_fetched',
                status: 'success',
                count: result.length,
                filters: { status, employee_id },
                timestamp: new Date().toISOString()
            });

            const io = req.app.get('io');
            if (io) {
                io.emit('liquidation:fetched', {
                    status: 'success',
                    count: result.length,
                    filters: { status, employee_id },
                    timestamp: new Date().toISOString()
                });
            }

            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error fetching liquidations:", error);
        emitLiquidationUpdate(req, 'error', {
            event: 'liquidation_fetch_error',
            status: 'error',
            message: 'Failed to fetch liquidations',
            error: error.message,
            timestamp: new Date().toISOString()
        });
        res.status(500).json(JsonResposeError(error));
    }
});

router.get('/getcash_liquidation_id', async (req, res) => {
    try {
        const { id } = req.query;

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

            emitLiquidationUpdate(req, 'activities_fetched', {
                event: 'liquidation_activities_fetched',
                status: 'success',
                liquidation_id: parseInt(id, 10),
                count: result.length,
                timestamp: new Date().toISOString()
            });

            const io = req.app.get('io');
            if (io) {
                io.emit('liquidation:activities_fetched', {
                    status: 'success',
                    liquidation_id: parseInt(id, 10),
                    count: result.length,
                    timestamp: new Date().toISOString()
                });
            }

            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error fetching liquidation activities:", error.sqlMessage);
        emitLiquidationUpdate(req, 'error', {
            event: 'liquidation_activities_fetch_error',
            status: 'error',
            message: 'Failed to fetch liquidation activities',
            error: error.sqlMessage || error.message,
            timestamp: new Date().toISOString()
        });
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
              SUM(li.li_amount) AS amount
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

            emitLiquidationUpdate(req, 'approved_fetched', {
                event: 'liquidation_approved_fetched',
                status: 'success',
                count: result.length,
                filter_status: status || null,
                timestamp: new Date().toISOString()
            });

            const io = req.app.get('io');
            if (io) {
                io.emit('liquidation:approved_fetched', {
                    status: 'success',
                    count: result.length,
                    filter_status: status || null,
                    timestamp: new Date().toISOString()
                });
            }

            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error during getapproved_liquidation:", error);
        emitLiquidationUpdate(req, 'error', {
            event: 'liquidation_approved_fetch_error',
            status: 'error',
            message: 'Failed to fetch approved liquidations',
            error: error.message,
            timestamp: new Date().toISOString()
        });
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
    const { beginTransaction, commitTransaction, rollbackTransaction } = require('../repository/helper/dbconnect');
    let connection;
    try {
        const { reference_id, description, amount_obtained, amount_expended, reimburse_return, request_items, remarks, receipts, created_by } = req.body;
        connection = await beginTransaction();
        console.log(request_items)
        let status = "PENDING";
        let request_date = GetCurrentDatetime();
        let action = "PREPARED";
        let created_at = GetCurrentDatetime();

        const [existingLiquidation] = await connection.query(
            `SELECT * FROM liquidation WHERE l_cr_reference_id = ?`,
            [reference_id]
        );

        if (existingLiquidation.length > 0) {
            await rollbackTransaction(connection);
            return res.status(400).json(JsonResposeError("Liquidation with same reference id already exists"));
        }
        if (Array.isArray(request_items) && request_items.length > 0) {
            const cleanedItems = request_items.map(item => ({
                store_name: (item.store_name || "").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase().trim(),
                to: (item.to || "").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase().trim()
            }));

            const uniqueStores = [...new Set(cleanedItems.map(i => i.store_name).filter(Boolean))];

            let hasReachedAllDestinations = false;

            if (uniqueStores.length === 1) {
                const store = uniqueStores[0];
                hasReachedAllDestinations = cleanedItems.some(i => i.to === store);
            } else {
                hasReachedAllDestinations = uniqueStores.every(store =>
                    cleanedItems.some(i => i.to === store)
                );
            }

            if (!hasReachedAllDestinations) {
                return res.status(400).json(
                    JsonResposeError(
                        "Please mention the store destination you reached in the 'TO' column input field so we know you reached the store."
                    )
                );
            }
        }
        const io = req.app.get('io');
        if (io) {
            io.emit('liquidation:creating', {
                reference_id,
                description,
                amount_obtained,
                amount_expended,
                reimburse_return,
                timestamp: new Date().toISOString()
            });
        }

        const liquidationData = [
            reference_id,
            description,
            amount_obtained,
            amount_expended,
            reimburse_return,
            request_date,
            status
        ];

        const insertSql = `
            INSERT INTO ${Liquidations.liquidation.tablename} (
                l_cr_reference_id,
                l_description,
                l_amount_obtained,
                l_amount_expended,
                l_reimburse_return,
                l_created_date,
                l_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [liquidationResult] = await connection.query(insertSql, liquidationData);
        const liquidation_id = liquidationResult.insertId;

        if (!liquidation_id) {
            await rollbackTransaction(connection);
            return res.status(400).json(JsonResposeError("Failed to insert liquidation"));
        }

        if (Array.isArray(request_items) && request_items.length > 0) {
            for (const [index, item] of request_items.entries()) {
                if (!item.date || !item.particulars) {
                    await rollbackTransaction(connection);
                    return res.status(400).json(
                        JsonResposeError(`Request item at index ${index} is missing required fields (date, particulars).`)
                    );
                }
            }

            const activityData = [
                liquidation_id,
                action,
                remarks || "",
                receipts ? JSON.stringify(receipts) : null,
                created_at,
                created_by
            ];

            const activityInsertSql = `
            INSERT INTO ${Liquidations.liquidation_activity.tablename} (
                lia_liquidation_id,
                lia_action,
                lia_remarks,
                lia_receipts,
                lia_created_at,
                lia_created_by
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

            await connection.query(activityInsertSql, activityData);

            await commitTransaction(connection);
            const insertedItems = [];
            const itemInsertSql = InsertStatement(
                Liquidations.liquidation_item.tablename,
                Liquidations.liquidation_item.prefix,
                Liquidations.liquidation_item.insertColumns
            );

            for (const item of request_items) {
                const cleanFrom = (item.from || "").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();
                const cleanTo = (item.to || "").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();
                const cleanMode = (item.mode_of_transportation || "").replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();
                const amount = parseFloat(item.amount) || 0;

                const values = [
                    liquidation_id,
                    item.date || "N/A",
                    item.rt || "N/A",
                    item.store_name || "N/A",
                    item.particulars || "N/A",
                    cleanFrom,
                    cleanTo,
                    cleanMode,
                    amount
                ];

                const [result] = await connection.query(itemInsertSql, [[values]]);
                const insertedId = result.insertId;

                console.log("Inserted liquidation_item_id:", result);

                insertedItems.push({
                    liquidation_id,
                    liquidation_item_id: insertedId,
                    from: cleanFrom,
                    to: cleanTo,
                    mode: cleanMode,
                    amount
                });
            }

            // const select_red_flags_sql = SelectStatement(`
            //     WITH counted AS (
            //         SELECT 
            //         li.li_from,
            //         li.li_to,
            //         li.li_mode_of_transportation,
            //         li.li_amount,
            //         COUNT(*) AS cnt
            //         FROM liquidation_item li
            //         LEFT JOIN liquidation l ON li.li_liquidation_id = l.l_id
            //         WHERE l.l_status != 'rejected'
            //         GROUP BY li.li_from, li.li_to, li.li_mode_of_transportation, li.li_amount
            //     ),
            //     ranked AS (
            //         SELECT 
            //         li_from,
            //         li_to,
            //         li_mode_of_transportation,
            //         li_amount,
            //         cnt,
            //         DENSE_RANK() OVER (
            //             PARTITION BY li_from, li_to, li_mode_of_transportation
            //             ORDER BY cnt DESC
            //         ) AS rnk
            //         FROM counted
            //     )
            //     SELECT 
            //         li_from AS started_from,
            //         li_to AS ended_to,
            //         li_mode_of_transportation AS mode_of_transportation,
            //         MIN(CASE WHEN rnk = 1 THEN li_amount END) AS min_amount,
            //         MAX(CASE WHEN rnk IN (1,2) THEN li_amount END) AS max_amount
            //     FROM ranked
            //     GROUP BY li_from, li_to, li_mode_of_transportation
            //     ORDER BY started_from, ended_to, mode_of_transportation;
            //     `);

            // const red_flags = await Select(select_red_flags_sql);
            // const redFlaggedItems = [];

            // for (const item of insertedItems) {
            //     const match = red_flags.find(
            //         r =>
            //             r.started_from === item.from &&
            //             r.ended_to === item.to &&
            //             r.mode_of_transportation === item.mode
            //     );

            //     if (match) {
            //         const { min_amount, max_amount } = match;

            //         if (item.amount < min_amount || item.amount > max_amount) {
            //             redFlaggedItems.push({
            //                 rf_liquidation_id: item.liquidation_id,
            //                 rf_liquidation_item_id: item.liquidation_item_id,
            //                 rf_from: item.from,
            //                 rf_to: item.to,
            //                 rf_mode_of_transportation: item.mode,
            //                 rf_amount: item.amount,
            //                 rf_min_amount: min_amount,
            //                 rf_max_amount: max_amount,
            //                 rf_created_by: created_by,
            //                 rf_created_date: new Date().toISOString().slice(0, 19).replace("T", " ")
            //             });
            //         }
            //     }
            // }

            // if (redFlaggedItems.length > 0) {
            //     const redFlagInsertSql = InsertStatement(
            //         Masters.red_flags.tablename,
            //         Masters.red_flags.prefix,
            //         Masters.red_flags.insertColumns
            //     );

            //     for (const rf of redFlaggedItems) {
            //         const values = [
            //             rf.rf_liquidation_id,
            //             rf.rf_liquidation_item_id,
            //             rf.rf_from,
            //             rf.rf_to,
            //             rf.rf_mode_of_transportation,
            //             rf.rf_min_amount,
            //             rf.rf_max_amount,
            //             rf.rf_amount,
            //             rf.rf_created_by,
            //             rf.rf_created_date
            //         ];

            //         await connection.query(redFlagInsertSql, [[values]]);
            //     }
            // }

            // console.log("✅ Red flagged items:", redFlaggedItems);
        }



        if (io) {
            io.emit('liquidation:created', {
                id: liquidation_id,
                reference_id,
                status,
                amount_obtained,
                amount_expended,
                reimburse_return,
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json(JsonResponseSuccess({ id: liquidation_id }));

    } catch (error) {
        console.error("Error in create_liquidation:", error);

        if (connection) {
            await rollbackTransaction(connection);
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('liquidation:create_error', {
                message: error.message || 'An error occurred while creating the liquidation',
                timestamp: new Date().toISOString()
            });
        }

        res.status(500).json(JsonResposeError(error.message || "An error occurred while creating the liquidation"));
    } finally {
        if (connection) {
            await connection.release();
        }
    }
});

router.put("/update_liquidation", async (req, res) => {
    try {
        const { status, id, remarks, receipts, created_by } = req.body;
        console.log(req.body)
        let created_at = GetCurrentDatetime();
        if (!id || !status) {
            return res.status(400).json(JsonResposeError("Missing required fields"));
        }

        async function ProcessData() {
            emitLiquidationUpdate(req, 'updating', {
                event: 'liquidation_updating',
                status: 'in_progress',
                liquidation_id: id,
                new_status: status,
                timestamp: new Date().toISOString()
            });

            if (status === "approved") {
                let data = [status, 1, id];
                let update_sql = UpdateStatement(
                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status, Liquidations.liquidation.selectOptionsColumn.notification],
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

                emitLiquidationUpdate(req, 'approved', {
                    event: 'liquidation_approved',
                    status: 'success',
                    liquidation_id: id,
                    approved_by: created_by,
                    timestamp: new Date().toISOString()
                });

            } else if (status === "verified") {
                let data = [status, 1, id];
                let update_sql = UpdateStatement(
                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status, Liquidations.liquidation.selectOptionsColumn.notification],
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

                emitLiquidationUpdate(req, 'verified', {
                    event: 'liquidation_verified',
                    status: 'success',
                    liquidation_id: id,
                    reference_id: liquidation[0]?.reference_id,
                    cash_voucher: liquidation[0]?.cash_voucher,
                    amount_expended: liquidation[0]?.amount_expended,
                    amount_issued: liquidation[0]?.amount_issued,
                    updated_by: created_by,
                    timestamp: new Date().toISOString()
                });

                return res.status(200).json(liquidation);
            } else if (status === "completed") {


                let data = [status, 1, id];
                let update_sql = UpdateStatement(
                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status,
                    Liquidations.liquidation.selectOptionsColumn.notification],
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

                emitLiquidationUpdate(req, 'completed', {
                    event: 'liquidation_completed',
                    status: 'success',
                    liquidation_id: id,
                    updated_by: created_by,
                    timestamp: new Date().toISOString()
                });


            } else if (status === "rejected") {
                let data = [
                    [status, 1,  id],
                ];
                let update_sql = UpdateStatement(
                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status,
                    Liquidations.liquidation.selectOptionsColumn.notification],
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

                emitLiquidationUpdate(req, 'rejected', {
                    event: 'liquidation_rejected',
                    status: 'success',
                    liquidation_id: id,
                    remarks: remarks || "",
                    updated_by: created_by,
                    timestamp: new Date().toISOString()
                });
            } else if (status === "incomplete") {
                let data = [
                    [status, 1, id],
                ];
                let update_sql = UpdateStatement(
                    Liquidations.liquidation.tablename,
                    [Liquidations.liquidation.selectOptionsColumn.status,
                    Liquidations.liquidation.selectOptionsColumn.notification],
                    [Liquidations.liquidation.selectOptionsColumn.id],
                );
                await Update(update_sql, data);

                let activityData = [
                    [
                        id,
                        "INCOMPLETE",
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

                emitLiquidationUpdate(req, 'incomplete', {
                    event: 'liquidation_incomplete',
                    status: 'success',
                    liquidation_id: id,
                    remarks: remarks || "",
                    updated_by: created_by,
                    timestamp: new Date().toISOString()
                });
            }

            emitLiquidationUpdate(req, 'updated', {
                event: 'liquidation_updated',
                status: 'success',
                liquidation_id: id,
                new_status: status,
                updated_by: created_by,
                timestamp: new Date().toISOString()
            });
            res.status(200).json(JsonResponseSuccess());
        }

        await ProcessData();
    } catch (error) {
        console.log(error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.put("/update_liquidation_rejected", async (req, res) => {
    const { beginTransaction, commitTransaction, rollbackTransaction } = require('../repository/helper/dbconnect');
    let connection;
    try {
        const { liquidation_id, items, remarks, receipts, status, updated_by } = req.body;
        console.log("update liquidation rejected", req.body);

        if (!liquidation_id) {
            return res.status(400).json(JsonResposeError("Missing liquidation_id"));
        }

        // if (!Array.isArray(items) || items.length === 0) {
        //     return res.status(400).json(JsonResposeError("At least one item is required"));
        // }

        // for (const item of items) {
        //     if (!item.date || !item.particulars) {
        //         return res.status(400).json(
        //             JsonResposeError("Each item must have date, particulars, and amount")
        //         );
        //     }
        // }

        connection = await beginTransaction();

        try {
            let storedReceipts = Array.isArray(receipts)
                ? receipts.map((r, i) => ({
                    id: r.id || (i + 1).toString(),
                    image: r.image || "",
                }))
                : [];

            const [liquidation] = await connection.query(
                `SELECT l_amount_obtained AS amount_obtained 
                 FROM liquidation 
                 WHERE l_id = ? 
                 FOR UPDATE`,
                [liquidation_id]
            );

            const amount_obtained = liquidation?.[0]?.amount_obtained || 0;

            const amount_expended = items.reduce(
                (sum, i) => sum + (parseFloat(i.amount) || 0),
                0
            );
            let reimburse_return = amount_obtained - amount_expended;
            if (reimburse_return < 0) reimburse_return = Math.abs(reimburse_return);

            await connection.query(
                `UPDATE ${Liquidations.liquidation.tablename} 
                 SET l_amount_expended = ?, 
                     l_reimburse_return = ? 
                 WHERE l_id = ?`,
                [amount_expended, reimburse_return, liquidation_id]
            );

            await connection.query(
                `DELETE FROM red_flags WHERE rf_liquidation_id = ?`,
                [liquidation_id]
            );
            await connection.query(
                `DELETE FROM liquidation_item WHERE li_liquidation_id = ?`,
                [liquidation_id]
            );

            const itemsData = items.map((item) => [
                liquidation_id,
                item.date || "N/A",
                item.rt || "N/A",
                item.store_name || "N/A",
                item.particulars || "N/A",
                item.from || "N/A",
                item.to || "N/A",
                item.mode_of_transportation || "N/A",
                parseFloat(item.amount) || 0,
            ]);

            if (itemsData.length > 0) {
                const insert_item_sql = InsertStatement(
                    Liquidations.liquidation_item.tablename,
                    Liquidations.liquidation_item.prefix,
                    Liquidations.liquidation_item.insertColumns
                );
                await connection.query(insert_item_sql, [itemsData]);

                const [insertedRows] = await connection.query(
                    `SELECT li_id, li_liquidation_id, li_from, li_to, li_mode_of_transportation, li_amount 
                    FROM liquidation_item 
                    WHERE li_liquidation_id = ? 
                    ORDER BY li_id DESC LIMIT ?`,
                    [liquidation_id, itemsData.length]
                );

                const insertedItems = insertedRows.map(row => ({
                    liquidation_id: row.li_liquidation_id,
                    liquidation_item_id: row.li_id,
                    from: row.li_from,
                    to: row.li_to,
                    mode: row.li_mode_of_transportation,
                    amount: parseFloat(row.li_amount) || 0
                }));
                // if (insertedItems.length > 0) {
                //     const select_red_flags_sql = `
                //         WITH counted AS (
                //             SELECT 
                //                 li.li_from,
                //                 li.li_to,
                //                 li.li_mode_of_transportation,
                //                 li.li_amount,
                //                 COUNT(*) AS cnt
                //             FROM liquidation_item li
                //             LEFT JOIN liquidation l ON li.li_liquidation_id = l.l_id
                //             WHERE l.l_status != 'rejected'
                //             AND li.li_liquidation_id != ?
                //             GROUP BY li.li_from, li.li_to, li.li_mode_of_transportation, li.li_amount
                //         ),
                //         ranked AS (
                //             SELECT 
                //                 li_from,
                //                 li_to,
                //                 li_mode_of_transportation,
                //                 li_amount,
                //                 cnt,
                //                 DENSE_RANK() OVER (
                //                     PARTITION BY li_from, li_to, li_mode_of_transportation
                //                     ORDER BY cnt DESC
                //                 ) AS rnk
                //             FROM counted
                //         )
                //         SELECT 
                //             li_from AS started_from,
                //             li_to AS ended_to,
                //             li_mode_of_transportation AS mode_of_transportation,
                //             MIN(CASE WHEN rnk = 1 THEN li_amount END) AS min_amount,
                //             MAX(CASE WHEN rnk IN (1,2) THEN li_amount END) AS max_amount
                //         FROM ranked
                //         GROUP BY li_from, li_to, li_mode_of_transportation
                //         ORDER BY started_from, ended_to, mode_of_transportation;
                //     `;

                //     const [red_flags] = await connection.query(select_red_flags_sql, [liquidation_id]);
                //     const redFlaggedItems = [];

                //     for (const item of insertedItems) {
                //         const match = red_flags.find(
                //             r =>
                //                 r.started_from === item.from &&
                //                 r.ended_to === item.to &&
                //                 r.mode_of_transportation === item.mode
                //         );

                //         if (match) {
                //             const { min_amount, max_amount } = match;

                //             if (item.amount < min_amount || item.amount > max_amount) {
                //                 redFlaggedItems.push({
                //                     rf_liquidation_id: item.liquidation_id,
                //                     rf_liquidation_item_id: item.liquidation_item_id,
                //                     rf_from: item.from,
                //                     rf_to: item.to,
                //                     rf_mode_of_transportation: item.mode,
                //                     rf_amount: item.amount,
                //                     rf_min_amount: min_amount,
                //                     rf_max_amount: max_amount,
                //                     rf_created_by: updated_by,
                //                     rf_created_date: new Date().toISOString().slice(0, 19).replace("T", " ")
                //                 });
                //             }
                //         }
                //     }

                //     if (redFlaggedItems.length > 0) {
                //         const redFlagInsertSql = InsertStatement(
                //             Masters.red_flags.tablename,
                //             Masters.red_flags.prefix,
                //             Masters.red_flags.insertColumns
                //         );

                //         for (const rf of redFlaggedItems) {
                //             const values = [
                //                 rf.rf_liquidation_id,
                //                 rf.rf_liquidation_item_id,
                //                 rf.rf_from,
                //                 rf.rf_to,
                //                 rf.rf_mode_of_transportation,
                //                 rf.rf_min_amount,
                //                 rf.rf_max_amount,
                //                 rf.rf_amount,
                //                 rf.rf_created_by,
                //                 rf.rf_created_date
                //             ];

                //             await connection.query(redFlagInsertSql, [[values]]);
                //         }
                //     }

                //     console.log("✅ Red flagged items:", redFlaggedItems);
                // }
            }

            await connection.query(
                `UPDATE ${Liquidations.liquidation_activity.tablename} 
                 SET ${Liquidations.liquidation_activity.selectOptionsColumn.remarks} = ?,
                     ${Liquidations.liquidation_activity.selectOptionsColumn.receipts} = ?
                 WHERE ${Liquidations.liquidation_activity.selectOptionsColumn.liquidation_id} = ?
                 AND ${Liquidations.liquidation_activity.selectOptionsColumn.action} = ?`,
                [
                    remarks || "",
                    storedReceipts ? JSON.stringify(storedReceipts) : null,
                    liquidation_id,
                    "PREPARED"
                ]
            );
            if (status != "incomplete") {
                await connection.query(
                    `UPDATE liquidation 
                     SET l_status = ?,
                     l_notification = 1
                     WHERE l_id = ?`,
                    ["pending", liquidation_id]
                );
            } else {
                await connection.query(
                    `UPDATE liquidation 
                     SET l_status = ?,
                     l_notification = 1 
                     WHERE l_id = ?`,
                    ["verified", liquidation_id]
                );
            }

            await connection.query(
                `DELETE FROM liquidation_activity 
                 WHERE lia_liquidation_id = ? AND lia_action != 'PREPARED'`,
                [liquidation_id]
            );



            await commitTransaction(connection);

            emitLiquidationUpdate(req, 'reopened', {
                event: 'liquidation_reopened_after_rejection',
                status: 'success',
                liquidation_id,
                timestamp: new Date().toISOString()
            });

            res.status(200).json(JsonResponseSuccess());

        } catch (error) {
            await rollbackTransaction(connection);
            throw error;
        }
    } catch (error) {
        console.error("Error in update_liquidation_rejected:", error);
        res.status(500).json(JsonResposeError(error.message || "An error occurred while processing your request."));
    } finally {
        if (connection) {
            await connection.release();
        }
    }
});

router.put("/update_liquidation_notification", async (req, res) => {
    try {
        const { id, notification } = req.body;
        console.log(req.body);
        if (!id || notification === undefined) {
            return res.status(400).json(JsonResposeError("Missing required fields"));
        }

        let updateData = [[notification, id]];
        let update_liquidation_sql = UpdateStatement(
            Liquidations.liquidation.tablename,
            [Liquidations.liquidation.selectOptionsColumn.notification],
            [Liquidations.liquidation.selectOptionsColumn.id]
        );
        await Update(update_liquidation_sql, updateData);

        res.status(200).json(JsonResponseSuccess());
    } catch (error) {
        console.error("Error in update_liquidation_notification:", error);
        res.status(500).json(JsonResposeError(error));
    }
});