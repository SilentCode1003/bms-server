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
    GetCurrentDate,
} = require("../repository/helper/customhelper");
const { Liquidations } = require("../repository/model/liquidation");
const { CashRequests } = require("../repository/model/cash_request");
const { Select, Insert, Update } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const { EncrypterString, DecrypterString } = require("../repository/helper/crytography");
const jwt = require('jsonwebtoken');
var router = express.Router();

/* GET dashboard page. */
router.get('/', function (req, res, next) {
    res.render('dashboard', { title: 'Express' });
});

module.exports = router;

router.get('/get_finance_cards', async (req, res) => {
    let { startDate, endDate } = req.query;
    try {
        async function ProcessData() {
        if (!startDate && !endDate) {
            startDate = GetCurrentDate();
            endDate = GetCurrentDate();
        }
        const parseToSqlDate = (dt, endOfDay = false) => {
        if (!dt) return null;
        let parts = dt.split("-");
        let yyyy, mm, dd;
        if (parts[0].length === 4) {
          yyyy = parts[0];
          mm = parts[1];
          dd = parts[2];
        } else if (parts[2] && parts[2].length === 4) {
          yyyy = parts[2];
          mm = parts[0];
          dd = parts[1];
        } else {
          return null;
        }
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")} ${endOfDay ? "23:59:59" : "00:00:00"}`;
      };

      let start = startDate ? parseToSqlDate(startDate, false) : null;
      let end = endDate ? parseToSqlDate(endDate, true) : null;

      if (!start && !end) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        start = `${yyyy}-${mm}-${dd} 00:00:00`;
        end = `${yyyy}-${mm}-${dd} 23:59:59`;
      }

      let whereClauses_cr = [];
      if (start) whereClauses_cr.push(`cr_request_date >= '${start}'`);
      if (end) whereClauses_cr.push(`cr_request_date <= '${end}'`);
      let whereSql_cr = whereClauses_cr.length
        ? `AND ${whereClauses_cr.join(" AND ")}`
        : "";
     
      let whereClauses_liq = [];
      if (start) whereClauses_liq.push(`l_created_date >= '${start}'`);
      if (end) whereClauses_liq.push(`l_created_date <= '${end}'`);
      let whereSql_liq = whereClauses_liq.length
        ? `AND ${whereClauses_liq.join(" AND ")}`
        : "";

            let select_finance_cards_sql = SelectStatement(
                `SELECT
                                (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'pending' ${whereSql_cr}) as pending_requests,
                                (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'completed' ${whereSql_cr}) as released_vouchers_count,
                                (SELECT COUNT(*) FROM liquidation WHERE l_status = 'verified' ${whereSql_liq}) as verified_liquidations_count,
                                (SELECT SUM(cr_amount) FROM cash_request WHERE cr_status = 'completed' ${whereSql_cr}) as released_vouchers_total,
                                (SELECT SUM(l_amount_expended +  l_reimburse_return) FROM liquidation WHERE l_status = 'verified' ${whereSql_liq}) as verified_liquidations_total,
                                (SELECT SUM(cr_amount) FROM cash_request WHERE cr_status = 'completed' ${whereSql_cr}) - (SELECT SUM(l_amount_expended +  l_reimburse_return) FROM liquidation WHERE l_status = 'verified' ${whereSql_liq}) as outstanding_balance
                                `
            );

            let result = await Select(select_finance_cards_sql);

            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.get('/get_finance_charts', async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        async function ProcessData() {
        if (!startDate && !endDate) {
            startDate = GetCurrentDate();
            endDate = GetCurrentDate();
        }
        const parseToSqlDate = (dt, endOfDay = false) => {
        if (!dt) return null;
        let parts = dt.split("-");
        let yyyy, mm, dd;
        if (parts[0].length === 4) {
          yyyy = parts[0];
          mm = parts[1];
          dd = parts[2];
        } else if (parts[2] && parts[2].length === 4) {
          yyyy = parts[2];
          mm = parts[0];
          dd = parts[1];
        } else {
          return null;
        }
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")} ${endOfDay ? "23:59:59" : "00:00:00"}`;
      };

      let start = startDate ? parseToSqlDate(startDate, false) : null;
      let end = endDate ? parseToSqlDate(endDate, true) : null;

      if (!start && !end) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        start = `${yyyy}-${mm}-${dd} 00:00:00`;
        end = `${yyyy}-${mm}-${dd} 23:59:59`;
      }

      let whereClauses_cr = [];
      if (start) whereClauses_cr.push(`cr_request_date >= '${start}'`);
      if (end) whereClauses_cr.push(`cr_request_date <= '${end}'`);
      let whereSql_cr = whereClauses_cr.length
        ? `AND ${whereClauses_cr.join(" AND ")}`
        : "";
     
      let whereClauses_liq = [];
      if (start) whereClauses_liq.push(`l_created_date >= '${start}'`);
      if (end) whereClauses_liq.push(`l_created_date <= '${end}'`);
      let whereSql_liq = whereClauses_liq.length
        ? `AND ${whereClauses_liq.join(" AND ")}`
        : "";

            let select_outstanding_balance_sql = SelectStatement(
                `SELECT
                   d.date,
                   COALESCE(cr.total_requested, 0) - COALESCE(liq.total_verified, 0) AS outstanding_balance,
                   (SELECT SUM(cr_amount) FROM cash_request WHERE cr_status = 'completed' AND DATE(cr_request_date) = d.date ${whereSql_cr}) as released_amount
                 FROM (
                   SELECT DATE(cr_request_date) AS date
                   FROM cash_request
                   WHERE cr_status = 'completed' ${whereSql_cr}
                   UNION
                   SELECT DATE(l_created_date) AS date
                   FROM liquidation
                   WHERE l_status = 'verified' ${whereSql_liq}
                 ) d
                 LEFT JOIN (
                   SELECT DATE(cr_request_date) AS date, SUM(cr_amount) AS total_requested
                   FROM cash_request
                   WHERE cr_status = 'completed' ${whereSql_cr}
                   GROUP BY DATE(cr_request_date)
                 ) cr ON d.date = cr.date
                 LEFT JOIN (
                   SELECT DATE(l_created_date) AS date, SUM(l_amount_obtained) AS total_verified
                   FROM liquidation
                   WHERE l_status = 'verified' ${whereSql_liq}
                   GROUP BY DATE(l_created_date)
                 ) liq ON d.date = liq.date
                 ORDER BY d.date;
                            `
            );

            let outstanding_balance = await Select(select_outstanding_balance_sql);

            let select_cash_flow_sql = SelectStatement(
                `
                SELECT
                d.date,
                COALESCE(cr.total_cash_request, 0) AS total_cash_request,
                COALESCE(liq.total_liquidation, 0) AS total_liquidation
                FROM (
                -- collect all unique dates from both tables
                SELECT DATE(cr_request_date) AS date
                FROM cash_request
                WHERE cr_status = 'completed' ${whereSql_cr}
                UNION
                SELECT DATE(l_created_date) AS date
                FROM liquidation
                WHERE l_status = 'verified' ${whereSql_liq}
                ) d
                LEFT JOIN (
                SELECT DATE(cr_request_date) AS date, SUM(cr_amount) AS total_cash_request
                FROM cash_request
                WHERE cr_status = 'completed' ${whereSql_cr}
                GROUP BY DATE(cr_request_date)
                ) cr ON d.date = cr.date
                LEFT JOIN (
                SELECT DATE(l_created_date) AS date, SUM(l_amount_expended + l_reimburse_return) AS total_liquidation
                FROM liquidation
                WHERE l_status = 'verified' OR l_status = 'completed' ${whereSql_liq}
                GROUP BY DATE(l_created_date)
                ) liq ON d.date = liq.date
                ORDER BY d.date;
                `
            );

            let cash_flow = await Select(select_cash_flow_sql);

            let select_request_status_sql = SelectStatement(
                `SELECT
                (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'pending' ${whereSql_cr}) as pending_requests,
                (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'approved' OR cr_status = 'completed' ${whereSql_cr}) as approved_requests,
                (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'completed' ${whereSql_cr}) as completed_requests,
                (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'rejected' ${whereSql_cr}) as rejected_requests,
                (SELECT COUNT(*) FROM liquidation WHERE l_status = 'pending' ${whereSql_liq}) as pending_liquidations,
                (SELECT COUNT(*) FROM liquidation WHERE l_status = 'approved' OR l_status = 'verified' ${whereSql_liq}) as approved_liquidations,
                (SELECT COUNT(*) FROM liquidation WHERE l_status = 'verified' ${whereSql_liq}) as verified_liquidations,
                (SELECT COUNT(*) FROM liquidation WHERE l_status = 'completed' ${whereSql_liq}) as completed_liquidations,
                (SELECT COUNT(*) FROM liquidation WHERE l_status = 'rejected' ${whereSql_liq}) as rejected_liquidations
                `
            );

            let request_status = await Select(select_request_status_sql);

            return res.status(200).json({ outstanding_balance, cash_flow, request_status });
        }

        await ProcessData();
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.get('/get_requester_cards', async (req, res) => {
    try {
        let { employee_id, startDate, endDate } = req.query;

        async function ProcessData() {
        if (!startDate && !endDate) {
            startDate = GetCurrentDate();
            endDate = GetCurrentDate();
        }

        const parseToSqlDate = (dt, endOfDay = false) => {
        if (!dt) return null;
        let parts = dt.split("-");
        let yyyy, mm, dd;
        if (parts[0].length === 4) {
          yyyy = parts[0];
          mm = parts[1];
          dd = parts[2];
        } else if (parts[2] && parts[2].length === 4) {
          yyyy = parts[2];
          mm = parts[0];
          dd = parts[1];
        } else {
          return null;
        }
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")} ${endOfDay ? "23:59:59" : "00:00:00"}`;
      };

      let start = startDate ? parseToSqlDate(startDate, false) : null;
      let end = endDate ? parseToSqlDate(endDate, true) : null;

      if (!start && !end) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        start = `${yyyy}-${mm}-${dd} 00:00:00`;
        end = `${yyyy}-${mm}-${dd} 23:59:59`;
      }

      let whereClauses_cr = [];
      if (start) whereClauses_cr.push(`cr_request_date >= '${start}'`);
      if (end) whereClauses_cr.push(`cr_request_date <= '${end}'`);
      let whereSql_cr = whereClauses_cr.length
        ? ` AND ${whereClauses_cr.join(" AND ")}`
        : "";
     
      let whereClauses_liq = [];
      if (start) whereClauses_liq.push(`l_created_date >= '${start}'`);
      if (end) whereClauses_liq.push(`l_created_date <= '${end}'`);
      let whereSql_liq = whereClauses_liq.length
        ? ` AND ${whereClauses_liq.join(" AND ")}`
        : "";

            if (employee_id) {
                let select_requester_cards_sql = SelectStatement(
                    `SELECT
                        (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'pending' ${whereSql_cr} ${employee_id ? "AND cr_employee_id = ?" : ""}) as pending_requests,
                        (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'completed' ${whereSql_cr} ${employee_id ? "AND cr_employee_id = ?" : ""}) as approved_requests,
                        (SELECT COUNT(*) 
                           FROM liquidation l 
                           INNER JOIN cash_request cr ON cr.cr_reference_id = l.l_cr_reference_id 
                           WHERE l.l_status = 'pending' ${whereSql_liq} ${employee_id ? "AND cr.cr_employee_id = ?" : ""}) as pending_liquidations,
                        (SELECT COUNT(*) 
                           FROM liquidation l 
                           INNER JOIN cash_request cr ON cr.cr_reference_id = l.l_cr_reference_id 
                           WHERE l.l_status = 'approved' ${whereSql_liq} ${employee_id ? "AND cr.cr_employee_id = ?" : ""}) as approved_liquidations,
                        (SELECT mw_current_amount FROM master_wallet ${employee_id ? "WHERE mw_employee_id = ?" : ""}) as wallet_balance
                    `,
                    employee_id ? [employee_id, employee_id, employee_id, employee_id, employee_id] : []
                );

                let result = await Select(select_requester_cards_sql);
                return res.status(200).json(result);
            } else {
                let select_requester_cards_sql = SelectStatement(
                    `SELECT
                        (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'pending' ${whereSql_cr}) as pending_requests,
                        (SELECT COUNT(*) FROM cash_request WHERE cr_status = 'completed' ${whereSql_cr}) as approved_requests,
                        (SELECT COUNT(*) 
                           FROM liquidation l 
                           INNER JOIN cash_request cr ON cr.cr_reference_id = l.l_cr_reference_id 
                           WHERE l.l_status = 'pending' ${whereSql_liq}) as pending_liquidations,
                        (SELECT COUNT(*) 
                           FROM liquidation l 
                           INNER JOIN cash_request cr ON cr.cr_reference_id = l.l_cr_reference_id 
                           WHERE l.l_status = 'approved' ${whereSql_liq}) as approved_liquidations,
                        (SELECT SUM(mw_current_amount) FROM master_wallet) as wallet_balance
                    `
                );
                let result = await Select(select_requester_cards_sql);

                return res.status(200).json(result);
            }


            
        }

        await ProcessData();
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json(JsonResposeError(error));
    }
});

router.get('/get_teamleader_cards', async (req, res) => {
    try {
        let { employee_id, startDate, endDate } = req.query;

        async function ProcessData() {

        if (!startDate && !endDate) {
            startDate = GetCurrentDate();
            endDate = GetCurrentDate();
        }

        const parseToSqlDate = (dt, endOfDay = false) => {
        if (!dt) return null;
        let parts = dt.split("-");
        let yyyy, mm, dd;
        if (parts[0].length === 4) {
          yyyy = parts[0];
          mm = parts[1];
          dd = parts[2];
        } else if (parts[2] && parts[2].length === 4) {
          yyyy = parts[2];
          mm = parts[0];
          dd = parts[1];
        } else {
          return null;
        }
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")} ${endOfDay ? "23:59:59" : "00:00:00"}`;
      };

      let start = startDate ? parseToSqlDate(startDate, false) : null;
      let end = endDate ? parseToSqlDate(endDate, true) : null;

      if (!start && !end) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        start = `${yyyy}-${mm}-${dd} 00:00:00`;
        end = `${yyyy}-${mm}-${dd} 23:59:59`;
      }

      let whereClauses_cr = [];
      if (start) whereClauses_cr.push(`cr_request_date >= '${start}'`);
      if (end) whereClauses_cr.push(`cr_request_date <= '${end}'`);
      let whereSql_cr = whereClauses_cr.length
        ? ` AND ${whereClauses_cr.join(" AND ")}`
        : "";
     
      let whereClauses_liq = [];
      if (start) whereClauses_liq.push(`l_created_date >= '${start}'`);
      if (end) whereClauses_liq.push(`l_created_date <= '${end}'`);
      let whereSql_liq = whereClauses_liq.length
        ? ` AND ${whereClauses_liq.join(" AND ")}`
        : "";

            let select_teamleader_cards_sql = SelectStatement(
                `SELECT
                    (SELECT COUNT(*) 
                       FROM cash_request 
                       WHERE cr_status = 'pending' ${whereSql_cr} ${employee_id ? "AND cr_employee_id = ?" : ""}) as pending_requests,
                    
                    (SELECT COUNT(*) 
                       FROM cash_request 
                       WHERE cr_status = 'approved' OR cr_status = 'completed' ${whereSql_cr} ${employee_id ? "AND cr_employee_id = ?" : ""}) as approved_requests,
                    
                    (SELECT COUNT(*) 
                       FROM liquidation l 
                       INNER JOIN cash_request cr ON cr.cr_reference_id = l.l_cr_reference_id
                       WHERE l.l_status = 'pending' ${whereSql_liq} ${employee_id ? "AND cr.cr_employee_id = ?" : ""}) as pending_liquidations,
                    
                    (SELECT COUNT(*) 
                       FROM liquidation l 
                       INNER JOIN cash_request cr ON cr.cr_reference_id = l.l_cr_reference_id
                       WHERE l.l_status = 'approved' OR l.l_status = 'verified' ${whereSql_liq} ${employee_id ? "AND cr.cr_employee_id = ?" : ""}) as approved_liquidations
                `,
                employee_id ? [employee_id, employee_id, employee_id, employee_id] : []
            );

            let result = await Select(select_teamleader_cards_sql);
            return res.status(200).json(result);
        }

        await ProcessData();
    } catch (error) {
        console.error("Error during get_teamleader_cards:", error);
        res.status(500).json(JsonResposeError(error));
    }
});

// router.get('/get_user_overall_expenses', async (req, res) => {
//     try {
//      async function ProcessData() {
//         `SELECT
        
//         `
//      }
     
//      await ProcessData();
//      return res.status(200).json(result);
//     } catch (error) {
//         console.error("Error during get_user_overall_expenses:", error);
//         res.status(500).json(JsonResposeError(error));
//     }
// });