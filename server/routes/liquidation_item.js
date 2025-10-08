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
router.get('/', function (req, res, next) {
        res.render('liquidation_item', { title: 'Express' });
});

module.exports = router;

router.get('/getliquidation_item', async (req, res) => {
        try {
                console.log("getliquidation_item");
                async function ProcessData() {
                        let select_liquidation_item_sql = SelectStatement(
                                `SELECT 
                                  MIN(li_id) as id,
                                  MIN(li_liquidation_id) as liquidation_id,
                                  MIN(li_date) as date,
                                  MIN(li_rt) as rt,
                                  MIN(li_store_name) as store_name,
                                  MIN(li_particulars) as particulars,
                                  li_from AS started_from,
                                  li_to AS ended_to,
                                  li_mode_of_transportation AS mode_of_transportation,
                                  li_amount as amount
                                  FROM liquidation_item
                                  LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
                                  WHERE l.l_status != 'rejected'
                                  GROUP BY li_from, li_to, li_mode_of_transportation
                                  ORDER BY started_from, ended_to, mode_of_transportation;
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

router.get('/getliquidation_item_stats', async (req, res) => {
        try {
                console.log("getliquidation_item_stats");
                async function ProcessData() {
                        let select_liquidation_item_stats_sql = SelectStatement(
                                `SELECT 
                li_from AS started_from,
                li_to AS ended_to,
                li_mode_of_transportation AS mode_of_transportation,
                AVG(li_amount) AS avg_amount,
                MIN(li_amount) AS min_amount,
                MAX(li_amount) AS max_amount
              FROM liquidation_item
              LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
              WHERE l.l_status != 'rejected'
              GROUP BY li_from, li_to, li_mode_of_transportation
              ORDER BY started_from, ended_to, mode_of_transportation;`
                        );

                        let result = await Select(select_liquidation_item_stats_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error fetching liquidation item stats:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.get('/getliquidation_item_started_from', async (req, res) => {
        try {
                console.log("getliquidation_item_started_from");
                async function ProcessData() {
                        let select_liquidation_item_stats_sql = SelectStatement(
                                `SELECT 
                li_from AS started_from
              FROM liquidation_item
              LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
              WHERE l.l_status != 'rejected'
              GROUP BY li_from
              ORDER BY started_from;`
                        );

                        let result = await Select(select_liquidation_item_stats_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error fetching liquidation item stats:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.get('/getliquidation_item_ended_to', async (req, res) => {
        try {
                console.log("getliquidation_item_ended_to");
                async function ProcessData() {
                        let select_liquidation_item_stats_sql = SelectStatement(
                                `SELECT 
                                li_to AS ended_to
              FROM liquidation_item
              LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
              WHERE l.l_status != 'rejected'
              GROUP BY li_to
              ORDER BY ended_to;`
                        );

                        let result = await Select(select_liquidation_item_stats_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error fetching liquidation item stats:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.get('/getliquidation_item_mode_of_transportation', async (req, res) => {
        try {
                console.log("getliquidation_item_mode_of_transportation");
                async function ProcessData() {
                        let select_liquidation_item_stats_sql = SelectStatement(
                                `SELECT 
                                li_mode_of_transportation AS mode_of_transportation
              FROM liquidation_item
              LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
              WHERE l.l_status != 'rejected'
              GROUP BY li_mode_of_transportation
              ORDER BY mode_of_transportation;`
                        );

                        let result = await Select(select_liquidation_item_stats_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error fetching liquidation item stats:", error);
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
                                li_date as date,
                                li_rt as rt,
                                li_store_name as store_name,
                                li_particulars as particulars,
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