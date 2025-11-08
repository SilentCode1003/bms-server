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
const { Liquidations } = require("../repository/model/liquidation");
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
/* GET notification page. */
router.get('/', function (req, res, next) {
    res.render('notification', { title: 'Express' });
});

module.exports = router;

router.get('/getnotification', async (req, res) => {
    try {
        async function ProcessData() {
            let select_pending_cash_request_sql = SelectStatement(
                `SELECT
                                cr_id as id,
                                cr_reference_id as reference,
                                cr_employee as employee,
                                cr_amount as amount,
                                cr_request_date as request_date,
                                cr_status as status
                                FROM cash_request
                                WHERE cr_status = 'pending'
                                `
            );

            let pending_cash_request_result = await Select(select_pending_cash_request_sql);

            let select_approved_cash_request_sql = SelectStatement(
                `SELECT
                                cr_id as id,
                                cr_reference_id as reference,
                                cr_employee as employee,
                                cr_amount as amount,
                                cr_request_date as request_date,
                                cr_status as status
                                FROM cash_request
                                WHERE cr_status = 'approved'
                                `
            );

            let approved_cash_request_result = await Select(select_approved_cash_request_sql);

            let select_completed_cash_request_sql = SelectStatement(
                `SELECT
                                cr_id as id,
                                cr_reference_id as reference,
                                cr_employee as employee,
                                cr_amount as amount,
                                cr_request_date as request_date,
                                cr_status as status
                                FROM cash_request
                                WHERE cr_status = 'completed'
                                `
            );

            let completed_cash_request_result = await Select(select_completed_cash_request_sql);

            let select_rejected_cash_request_sql = SelectStatement(
                `SELECT
                                cr_id as id,
                                cr_reference_id as reference,
                                cr_employee as employee,
                                cr_amount as amount,
                                cr_request_date as request_date,
                                cr_status as status
                                FROM cash_request
                                WHERE cr_status = 'rejected'
                                `
            );

            let rejected_cash_request_result = await Select(select_rejected_cash_request_sql);

            let select_pending_liquidation_sql = SelectStatement(
                `SELECT
                                l_id as id,
                                l_cr_reference_id as reference,
                                cr_employee as employee,
                                l_created_date as created_date,
                                l_status as status
                                FROM liquidation
                                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                                WHERE l_status = 'pending'
                                `
            );

            let pending_liquidation_result = await Select(select_pending_liquidation_sql);

            let select_approved_liquidation_sql = SelectStatement(
                `SELECT
                                l_id as id,
                                l_cr_reference_id as reference,
                                cr_employee as employee,
                                l_created_date as created_date,
                                l_status as status
                                FROM liquidation
                                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                                WHERE l_status = 'approved'
                                `
            );

            let approved_liquidation_result = await Select(select_approved_liquidation_sql);

            let select_verified_liquidation_sql = SelectStatement(
                `SELECT
                                l_id as id,
                                l_cr_reference_id as reference,
                                cr_employee as employee,
                                l_created_date as created_date,
                                l_status as status
                                FROM liquidation
                                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                                WHERE l_status = 'verified'
                                `
            );

            let verified_liquidation_result = await Select(select_verified_liquidation_sql);

            let select_completed_liquidation_sql = SelectStatement(
                `SELECT
                                l_id as id,
                                l_cr_reference_id as reference,
                                cr_employee as employee,
                                l_created_date as created_date,
                                l_status as status
                                FROM liquidation
                                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                                WHERE l_status = 'completed'
                                `
            );

            let completed_liquidation_result = await Select(select_completed_liquidation_sql);

            let select_incomplete_liquidation_sql = SelectStatement(
                `SELECT
                                l_id as id,
                                l_cr_reference_id as reference,
                                cr_employee as employee,
                                l_created_date as created_date,
                                l_status as status
                                FROM liquidation
                                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                                WHERE l_status = 'incomplete'
                                `
            );

            let incomplete_liquidation_result = await Select(select_incomplete_liquidation_sql);

            let select_rejected_liquidation_sql = SelectStatement(
                `SELECT
                                l_id as id,
                                l_cr_reference_id as reference,
                                cr_employee as employee,
                                l_created_date as created_date,
                                l_status as status
                                FROM liquidation
                                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                                WHERE l_status = 'rejected'
                                `
            );

            let rejected_liquidation_result = await Select(select_rejected_liquidation_sql);

            emitNotificationUpdate(req, 'fetched', {
                event: 'notification_fetched',
                status: 'success',
                count: result.length,
                timestamp: new Date().toISOString()
            });

            const io = req.app.get('io');
            if (io) {
                io.emit('notification:fetched', {
                    status: 'success',
                    count: result.length,
                    timestamp: new Date().toISOString()
                });
            }
            return res.status(200).json({ pending_cash_request_result, approved_cash_request_result, completed_cash_request_result, rejected_cash_request_result, pending_liquidation_result, approved_liquidation_result, verified_liquidation_result, completed_liquidation_result, incomplete_liquidation_result, rejected_liquidation_result });
        }

        await ProcessData();
    } catch (error) {
        console.error("Error during login:", error);
        emitNotificationUpdate(req, 'error', {
            event: 'notification_fetch_error',
            status: 'error',
            message: 'Failed to fetch notification',
            error: error.message,
            timestamp: new Date().toISOString()
        });
        res.status(500).json(JsonResposeError(error));
    }
});
