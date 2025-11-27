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
    const { user } = req.query;
    console.log("USER STATUS",user);
    try {
        let pending_cash_request_result = [];
        let approved_cash_request_result = [];
        let completed_cash_request_result = [];
        let rejected_cash_request_result = [];
        let pending_liquidation_result = [];
        let approved_liquidation_result = [];
        let verified_liquidation_result = [];
        let completed_liquidation_result = [];
        let incomplete_liquidation_result = [];
        let rejected_liquidation_result = [];

        if (user === "Requester" || user === "Team Leader" || user === "Administator") {
            let select_pending_cash_request_sql = SelectStatement(
                `SELECT
                cr_id as id,
                cr_reference_id as reference,
                cr_employee as employee,
                cr_amount as amount,
                cra_created_at as date,
                cr_status as status
                FROM cash_request
                LEFT JOIN cash_request_activity ON cr_id = cra_cash_request_id
                WHERE cr_status = 'pending' AND cra_action = 'REQUESTED'
                AND cr_notification = 1
                `
            );

            pending_cash_request_result = await Select(select_pending_cash_request_sql);
        }

        if (user === "Requester" || user === "Custodian" || user === "Administrator") {
            let select_approved_cash_request_sql = SelectStatement(
                `SELECT
                cr_id as id,
                cr_reference_id as reference,
                cr_employee as employee,
                cr_amount as amount,
                cra_created_at as date,
                cr_status as status
                FROM cash_request
                LEFT JOIN cash_request_activity ON cr_id = cra_cash_request_id
                WHERE cr_status = 'approved' AND cra_action = 'APPROVED'
                AND cr_notification = 1
                `
            );

            approved_cash_request_result = await Select(select_approved_cash_request_sql);
        }

        if (user === "Requester" || user === "Administrator") {
            let select_completed_cash_request_sql = SelectStatement(
                `SELECT
                cr_id as id,
                cr_reference_id as reference,
                cr_employee as employee,
                cr_amount as amount,
                cr_request_date as date,
                cr_status as status
                FROM cash_request
                LEFT JOIN cash_request_activity ON cr_id = cra_cash_request_id
                WHERE cr_status = 'completed' AND cra_action = 'RECEIVED'
                AND cr_notification = 1
                `
            );

            completed_cash_request_result = await Select(select_completed_cash_request_sql);
        }

        if (user === "Requester" || user === "Administrator") {
            let select_rejected_cash_request_sql = SelectStatement(
                `SELECT
                cr_id as id,
                cr_reference_id as reference,
                cr_employee as employee,
                cr_amount as amount,
                cr_request_date as date,
                cr_status as status
                FROM cash_request
                LEFT JOIN cash_request_activity ON cr_id = cra_cash_request_id
                WHERE cr_status = 'rejected' AND cra_action = 'REJECTED'
                AND cr_notification = 1
                `
            );

            rejected_cash_request_result = await Select(select_rejected_cash_request_sql);
        }

        if (user === "Requester" || user === "Team Leader" || user === "Administrator") {
            let select_pending_liquidation_sql = SelectStatement(
                `SELECT
                l_id as id,
                l_cr_reference_id as reference,
                cr_employee as employee,
                lia_created_at as date,
                l_status as status
                FROM liquidation
                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                LEFT JOIN liquidation_activity ON l_id = lia_liquidation_id
                WHERE l_status = 'pending' AND lia_action = 'PREPARED'
                AND l_notification = 1
                `
            );

            pending_liquidation_result = await Select(select_pending_liquidation_sql);
        }

        if (user === "Requester" || user === "Custodian" || user === "Administrator") {
            let select_approved_liquidation_sql = SelectStatement(
                `SELECT
                l_id as id,
                l_cr_reference_id as reference,
                cr_employee as employee,
                lia_created_at as date,
                l_status as status
                FROM liquidation
                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                LEFT JOIN liquidation_activity ON l_id = lia_liquidation_id
                WHERE l_status = 'approved' AND lia_action = 'NOTED'
                AND l_notification = 1
                `
            );

            approved_liquidation_result = await Select(select_approved_liquidation_sql);
        }

        if (user === "Requester" || user === "Finance" || user === "Administrator") {
            let select_verified_liquidation_sql = SelectStatement(
                `SELECT
                l_id as id,
                l_cr_reference_id as reference,
                cr_employee as employee,
                lia_created_at as date,
                l_status as status
                FROM liquidation
                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                LEFT JOIN liquidation_activity ON l_id = lia_liquidation_id
                WHERE l_status = 'verified' AND lia_action = 'CHECKED'
                AND l_notification = 1
                `
            );

            verified_liquidation_result = await Select(select_verified_liquidation_sql);
        }

        if (user === "Requester" || user === "Administrator") {
            let select_completed_liquidation_sql = SelectStatement(
                `SELECT
                l_id as id,
                l_cr_reference_id as reference,
                cr_employee as employee,
                lia_created_at as date,
                l_status as status
                FROM liquidation
                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                LEFT JOIN liquidation_activity ON l_id = lia_liquidation_id
                WHERE l_status = 'completed' AND lia_action = 'APPROVED'
                AND l_notification = 1
                `
            );

            completed_liquidation_result = await Select(select_completed_liquidation_sql);
        }

        if (user === "Requester" || user === "Administrator") {
            let select_incomplete_liquidation_sql = SelectStatement(
                `SELECT
                l_id as id,
                l_cr_reference_id as reference,
                cr_employee as employee,
                lia_created_at as date,
                l_status as status
                FROM liquidation
                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                LEFT JOIN liquidation_activity ON l_id = lia_liquidation_id
                WHERE l_status = 'incomplete' AND lia_action = 'INCOMPLETE'
                AND l_notification = 1
                `
            );

            incomplete_liquidation_result = await Select(select_incomplete_liquidation_sql);
        }

        if (user === "Requester" || user === "Administrator") {
            let select_rejected_liquidation_sql = SelectStatement(
                `SELECT
                l_id as id,
                l_cr_reference_id as reference,
                cr_employee as employee,
                lia_created_at as date,
                l_status as status
                FROM liquidation
                LEFT JOIN cash_request ON l_cr_reference_id = cr_reference_id
                LEFT JOIN liquidation_activity ON l_id = lia_liquidation_id
                WHERE l_status = 'rejected' AND lia_action = 'REJECTED'
                AND l_notification = 1
                `
            );

            rejected_liquidation_result = await Select(select_rejected_liquidation_sql);
        }

        let count = 0;
        count += pending_cash_request_result.length;
        count += approved_cash_request_result.length;
        count += completed_cash_request_result.length;
        count += rejected_cash_request_result.length;
        count += pending_liquidation_result.length;
        count += approved_liquidation_result.length;
        count += verified_liquidation_result.length;
        count += completed_liquidation_result.length;
        count += incomplete_liquidation_result.length;
        count += rejected_liquidation_result.length;

        emitNotificationUpdate(req, 'fetched', {
            event: 'notification_fetched',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('notification:fetched', {
                status: 'success',
                count: count,
                timestamp: new Date().toISOString()
            });
        }
        return res.status(200).json({ pending_cash_request_result, approved_cash_request_result, completed_cash_request_result, rejected_cash_request_result, pending_liquidation_result, approved_liquidation_result, verified_liquidation_result, completed_liquidation_result, incomplete_liquidation_result, rejected_liquidation_result });
    } catch (error) {
        console.error("Error during login:", error);
        emitNotificationUpdate(req, 'error', {
            event: 'notification_fetch_error',
            status: 'error',
            message: 'Failed to fetch notification',
            error: error.message,
        });
        res.status(500).json(JsonResposeError(error));
    }
});
