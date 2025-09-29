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
                async function ProcessData() {
                        let select_cash_request_activity_sql = SelectStatement(
                                `SELECT
                                cra_id as id,
                                cra_cash_request_id as cash_request_id,
                                cra_action as action,
                                cra_remarks as remarks,
                                cra_created_at as created_at,
                                cra_requested_by as requested_by
                                FROM cash_request_activity
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