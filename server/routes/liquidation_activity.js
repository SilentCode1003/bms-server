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

/* GET liquidation_activity page. */
router.get('/', function(req, res, next) {
  res.render('liquidation_activity', { title: 'Express' });
});

module.exports = router;

router.get('/getliquidation_activity', async (req, res) => {
        try {
                async function ProcessData() {
                        let select_liquidation_activity_sql = SelectStatement(
                                `SELECT
                                cra_id as id,
                                cra_liquidation_id as liquidation_id,
                                cra_action as action,
                                cra_remarks as remarks,
                                cra_signature as signature,
                                cra_created_at as created_at,
                                cra_requested_by as requested_by
                                FROM liquidation_activity
                                `
                        );

                        let result = await Select(select_liquidation_activity_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});