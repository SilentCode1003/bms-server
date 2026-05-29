var express = require('express');
const {
    JsonResposeError,
    JsonResponseData,
    JsonResponseSuccess,
} = require("../repository/helper/enums");
const {
    SelectStatement,
    SelectAllStatement,
    SelectWhereStatement,
    InsertStatement,
    UpdateStatement,
    GetCurrentDate
} = require("../repository/helper/customhelper");
const { Masters } = require("../repository/model/masters");
const { Select, Insert, Update } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const { EncrypterString, DecrypterString } = require("../repository/helper/crytography");
const jwt = require('jsonwebtoken');
var router = express.Router();

const emitNotificationUpdate = (req, event, data) => {
    const io = req.app.get('io');
    if (io) {
        io.emit(`notification:${event}`, data);
    }
};
/* GET red_flags page. */
router.get('/', function (req, res, next) {
    res.render('red_flags', { title: 'Express' });
});

module.exports = router;

router.get('/getred_flags', async (req, res) => {
    try {
        async function ProcessData() {
            let select_red_flags_sql = SelectStatement(
                `SELECT
                            rf_id as id,
                            rf_liquidation_id as liquidation_id,
                            rf_liquidation_item_id as liquidation_item_id,
                            rf_from as flag_from,
                            rf_to as flag_to,
                            rf_mode_of_transportation as mode_of_transportation,
                            rf_min_amount as min_amount,
                            rf_max_amount as max_amount,
                            rf_amount as amount,
                            rf_created_by as created_by,
                            rf_created_date as created_date,
                            rf_status as status,
                            rf_approval_status as approval_status,
                            rf_updated_by as updated_by,
                            rf_updated_date as updated_date
                            FROM red_flags
                            `
            );

            let red_flags_result = await Select(select_red_flags_sql);

            emitNotificationUpdate(req, 'fetched', {
                event: 'red_flags_fetched',
                status: 'success',
                count: red_flags_result.length,
                timestamp: new Date().toISOString()
            });

            const io = req.app.get('io');
            if (io) {
                io.emit('red_flags:fetched', {
                    status: 'success',
                    count: red_flags_result.length,
                    timestamp: new Date().toISOString()
                });
            }
            return res.status(200).json({ red_flags_result });
        }

        await ProcessData();
    } catch (error) {
        console.error("Error during getred_flags:", error);
        emitNotificationUpdate(req, 'error', {
            event: 'red_flags_fetch_error',
            status: 'error',
            message: 'Failed to fetch red_flags',
            error: error.message,
            timestamp: new Date().toISOString()
        });
        res.status(500).json(JsonResposeError(error));
    }
});

