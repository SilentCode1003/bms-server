var express = require('express');
const {
    JsonResposeError,
    JsonResponseData,
    JsonResponseSuccess,
} = require("../repository/helper/enums");
const {
    SelectStatement,
    SelectAllStatement,
    InsertStatement,
    UpdateStatement,
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
                            rf_created_date as created_date
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

router.post('/update_red_flags', async (req, res) => {
    try {
        const { id, status } = req.body;

        let select_red_flags_sql = SelectStatement(
            `SELECT rf_id FROM red_flags WHERE rf_status = ?`,
            [status]
        );
        
        let red_flags_result = await Select(select_red_flags_sql);

        if (red_flags_result.length) {
            let update_red_flags_sql = UpdateStatement(
                Masters.red_flags.tablename,
                [Masters.red_flags.selectOptionsColumn.status],
                [Masters.red_flags.selectOptionsColumn.id]
            );
            let updateData = [['', red_flags_result[0].rf_id]];
            await Update(update_red_flags_sql, updateData);
        }

        let update_red_flags_sql = UpdateStatement(
            Masters.red_flags.tablename,
            [Masters.red_flags.selectOptionsColumn.status],
            [Masters.red_flags.selectOptionsColumn.id]
        );
        let updateData = [[status, id]];
        await Update(update_red_flags_sql, updateData);
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
