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

/* GET liquidation_item page. */
router.get('/', function(req, res, next) {
  res.render('liquidation_item', { title: 'Express' });
});

module.exports = router;

router.get('/getliquidation_item', async (req, res) => {
        try {
                console.log("getliquidation_item");
                async function ProcessData() {
                        let select_liquidation_item_sql = SelectStatement(
                                `SELECT
                                li_id as id,
                                li_liquidation_id as liquidation_id,
                                li_date as date,
                                li_rt as rt,
                                li_store_name as store_name,
                                li_particulars as particulars,
                                li_from as started_from,
                                li_to as ended_to,
                                li_mode_of_transportation as mode_of_transportation,
                                li_amount as amount
                                FROM liquidation_item
                                ORDER BY li_id DESC
                                `
                        );

                        let result = await Select(select_liquidation_item_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.get('/getliquidation_item_by_id', async (req, res) => {
        try {
                const { id } = req.query;
                async function ProcessData() {
                        let select_liquidation_item_sql = SelectStatement(
                                `SELECT
                                li_liquidation_id as liquidation_id,
                                li_from as started_from,
                                li_to as ended_to,
                                li_mode_of_transportation,
                                li_amount as amount
                                FROM liquidation_item
                                WHERE li_liquidation_id = ?
                                `, [id]
                        );

                        let result = await Select(select_liquidation_item_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});