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

/* GET cash_request_activity page. */
router.get('/', function(req, res, next) {
  res.render('cash_request_activity', { title: 'Express' });
});

module.exports = router;

router.get('/getcash_request_activity', async (req, res) => {
        try {
                const {offset, limit} = req.body;
                // if(offset)
                async function ProcessData() {
                        let select_cash_request_activity_sql = SelectStatement(
                                `SELECT
                                 cra_id AS id,
                                 cra_cash_request_id AS cash_request_id,
                                 cra_action AS action,
                                 cra_remarks AS remarks,
                                 cra_created_at AS created_at,
                                 CASE
                                     WHEN cra_action = 'REQUESTED' THEN CONCAT('Requested by: ', cra_requested_by)
                                     WHEN cra_action = 'APPROVED' THEN CONCAT('Approved by: ', cra_requested_by)
                                     WHEN cra_action = 'RECEIVED' THEN CONCAT('Received by: ', cra_requested_by)
                                     WHEN cra_action = 'REJECTED' THEN CONCAT('Rejected by: ', cra_requested_by)
                                ELSE cra_requested_by
                                END AS name
                                FROM cash_request_activity;
                                `
                        );

                        let result = await Select(select_cash_request_activity_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});