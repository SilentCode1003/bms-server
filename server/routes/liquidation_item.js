var express = require("express");
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
const {
  Select,
  Insert,
  Update,
  connection,
} = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const {
  EncrypterString,
  DecrypterString,
} = require("../repository/helper/crytography");
const jwt = require("jsonwebtoken");
var router = express.Router();

/* GET liquidation_item page. */
router.get("/", function (req, res, next) {
  res.render("liquidation_item", { title: "Express" });
});

module.exports = router;

router.get("/getliquidation_item", async (req, res) => {
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
                                 MIN(li_reason) AS reason,
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
                                `,
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

router.get("/getliquidation_item_stats", async (req, res) => {
  try {
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

                        `,
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

router.get("/getliquidation_item_started_from", async (req, res) => {
  try {
    async function ProcessData() {
      let select_liquidation_item_stats_sql = SelectStatement(
        `SELECT 
                li_from AS started_from
              FROM liquidation_item
              LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
              WHERE l.l_status != 'rejected'
              GROUP BY li_from
              ORDER BY started_from;`,
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

router.get("/getliquidation_item_ended_to", async (req, res) => {
  try {
    async function ProcessData() {
      let select_liquidation_item_stats_sql = SelectStatement(
        `SELECT 
                                li_to AS ended_to
              FROM liquidation_item
              LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
              WHERE l.l_status != 'rejected'
              GROUP BY li_to
              ORDER BY ended_to;`,
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

router.get("/getliquidation_item_mode_of_transportation", async (req, res) => {
  try {
    async function ProcessData() {
      let select_liquidation_item_stats_sql = SelectStatement(
        `SELECT 
                        li_mode_of_transportation AS mode_of_transportation
                        FROM liquidation_item
                        LEFT JOIN liquidation l ON li_liquidation_id = l.l_id
                        WHERE l.l_status != 'rejected'
                        GROUP BY li_mode_of_transportation
                        ORDER BY mode_of_transportation;`,
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

router.get("/getliquidation_item_by_id", async (req, res) => {
  try {
    const { id } = req.query;

    async function ProcessData() {
      let select_liquidation_item_sql = SelectStatement(
        `SELECT
                                li_id AS id,
                                li_liquidation_id AS liquidation_id,
                                li_date AS date,
                                li_rt AS rt,
                                REPLACE(REPLACE(REPLACE(li_store_name, "'", ""), "<", ""), ">", "") AS store_name,
                                REPLACE(REPLACE(REPLACE(li_particulars, "'", ""), "<", ""), ">", "") AS particulars,
                                REPLACE(REPLACE(REPLACE(li_reason, "'", ""), "<", ""), ">", "") AS reason,
                                REPLACE(REPLACE(REPLACE(li_from, "'", ""), "<", ""), ">", "") AS started_from,
                                REPLACE(REPLACE(REPLACE(li_to, "'", ""), "<", ""), ">", "") AS ended_to,
                                REPLACE(REPLACE(REPLACE(li_mode_of_transportation, "'", ""), "<", ""), ">", "") AS mode_of_transportation,
                                li_amount AS amount
                                FROM liquidation_item
                                WHERE li_liquidation_id = ?`,
        [id],
      );

      let items = await Select(select_liquidation_item_sql);

      const finalResult = [];
      for (let row of items) {
        let count = 0;
        let master_sql = SelectStatement(
          `SELECT mmm_min_amount AS min, mmm_max_amount AS max
                                        FROM master_min_max
                                        WHERE mmm_from = ?
                                        AND mmm_to = ?
                                        AND mmm_mode_of_transportation = ?`,
          [row.started_from, row.ended_to, row.mode_of_transportation],
        );

        let master = await Select(master_sql);
        let min = master.length ? master[0].min : null;
        let max = master.length ? master[0].max : null;
        let is_red_flag = false;
        let status = "";
        // if (min !== null && max !== null) {
        //     if (row.amount < min || row.amount > max) {
        //         is_red_flag = true;
        //     }
        // }

        if (max !== null && parseFloat(row.amount) > parseFloat(max)) {
          status = "MAXIMUM";
        } else if (min !== null && row.amount < min) {
          status = "MINIMUM";
        }
        finalResult.push({
          ...row,
          status: status,
        });
      }
      return res.status(200).json(finalResult);
    }

    await ProcessData();
  } catch (error) {
    console.error("Error during fetching liquidation_item:", error);
    res.status(500).json(JsonResposeError(error));
  }
});

router.get("/getstore_routes", async (req, res) => {
  try {
    const { store_name } = req.query;
    async function ProcessData() {
      let select_store_routes_sql = SelectStatement(
        `WITH RECURSIVE route_chain AS (
                        SELECT 
                                li_store_name,
                                REPLACE(li_from, ' ', '') AS clean_from,
                                REPLACE(li_to, ' ', '') AS clean_to,
                                li_mode_of_transportation,
                                REPLACE(li_mode_of_transportation, ' ', '') AS clean_mode_of_transportation,
                                li_amount,
                                CONCAT(clean_from, '->', clean_to) AS route_path,
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
                                REPLACE(li.li_from, ' ', '') AS clean_from,
                                REPLACE(li.li_to, ' ', '') AS clean_to,
                                li.li_mode_of_transportation,
                                REPLACE(li.li_mode_of_transportation, ' ', '') AS clean_mode_of_transportation,
                                li.li_amount,
                                CONCAT(rc.route_path, '->', clean_to),
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
                        WHERE clean_to = '${store_name}'
                        ),

                        route_usage AS (
                        SELECT 
                                cr.route_path,
                                COUNT(*) AS usage_count
                        FROM complete_routes cr
                        JOIN liquidation_item li
                                ON cr.route_path LIKE CONCAT('%', clean_from, '->', clean_to, '%')
                        WHERE li.li_store_name = '${store_name}'
                        GROUP BY cr.route_path
                        ),

                        route_steps AS (
                        SELECT DISTINCT
                                rc.li_store_name,
                                cr.route_path,
                                rc.clean_from AS li_from,
                                rc.clean_to AS li_to,
                                rc.clean_mode_of_transportation AS li_mode_of_transportation,
                                rc.li_amount,
                                rc.step_order,
                                ru.usage_count
                        FROM complete_routes cr
                        JOIN route_chain rc
                                ON cr.route_path LIKE CONCAT('%', clean_from, '->', clean_to, '%')
                        JOIN route_usage ru
                                ON ru.route_path = cr.route_path
                        ),

                        amount_counts AS (
                        SELECT
                                li_store_name,
                                clean_from AS li_from,
                                clean_to AS li_to,
                                li_amount,
                                COUNT(*) AS amount_count
                        FROM liquidation_item
                        WHERE li_store_name = '${store_name}'
                        GROUP BY li_store_name, clean_from, clean_to, li_amount
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

                `,
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

router.get("/getstore_routes_from", async (req, res) => {
  try {
    const { store_name, start_location } = req.query;

    if (!store_name || !start_location) {
      return res
        .status(400)
        .json({ error: "store_name and start_location are required" });
    }

    async function ProcessData() {
      const sql = `
        SELECT DISTINCT 
          TRIM(li_from) AS li_from,
          TRIM(li_to) AS li_to,
          TRIM(li_mode_of_transportation) AS li_mode_of_transportation
        FROM liquidation_item
        WHERE li_store_name = '${store_name}'
      `;

      const [rows] = await connection.promise().query(sql);

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          error: `No routes found for store '${store_name}'`,
        });
      }

      // Build adjacency map: from -> [{ to, mode }]
      const graph = {};
      for (const row of rows) {
        if (!graph[row.li_from]) graph[row.li_from] = [];
        const exists = graph[row.li_from].some(
          (e) => e.to === row.li_to && e.mode === row.li_mode_of_transportation,
        );
        if (!exists) {
          graph[row.li_from].push({
            to: row.li_to,
            mode: row.li_mode_of_transportation,
          });
        }
      }

      // BFS — find ALL complete paths from start_location to store_name
      const completePaths = [];
      const queue = [[{ from: null, to: start_location, mode: null }]];

      while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1].to;

        // Safety cap
        if (path.length > 20) continue;

        // Reached destination — save this complete path
        if (current === store_name) {
          completePaths.push(path.slice(1)); // remove dummy start node
          continue;
        }

        const neighbors = graph[current] || [];
        const visited = new Set(path.map((p) => p.to));

        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.to)) {
            queue.push([
              ...path,
              { from: current, to: neighbor.to, mode: neighbor.mode },
            ]);
          }
        }
      }

      if (completePaths.length === 0) {
        return res.status(404).json({
          error: `No route found from '${start_location}' to '${store_name}'`,
        });
      }

      // Collect only edges that appear in at least one complete path
      // Use a Set to deduplicate
      const validEdges = new Map(); // key = "from|to|mode", value = { li_from, li_to, li_mode_of_transportation, step }

      for (const path of completePaths) {
        path.forEach((leg, index) => {
          const key = `${leg.from}|${leg.to}|${leg.mode}`;
          if (!validEdges.has(key)) {
            validEdges.set(key, {
              li_from: leg.from,
              li_to: leg.to,
              li_mode_of_transportation: leg.mode,
              step: index + 1,
            });
          }
        });
      }

      // Sort by step then from then to
      const result = Array.from(validEdges.values()).sort((a, b) => {
        if (a.step !== b.step) return a.step - b.step;
        if (a.li_from < b.li_from) return -1;
        if (a.li_from > b.li_from) return 1;
        return a.li_to.localeCompare(b.li_to);
      });

      return res.status(200).json(result);
    }

    await ProcessData();
  } catch (error) {
    console.error("Error fetching store routes from location:", error);
    res.status(500).json(JsonResposeError(error));
  }
});

router.put("/update_liquidation_item", async (req, res) => {
  try {
    const { id, particulars } = req.body;

    if (!id || particulars === undefined) {
      return res.status(400).json(JsonResposeError("Missing required fields"));
    }

    let updateData = [particulars, id];
    let update_liquidation_sql = UpdateStatement(
      Liquidations.liquidation_item.tablename,
      [Liquidations.liquidation_item.selectOptionsColumn.particulars],
      [Liquidations.liquidation_item.selectOptionsColumn.id],
    );
    await Update(update_liquidation_sql, [updateData]);

    res.status(200).json(JsonResponseSuccess());
  } catch (error) {
    console.error("Error in update_liquidation_notification:", error);
    res.status(500).json(JsonResposeError(error));
  }
});
