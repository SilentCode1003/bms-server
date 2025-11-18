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
                async function ProcessData() {
                        let select_liquidation_item_sql = SelectStatement(
                                `SELECT 
                                 MIN(li_id) AS id,
                                 MIN(li_liquidation_id) AS liquidation_id,
                                 MIN(li_date) AS date,
                                 MIN(li_rt) AS rt,
                                 MIN(li_store_name) AS store_name,
                                 MIN(li_particulars) AS particulars,
                                 li_from AS started_from,
                                 li_to AS ended_to,
                                 li_mode_of_transportation AS mode_of_transportation,
                                 li_amount AS amount
                                 FROM liquidation_item
                                 LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
                                 WHERE
                                 l.l_status != 'rejected'
                                 AND COALESCE(li_from, '') NOT IN ('N/A', 'NA', 'na', 'n/a')
                                 AND COALESCE(li_to, '') NOT IN ('N/A', 'NA', 'na', 'n/a')
                                 AND COALESCE(li_mode_of_transportation, '') NOT IN ('N/A', 'NA', 'na', 'n/a')
                                 GROUP BY 
                                 li_from, 
                                 li_to, 
                                 li_mode_of_transportation
                                 ORDER BY 
                                 started_from, 
                                 ended_to, 
                                 mode_of_transportation;
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
                                `WITH counted AS (
                                SELECT
                                        li.li_from,
                                        li.li_to,
                                        li.li_mode_of_transportation,
                                        li.li_amount,
                                        COUNT(*) AS cnt
                                FROM liquidation_item li
                                LEFT JOIN liquidation l ON li.li_liquidation_id = l.l_id
                                WHERE l.l_status != 'rejected'
                                GROUP BY li.li_from, li.li_to, li.li_mode_of_transportation, li.li_amount
                                ),
                                ranked AS (
                                SELECT
                                        li_from,
                                        li_to,
                                        li_mode_of_transportation,
                                        li_amount,
                                        cnt,
                                        DENSE_RANK() OVER (PARTITION BY li_from, li_to, li_mode_of_transportation ORDER BY cnt DESC) AS rnk
                                FROM counted
                                )
                                SELECT
                                li_from AS started_from,
                                li_to AS ended_to,
                                li_mode_of_transportation AS mode_of_transportation,
                                MIN(CASE WHEN rnk = 1 THEN li_amount END) AS min_amount,  -- min of most frequent
                                MAX(CASE WHEN rnk IN (1,2) THEN li_amount END) AS max_amount -- max of top 2 frequencies
                                FROM ranked
                                GROUP BY li_from, li_to, li_mode_of_transportation
                                ORDER BY started_from, ended_to, mode_of_transportation;

                        `
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

router.get('/getstore_routes', async (req, res) => {
        try {
                const { store_name } = req.query;
                async function ProcessData() {
                        let select_store_routes_sql = SelectStatement(
                        `WITH RECURSIVE route_chain AS (
                        SELECT 
                                li_store_name,
                                li_from,
                                li_to,
                                li_mode_of_transportation,
                                li_amount,
                                CONCAT(li_from, '->', li_to) AS route_path,
                                1 AS step_order,
                                li_to AS last_location
                        FROM liquidation_item li
                        WHERE li_store_name = '${store_name}'
                        AND li_from NOT IN (
                                SELECT li_to 
                                FROM liquidation_item 
                                WHERE li_store_name = '${store_name}'
                        )

                        UNION ALL

                        SELECT 
                                li.li_store_name,
                                li.li_from,
                                li.li_to,
                                li.li_mode_of_transportation,
                                li.li_amount,
                                CONCAT(rc.route_path, '->', li.li_to),
                                rc.step_order + 1,
                                li.li_to
                        FROM route_chain rc
                        INNER JOIN liquidation_item li
                                ON rc.last_location = li.li_from
                        AND rc.li_store_name = li.li_store_name

                        WHERE FIND_IN_SET(li.li_to, REPLACE(rc.route_path, '->', ',')) = 0
                        ),
                        complete_routes AS (
                        SELECT DISTINCT
                                li_store_name,
                                route_path
                        FROM route_chain
                        WHERE li_to = '${store_name}'
                        ),

                        route_usage AS (
                        SELECT 
                                cr.route_path,
                                COUNT(*) AS usage_count
                        FROM complete_routes cr
                        JOIN liquidation_item li
                                ON cr.route_path LIKE CONCAT('%', li.li_from, '->', li.li_to, '%')
                        WHERE li.li_store_name = '${store_name}'
                        GROUP BY cr.route_path
                        ),

                        route_steps AS (
                        SELECT DISTINCT
                                rc.li_store_name,
                                cr.route_path,
                                rc.li_from,
                                rc.li_to,
                                rc.li_mode_of_transportation,
                                rc.li_amount,
                                rc.step_order,
                                ru.usage_count
                        FROM complete_routes cr
                        JOIN route_chain rc
                                ON cr.route_path LIKE CONCAT('%', rc.li_from, '->', rc.li_to, '%')
                        JOIN route_usage ru
                                ON ru.route_path = cr.route_path
                        ),

                        amount_counts AS (
                        SELECT
                                li_store_name,
                                li_from,
                                li_to,
                                li_amount,
                                COUNT(*) AS amount_count
                        FROM liquidation_item
                        WHERE li_store_name = '${store_name}'
                        GROUP BY li_store_name, li_from, li_to, li_amount
                        )

                        SELECT 
                        rs.li_store_name AS store,
                        rs.li_from AS location_from,
                        rs.li_to AS location_to,
                        rs.li_mode_of_transportation AS mode_of_transportation,
                        rs.li_amount AS amount,
                        ac.amount_count,
                        rs.route_path,
                        rs.usage_count,
                        rs.step_order
                        FROM route_steps rs
                        LEFT JOIN amount_counts ac
                        ON ac.li_store_name = rs.li_store_name
                        AND ac.li_from = rs.li_from
                        AND ac.li_to = rs.li_to
                        AND ac.li_amount = rs.li_amount
                        ORDER BY rs.usage_count DESC, rs.route_path, rs.step_order;

                `
                        );

                        let result = await Select(select_store_routes_sql);
                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error fetching store routes:", error);
                res.status(500).json(JsonResposeError(error));
        }
});