router.get('/getred_flags_by_search', async (req, res) => {
    try {
        const { search, offset, limit } = req.query;
        let limitValue =
            limit && limit !== "0" && limit !== "-1" && limit !== ""
                ? parseInt(limit)
                : 999999;
        let offsetValue =
            offset && offset !== "0" && offset !== "-1" && offset !== ""
                ? parseInt(offset)
                : 0;
        async function ProcessData() {
            let select_district_sql;

            if (search && search.trim() !== "") {

                const keyword = `%${search.replace(/'/g, "\\'")}%`;

                select_district_sql = SelectStatement(
                    `SELECT
            rf_id as id,
            rf_liquidation_id as liquidation_id,
            rf_liquidation_item_id as liquidation_item_id,
            rf_from as flag_from,
            rf_to as flag_to,
            rf_mode_of_transportation as mode_of_transportation,
            rf_min_amount as min_amount,
            rf_max_amount as max_amount,
            rf_amount as amount,
            rf_created_by as created_by,
            rf_created_date as created_date,
            rf_status as status,
            rf_approval_status as approval_status,
            rf_updated_by as updated_by,
            rf_updated_date as updated_date
           FROM red_flags
           WHERE
             rf_liquidation_id LIKE ? OR 
             rf_from LIKE ? OR
             rf_to LIKE ? OR
             rf_mode_of_transportation LIKE ? OR
             rf_min_amount LIKE ? OR
             rf_max_amount LIKE ? OR
             rf_amount LIKE ? OR
             rf_created_by LIKE ? OR
             rf_created_date LIKE ? OR
             rf_approval_status = 'PENDING'
           ORDER BY rf_created_date ASC
           LIMIT ${limitValue} OFFSET ${offsetValue}`,
                    [
                        keyword, keyword, keyword, keyword, keyword,
                        keyword, keyword, keyword, keyword, keyword, keyword
                    ]
                );
            } else {
                select_district_sql = SelectStatement(
                    `SELECT
            rf_id as id,
            rf_liquidation_id as liquidation_id,
            rf_liquidation_item_id as liquidation_item_id,
            rf_from as flag_from,
            rf_to as flag_to,
            rf_mode_of_transportation as mode_of_transportation,
            rf_min_amount as min_amount,
            rf_max_amount as max_amount,
            rf_amount as amount,
            rf_created_by as created_by,
            rf_created_date as created_date,
            rf_status as status,
            rf_approval_status as approval_status,
            rf_updated_by as updated_by,
            rf_updated_date as updated_date
           FROM red_flags
           WHERE rf_approval_status = 'PENDING'
           ORDER BY rf_created_date ASC
           LIMIT ${limitValue} OFFSET ${offsetValue}`
                );
            } let result = await Select(select_district_sql);

            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error fetching districts:", error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.put('/update_red_flags_approval', async (req, res) => {
    try {
        const { id, status, updated_by } = req.body;

        let currentDate = GetCurrentDate();

        if (status === "APPLIED") {

            let select_approved_red_flags_sql = SelectStatement(
                `SELECT rf_id, rf_from, rf_to, rf_mode_of_transportation, rf_amount, rf_status FROM red_flags WHERE rf_id = ?`,
                [id]
            );
            let approved_red_flags_result = await Select(select_approved_red_flags_sql);
            const { rf_id, rf_from, rf_to, rf_mode_of_transportation, rf_amount, rf_status } = approved_red_flags_result[0];

            let select_red_flag_sql = SelectStatement(
                `SELECT
                rf_id
                FROM red_flags
                WHERE rf_from = ? AND rf_to = ? AND rf_mode_of_transportation = ? AND rf_approval_status = ?
                `,
                [rf_from, rf_to, rf_mode_of_transportation, 'APPLIED']
            );

            let select_red_flag_result = await Select(select_red_flag_sql);
            
            if (select_red_flag_result.length > 0) {
                let red_flag_id = select_red_flag_result[0].rf_id;



                let update_red_flag_pending_sql = UpdateStatement(
                    Masters.red_flags.tablename,
                    [
                        Masters.red_flags.selectOptionsColumn.approval_status,
                        Masters.red_flags.selectOptionsColumn.updated_by,
                        Masters.red_flags.selectOptionsColumn.updated_date,
                    ],
                    [
                        Masters.red_flags.selectOptionsColumn.id
                    ]
                );

                let update_red_flag_pendingData = [
                    ['PENDING', updated_by, currentDate, red_flag_id]
                ];

                await Update(update_red_flag_pending_sql, update_red_flag_pendingData);

            }


            let update_apllied_red_flags_sql = UpdateStatement(
                Masters.red_flags.tablename,
                [
                    Masters.red_flags.selectOptionsColumn.approval_status,
                    Masters.red_flags.selectOptionsColumn.updated_by,
                    Masters.red_flags.selectOptionsColumn.updated_date,
                ],
                [
                    Masters.red_flags.selectOptionsColumn.id,
                ]
            );
            let update_apllied_red_flagsData = [
                ['APPLIED', updated_by, currentDate, id]
            ];

            let update_apllied_red_flags_result = await Update(update_apllied_red_flags_sql, update_apllied_red_flagsData);



            if (rf_status === "MAXIMUM") {
                let update_min_max_sql = UpdateStatement(
                    Masters.master_min_max.tablename,
                    [
                        Masters.master_min_max.selectOptionsColumn.max_amount,
                    ],
                    [
                        Masters.master_min_max.selectOptionsColumn.from,
                        Masters.master_min_max.selectOptionsColumn.to,
                        Masters.master_min_max.selectOptionsColumn.mode_of_transportation
                    ]
                );

                let update_min_maxData = [
                    [rf_amount, rf_from, rf_to, rf_mode_of_transportation]
                ];

                await Update(update_min_max_sql, update_min_maxData);
            } else {
                let update_min_max_sql = UpdateStatement(
                    Masters.master_min_max.tablename,
                    [
                        Masters.master_min_max.selectOptionsColumn.min_amount,
                    ],
                    [
                        Masters.master_min_max.selectOptionsColumn.from,
                        Masters.master_min_max.selectOptionsColumn.to,
                        Masters.master_min_max.selectOptionsColumn.mode_of_transportation
                    ]
                );
                let update_min_maxData = [
                    [rf_amount, rf_from, rf_to, rf_mode_of_transportation]
                ];

                await Update(update_min_max_sql, update_min_maxData);
            }

        } else if (status === "REJECTED") {
            let update_red_flag_pending_sql = UpdateStatement(
                Masters.red_flags.tablename,
                [
                    Masters.red_flags.selectOptionsColumn.approval_status,
                    Masters.red_flags.selectOptionsColumn.updated_by,
                    Masters.red_flags.selectOptionsColumn.updated_date,
                ],
                [
                    Masters.red_flags.selectOptionsColumn.id
                ]
            );

            let update_red_flag_pendingData = [
                ['REJECTED', updated_by, currentDate, id]
            ];

            await Update(update_red_flag_pending_sql, update_red_flag_pendingData);

        }

        emitNotificationUpdate(req, 'updated', {
            event: 'red_flags_updated',
            status: 'success',
            count: 1,
            timestamp: new Date().toISOString()
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('red_flags:updated', {
                status: 'success',
                count: 1,
                timestamp: new Date().toISOString()
            });
        }
        return res.status(200).json({ message: 'Red flags updated successfully' });
    } catch (error) {
        console.error("Error during update_red_flags:", error);
        emitNotificationUpdate(req, 'error', {
            event: 'red_flags_update_error',
            status: 'error',
            message: 'Failed to update red_flags',
            error: error.message,
            timestamp: new Date().toISOString()
        });
        res.status(500).json(JsonResposeError(error));
    }
});
