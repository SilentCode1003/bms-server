var express = require("express");
const axios = require("axios");
// const sharp = require("sharp");
// const tesseract = require("tesseract.js");
// let postal;
// try {
//   postal = require("node-postal");
// } catch (error) {
//   console.log("⚠️  node-postal not available, address parsing will be limited");
//   postal = null;
// }
const {
  JsonResposeError,
  JsonResponseData,
  JsonResponseSuccess,
} = require("../repository/helper/enums");
const {
  GetCurrentDatetime,
  SelectStatement,
  SelectWhereStatement,
  SelectAllStatement,
  InsertStatement,
  UpdateStatement,
} = require("../repository/helper/customhelper");
const { Liquidations } = require("../repository/model/liquidation");
const { Masters } = require("../repository/model/masters");
const {
  Select,
  Insert,
  Update,
  Delete,
} = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const {
  EncrypterString,
  DecrypterString,
} = require("../repository/helper/crytography");
const jwt = require("jsonwebtoken");
var router = express.Router();
const { DataModeling } = require("../repository/model/datamodeling");

const emitLiquidationUpdate = (req, event, data) => {
  const io = req.app.get("io");
  if (io) {
    io.emit(`liquidation:${event}`, data);
  }
};

const buildAccountingPayload = async (liquidationId) => {
  const selectItemsSql = SelectStatement(
    `SELECT li_particulars as particulars, li_amount as amount
     FROM liquidation_item
     WHERE li_liquidation_id = ?`,
    [liquidationId],
  );

  const items = await Select(selectItemsSql);

  const journal_entries = (items || []).map((item) => {
    const rawParticulars = item.particulars
      ? item.particulars.toString().trim()
      : "";
    const account_id =
      rawParticulars
        .replace(/^\s*[\d,]+(?:\s*-\s*[\d,]+)?\s*-\s*/i, "")
        .trim() || "N/A";

    return {
      account_id,
      responsibility_center: "Admin",
      debit: parseFloat(item.amount) || 0,
      credit: 0,
    };
  });

  const total_amount = journal_entries.reduce(
    (sum, entry) => sum + (parseFloat(entry.debit) || 0),
    0,
  );

  journal_entries.push({
    account_id: "Cash On Hand",
    responsibility_center: "Admin",
    debit: 0,
    credit: total_amount,
  });

  return {
    success: true,
    data: {
      document_reference: "",
      posting_date: new Date().toISOString().slice(0, 10),
      remarks: `Auto-generated allocation breakdown from checked liquidation ${liquidationId}.`,
      total_amount,
      created_by: "Admin",
      adjustment_attachments: [],
      journal_entries,
    },
  };
};

const sendAccountingPayload = async (payload) => {
  if (!process.env.ACCOUNTING_LINK) {
    console.warn(
      "ACCOUNTING_LINK is not configured, skipping accounting post.",
    );
    return null;
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (process.env.AUTHORIZATION_TOKEN) {
    headers.Authorization = `Bearer ${process.env.AUTHORIZATION_TOKEN}`;
  }

  if (process.env.TENANT_DB) {
    headers["x-tenant-db"] = process.env.TENANT_DB;
  }

  return axios.post(process.env.ACCOUNTING_LINK, payload, { headers });
};

// const processReceiptImage = async (base64Image, imageIndex) => {
//   try {
//     console.log(`\n=== Processing Receipt Image ${imageIndex + 1} ===`);

//     const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
//     const imageBuffer = Buffer.from(base64Data, "base64");

//     console.log(`Image size: ${imageBuffer.length} bytes`);

//     const processedImage = await sharp(imageBuffer)
//       .resize(2000, null, {
//         withoutEnlargement: true,
//         fit: "inside"
//       })
//       .sharpen()
//       .normalize()
//       .png()
//       .toBuffer();

//     console.log("Image processed with Sharp for OCR optimization");

//     const { data: { text } } = await tesseract.recognize(
//       processedImage,
//       'eng',
//       {
//         logger: (m) => {
//           if (m.status === 'recognizing text') {
//             console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
//           }
//         }
//       }
//     );

//     console.log(`OCR Raw Text:\n${text}`);

//     const addressPatterns = [
//       /Delivered to\s*\n\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*\d+x\s+)/gi,
//       /Delivered to\s*\n\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*[A-Z][a-z]+\s+[A-Z])/gi,
//       /Delivered to\s*\n\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Subtotal)/gi,
//       /Delivered to\s*\n\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Delivery)/gi,
//       /(\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|place|pl|square|sq)\s*[\w\s]*,?\s*[\w\s]+,?\s*[\w\s]+)/gi,
//       /(\d+\s+[\w\s]+\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|place|pl|square|sq))/gi,
//       /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*,\s*[A-Z]{2}\s*\d{5})/g,
//     ];

//     let extractedAddress = null;
//     for (const pattern of addressPatterns) {
//       const matches = text.match(pattern);
//       if (matches && matches.length > 0) {
//         extractedAddress = matches[0].trim();
//         console.log(`   Address pattern matched: ${pattern}`);
//         console.log(`   Raw extracted address: ${extractedAddress}`);

//         const lines = extractedAddress.split('\n').map(line => line.trim()).filter(line => line);
//         const cleanLines = [];

//         for (const line of lines) {
//           if (/\d+x\s+/i.test(line) ||
//               /^[A-Z][a-z]+\s+[A-Z][a-z]+\s+\d+\.?\d*$/.test(line) ||
//               /\d+\.\d+$/.test(line)) {
//             console.log(`   Skipping item description line: ${line}`);
//             continue;
//           }
//           cleanLines.push(line);
//         }

//         extractedAddress = cleanLines.join(', ').replace(/\s+/g, ' ').trim();

//         extractedAddress = extractedAddress
//           .replace(/Bifian/gi, 'Biñan')
//           .replace(/Binan/gi, 'Biñan')
//           .replace(/Nia/gi, 'ñ')
//           .replace(/Delivered to,?\s*/gi, '')
//           .replace(/^\s*Delivered to\s*/i, '');

//         if (extractedAddress.length > 100 || extractedAddress.toLowerCase().includes('roasted') || extractedAddress.toLowerCase().includes('chicken')) {
//           const deliveredToMatch = text.match(/Delivered to\s*\n\s*([^\n]+)/i);
//           if (deliveredToMatch) {
//             extractedAddress = deliveredToMatch[1].trim();
//             extractedAddress = extractedAddress
//               .replace(/Bifian/gi, 'Biñan')
//               .replace(/Binan/gi, 'Biñan')
//               .replace(/Nia/gi, 'ñ');
//             console.log(`   Using simpler address extraction: ${extractedAddress}`);
//           }
//         }

//         if (postal) {
//           try {
//             const parsedAddress = postal.parse(extractedAddress);
//             if (parsedAddress && parsedAddress.length > 0) {
//               const standardizedAddress = postal.expandAddress(extractedAddress, { country: 'US' });
//               extractedAddress = standardizedAddress || extractedAddress;
//             }
//           } catch (postalError) {
//             console.log("⚠️  Address parsing with node-postal failed, using raw address");
//           }
//         }
//         break;
//       }
//     }

//     const vatPatterns = [
//       /Incl\.?\s*VAT\s*P\s*([\d,]+\.?\d*)/gi,
//       /VAT\s*:?\s*([P$]?\s*[\d,]+\.?\d*)/gi,
//       /Tax\s*:?\s*([P$]?\s*[\d,]+\.?\d*)/gi,
//       /GST\s*:?\s*([P$]?\s*[\d,]+\.?\d*)/gi,
//       /Sales\s+Tax\s*:?\s*([P$]?\s*[\d,]+\.?\d*)/gi,
//       /(\d+\.?\d*)%\s*(?:VAT|Tax|GST|Sales\s+Tax)/gi,
//       /VAT\s*(\d+\.?\d*)/gi,
//       /Tax\s*(\d+\.?\d*)/gi,
//       /Incl\.?\s*VAT\s*([P$]?\s*[\d,]+\.?\d*)/gi,
//       /Including\s*VAT\s*([P$]?\s*[\d,]+\.?\d*)/gi,
//       /VAT\s*included\s*([P$]?\s*[\d,]+\.?\d*)/gi,
//       /Incl\.?\s*VAT\s*\$?\s*([\d,]+\.?\d*)/gi,
//       /Incl\.?\s*VAT\s*P\s*([\d,]+)1([\d]{2})/gi,
//       /Incl\.?\s*VAT\s*([P$]?\s*[\d,]+)1([\d]{2})/gi,
//       /VAT.*?([P$]?\s*[\d,]+\.?\d*)/gi,
//       /Tax.*?([P$]?\s*[\d,]+\.?\d*)/gi,
//     ];

//     let extractedVAT = null;
//     for (const pattern of vatPatterns) {
//       const matches = text.match(pattern);
//       if (matches && matches.length > 0) {
//         console.log(`   VAT pattern matched: ${pattern}`);
//         console.log(`   VAT matches found: ${matches.join(', ')}`);

//         for (const match of matches) {
//           let vatMatch = match.match(/([P$]?\s*[\d,]+\.?\d*)/);
//           if (vatMatch) {
//             let vatValue = vatMatch[1].replace(/[P$\s,]/g, '');

//             if (vatValue.length >= 4 && !vatValue.includes('.')) {
//               const wholePart = vatValue.substring(0, vatValue.length - 2);
//               const decimalPart = vatValue.substring(vatValue.length - 2);
//               if (wholePart.length > 0 && decimalPart.length === 2) {
//                 const correctedValue = wholePart + '.' + decimalPart;
//                 const correctedVAT = parseFloat(correctedValue);
//                 if (correctedVAT >= 1 && correctedVAT <= 99) {
//                   vatValue = correctedValue;
//                   console.log(`   Corrected misread decimal: ${vatValue}`);
//                 }
//               }
//             }

//             const parsedVAT = parseFloat(vatValue);
//             if (!isNaN(parsedVAT) && parsedVAT > 0 && parsedVAT < 1000) {
//               extractedVAT = parsedVAT;
//               console.log(`   Successfully extracted VAT: ${extractedVAT}%`);
//               break;
//             }
//           }
//         }
//         if (extractedVAT) break;
//       }
//     }

//     const totalAmountPattern = [
//       /Total\s*\(?\s*(?:incl\.?\s*VAT\s*(?:where\s*applicable)?\s*\)?)\s*[:=]?\s*[P$]?\s*([\d,]+\.?\d*)/gi,
//       /Total\s*[:=]?\s*[P$]?\s*([\d,]+\.?\d*)/gi,
//       /Subtotal\s*[:=]?\s*[P$]?\s*([\d,]+\.?\d*)/gi,
//       /Amount\s*[:=]?\s*[P$]?\s*([\d,]+\.?\d*)/gi,
//     ];

//     let totalAmount = null;
//     for (const pattern of totalAmountPattern) {
//       const matches = text.match(pattern);
//       if (matches && matches.length > 0) {
//         console.log(`   Total amount pattern matched: ${pattern}`);
//         console.log(`   Total amount matches found: ${matches.join(', ')}`);

//         for (const match of matches) {
//           const amountMatch = match.match(/([P$]?\s*[\d,]+\.?\d*)/);
//           if (amountMatch) {
//             const amountValue = amountMatch[1].replace(/[P$\s,]/g, '');
//             const parsedAmount = parseFloat(amountValue);
//             if (!isNaN(parsedAmount) && parsedAmount > 0) {
//               totalAmount = parsedAmount;
//               console.log(`   Successfully extracted total amount: ${totalAmount}`);
//               break;
//             }
//           }
//         }
//         if (totalAmount) break;
//       }
//     }

//     console.log(`📧 Extracted Address: ${extractedAddress || 'Not found'}`);
//     console.log(`🧾 Extracted VAT: ${extractedVAT ? extractedVAT + '%' : 'Not found'}`);
//     console.log(`💰 Total Amount: ${totalAmount ? '$' + totalAmount : 'Not found'}`);
//     console.log(`=== End Processing Receipt Image ${imageIndex + 1} ===\n`);

//     return {
//       address: extractedAddress,
//       vat: extractedVAT,
//       totalAmount: totalAmount,
//       rawText: text.substring(0, 500) + (text.length > 500 ? '...' : '')
//     };

//   } catch (error) {
//     console.error(`Error processing receipt image ${imageIndex + 1}:`, error.message);
//     console.log(`=== Error Processing Receipt Image ${imageIndex + 1} ===\n`);
//     return {
//       address: null,
//       vat: null,
//       totalAmount: null,
//       error: error.message
//     };
//   }
// };

/* GET liquidation page. */
router.get("/", function (req, res, next) {
  res.render("liquidation", { title: "Express" });
});

module.exports = router;

router.get("/getcash_liquidation", async (req, res) => {
  const { status, employee_id } = req.query;
  console.log(".env.local", process.env.ACCOUNTING_LINK);
  try {
    async function ProcessData() {
      let whereConditions = [];
      if (status) {
        if (status.toLowerCase() === "verified") {
          whereConditions.push(`l.l_status IN ('verified','completed')`);
        } else if (status.toLowerCase() === "pending") {
          whereConditions.push(`l.l_status = '${status}'`);
        } else {
          whereConditions.push(`l.l_status = '${status}'`);
        }
      }
      if (employee_id) {
        whereConditions.push(`cr.cr_employee_id = '${employee_id}'`);
      }

      let whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")} `
          : "";

      let select_liquidation_sql = SelectStatement(
        `SELECT
                    l.l_id as id,
                    l.l_cr_reference_id as reference_id,
                    cr.cr_cv_number as cv_number,
                    cr.cr_employee as employee,
                    cr.cr_employee_id as employee_id,
                    cr.cr_department as department,
                    cr.cr_position as position,
                    l.l_description as description,
                    l.l_amount_obtained as amount_obtained,
                    l.l_amount_expended as amount_expended,
                    l.l_reimburse_return as reimburse_return,
                    l.l_created_date as created_date,
                    l.l_status as status,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', li.li_id,
                                'liquidation_id', li.li_liquidation_id,
                                'date', li.li_date,
                                'rt', li.li_rt,
                                'store', li.li_store_name,
                                'particulars', li.li_particulars,
                                'reason', li.li_reason,
                                'from', li.li_from,
                                'to', li.li_to,
                                'mode_of_transportation', li.li_mode_of_transportation,
                                'amount', li.li_amount
                            )
                        )
                        FROM liquidation_item li
                        WHERE li.li_liquidation_id = l.l_id
                    ) AS liquidation_items
                FROM liquidation l
                INNER JOIN cash_request cr ON l.l_cr_reference_id = cr.cr_reference_id
                ${whereClause}
                GROUP BY l.l_id
                ${
                  status && status.toLowerCase() === "rejected"
                    ? `HAVING 
                            EXISTS (
                                SELECT 1 
                                FROM liquidation_activity lia1
                                WHERE lia1.lia_liquidation_id = l.l_id
                                AND lia1.lia_action = 'PREPARED'
                            )`
                    : ""
                }
                ORDER BY l.l_id DESC`,
      );

      let result = await Select(select_liquidation_sql);
      emitLiquidationUpdate(req, "fetched", {
        event: "liquidation_fetched",
        status: "success",
        count: result.length,
        filters: { status, employee_id },
        timestamp: new Date().toISOString(),
      });

      const io = req.app.get("io");
      if (io) {
        io.emit("liquidation:fetched", {
          status: "success",
          count: result.length,
          filters: { status, employee_id },
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json(result);
    }

    await ProcessData();
  } catch (error) {
    console.error("Error fetching liquidations:", error);
    emitLiquidationUpdate(req, "error", {
      event: "liquidation_fetch_error",
      status: "error",
      message: "Failed to fetch liquidations",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json(JsonResposeError(error));
  }
});

router.get("/getcash_liquidation_id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Liquidation ID is required" });
    }

    async function ProcessData() {
      const query = `
                SELECT 
                    lia_id as id,
                    lia_liquidation_id as liquidation_id,
                    lia_action as action,
                    lia_remarks as remarks,
                    lia_receipts as receipts,
                    lia_created_at as created_at,
                    lia_created_by as created_by
                FROM liquidation_activity
                WHERE lia_liquidation_id = ${parseInt(id, 10)}
            `;

      const result = await Select(query);

      emitLiquidationUpdate(req, "activities_fetched", {
        event: "liquidation_activities_fetched",
        status: "success",
        liquidation_id: parseInt(id, 10),
        count: result.length,
        timestamp: new Date().toISOString(),
      });

      const io = req.app.get("io");
      if (io) {
        io.emit("liquidation:activities_fetched", {
          status: "success",
          liquidation_id: parseInt(id, 10),
          count: result.length,
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json(result);
    }

    await ProcessData();
  } catch (error) {
    console.error("Error fetching liquidation activities:", error.sqlMessage);
    emitLiquidationUpdate(req, "error", {
      event: "liquidation_activities_fetch_error",
      status: "error",
      message: "Failed to fetch liquidation activities",
      error: error.sqlMessage || error.message,
      timestamp: new Date().toISOString(),
    });
    res
      .status(500)
      .json({ error: "Internal server error", details: error.sqlMessage });
  }
});

router.get("/getliquidation_by_cv_number", async (req, res) => {
  try {
    const { cv_number } = req.query;
    async function ProcessData() {
      let select_liquidation_sql = SelectStatement(
        `SELECT
        l_id as id,
        cr_employee as employee,
        cr_department as department,
        l_cr_reference_id as cr_reference_id,
        l_description as description,
        l_amount_obtained as amount_obtained,
        l_amount_expended as amount_expended,
        l_reimburse_return as reimburse_return,
        l_created_date as created_date,
        l_status as status
        FROM 
        liquidation
        left join cash_request cr on l_cr_reference_id = cr.cr_reference_id
        WHERE cr.cr_cv_number = ?
        ORDER BY l_created_date DESC
        `,
        [cv_number],
      );
      let result = await Select(select_liquidation_sql);
      return res.status(200).json(DataModeling(result, "li_"));
    }
    await ProcessData();
  } catch (error) {
    console.error("Error during getroutes_by_liquidation:", error);
    res.status(500).json(JsonResposeError(error));
  }
});

router.get("/getapproved_liquidation", async (req, res) => {
  let { status, start_date, end_date } = req.query;
  try {
    if (!start_date && !end_date) {
      start_date = "0000-01-01";
      end_date = "9999-12-31";
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

    let start = start_date ? parseToSqlDate(start_date, false) : null;
    let end = end_date ? parseToSqlDate(end_date, true) : null;

    if (!start && !end) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      start = `${yyyy}-${mm}-${dd} 00:00:00`;
      end = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    let whereClauses_cr = [];
    if (start) whereClauses_cr.push(`l.l_created_date >= '${start}'`);
    if (end) whereClauses_cr.push(`l.l_created_date <= '${end}'`);
    let whereSql_cr = whereClauses_cr.length
      ? `AND ${whereClauses_cr.join(" AND ")}`
      : "";

    async function ProcessData() {
      let select_liquidation_sql = SelectStatement(
        `SELECT
              l.l_id as id,
              l.l_cr_reference_id as cr_reference_id,
              cr.cr_cv_number as cv_number,
              cr.cr_employee as employee,
              cr.cr_employee_id as employee_id,
              cr.cr_department as department,
              cr.cr_position as position,
              l.l_description as description,
              l.l_amount_obtained as amount_obtained,
              l.l_amount_expended as amount_expended,
              l.l_reimburse_return as reimburse_return,
              l.l_created_date as created_date,
              l.l_status as status,
              SUM(li.li_amount) AS amount
          FROM liquidation l
          LEFT JOIN cash_request cr
            ON l.l_cr_reference_id = cr.cr_reference_id
          LEFT JOIN liquidation_item li
            ON l.l_id = li.li_liquidation_id
          ${status ? `WHERE l.l_status = '${status}'` : ""}
          ${whereSql_cr}
          GROUP BY l.l_id
          ORDER BY l.l_id DESC`,
      );

      let result = await Select(select_liquidation_sql);
      emitLiquidationUpdate(req, "approved_fetched", {
        event: "liquidation_approved_fetched",
        status: "success",
        count: result.length,
        filter_status: status || null,
        timestamp: new Date().toISOString(),
      });

      const io = req.app.get("io");
      if (io) {
        io.emit("liquidation:approved_fetched", {
          status: "success",
          count: result.length,
          filter_status: status || null,
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json(result);
    }

    await ProcessData();
  } catch (error) {
    console.error("Error during getapproved_liquidation:", error);
    emitLiquidationUpdate(req, "error", {
      event: "liquidation_approved_fetch_error",
      status: "error",
      message: "Failed to fetch approved liquidations",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json(JsonResposeError(error));
  }
});

router.get("/getstore_by_liquidation", async (req, res) => {
  try {
    const { store_name, offset, limit } = req.query;
    let limitValue =
      limit && limit !== "0" && limit !== "-1" && limit !== ""
        ? parseInt(limit)
        : 999999;
    let offsetValue =
      offset && offset !== "0" && offset !== "-1" && offset !== ""
        ? parseInt(offset)
        : 0;
    if (!store_name) {
      return res.status(400).json(JsonResposeError("Missing store_name"));
    }
    async function ProcessData() {
      const selectLiquidationSql = SelectStatement(
        `SELECT
        l.l_id as id,
          l.l_cr_reference_id as reference_id,
          li.li_store_name as store_name,
          cr.cr_employee employee,
          l.l_created_date as date,
          SUM(li.li_amount) AS total_amount
        FROM liquidation l
        INNER JOIN liquidation_item li ON l.l_id = li.li_liquidation_id
        INNER JOIN cash_request cr ON cr.cr_reference_id = l.l_cr_reference_id
        WHERE li.li_store_name = ?
        GROUP BY l.l_cr_reference_id, li.li_store_name, cr.cr_employee, l.l_created_date
        LIMIT ${limitValue} OFFSET ${offsetValue}`,
        [store_name, store_name],
      );

      const result = await Select(selectLiquidationSql);

      return res.status(200).json(result);
    }

    await ProcessData();
  } catch (error) {
    console.error("Error during getstore_by_liquidation:", error);
    res.status(500).json(JsonResposeError(error));
  }
});

router.get("/getroutes_by_liquidation", async (req, res) => {
  try {
    const {
      mode_of_transportation,
      start_date,
      end_date,
      reference_id,
      store_name,
    } = req.query;

    async function ProcessData() {
      let condition = "";
      let params = [];
      if (start_date && end_date) {
        condition = `AND l_created_date BETWEEN ? AND ?`;
        params.push(start_date, end_date);
      }
      if (mode_of_transportation) {
        condition += `AND li_mode_of_transportation = ?`;
        params.push(mode_of_transportation);
      }
      if (reference_id) {
        condition += `AND l_cr_reference_id = ?`;
        params.push(reference_id);
      }

      let select_liquidation_sql = SelectStatement(
        `SELECT
        cr_employee as employee,
            liquidation_item.*
            FROM 
            liquidation 
            INNER JOIN cash_request ON l_cr_reference_id = cr_reference_id
            INNER JOIN liquidation_item ON l_id = li_liquidation_id
            WHERE li_store_name = ?
            ${condition}
            ORDER BY l_created_date DESC
            `,
        [store_name, ...params],
      );
      let result = await Select(select_liquidation_sql);
      return res.status(200).json(DataModeling(result, "li_"));
    }
    await ProcessData();
  } catch (error) {
    console.error("Error during getroutes_by_liquidation:", error);
    res.status(500).json(JsonResposeError(error));
  }
});

// router.get('/getcash_request_by_id', async (req, res) => {
//         try {
//                 const { id } = req.query;
//                 async function ProcessData() {
//                         let select_cash_request = SelectStatement(
//                                 `SELECT
//                                 cr_department_id as department_id,
//                                 cr_description as description,
//                                 cr_cv_number as cv_number,
//                                 SUM(cri_subtotal) as subtotal
//                                 FROM cash_request
//                                 INNER JOIN cash_request_item ON cr_id = cri_cash_request_id
//                                 WHERE cr_id = ?
//                                 `,
//                                 [id]
//                         );
//                         let cash_request = await Select(select_cash_request);

//                         return res.status(200).json(cash_request);
//                 }

//                 await ProcessData();
//         } catch (error) {
//                 console.error("Error during login:", error);
//                 res.status(500).json(JsonResposeError(error));
//         }
// });

router.post("/create_liquidation", async (req, res) => {
  try {
    const {
      reference_id,
      description,
      amount_obtained,
      amount_expended,
      reimburse_return,
      request_items,
      remarks,
      receipts,
      created_by,
    } = req.body;
    let status = "PENDING";
    let request_date = GetCurrentDatetime();
    let action = "PREPARED";
    let created_at = GetCurrentDatetime();

    if (amount_obtained === 0) {
      return res.status(400).json(JsonResposeError("amount obtained is zero"));
    }
    const checkSql = SelectStatement(
      `SELECT * FROM liquidation WHERE l_cr_reference_id = ?`,
      [reference_id],
    );
    const existingLiquidation = await Select(checkSql);

    if (existingLiquidation.length > 0) {
      return res
        .status(400)
        .json(
          JsonResposeError("Liquidation with same reference id already exists"),
        );
    }
    if (Array.isArray(request_items) && request_items.length > 0) {
      const cleanedItems = request_items.map((item) => ({
        store_name: (item.store_name || "")
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .toUpperCase()
          .trim(),
        to: (item.to || "")
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .toUpperCase()
          .trim(),
      }));

      const uniqueStores = [
        ...new Set(cleanedItems.map((i) => i.store_name).filter(Boolean)),
      ];

      let missingToStores = [];
      uniqueStores.forEach((store) => {
        if (
          !cleanedItems.some((i) => i.store_name === store && i.to === store)
        ) {
          missingToStores.push(store);
        }
      });

      if (missingToStores.length > 0) {
        return res
          .status(400)
          .json(
            JsonResposeError(
              `Please mention the store destination you reached in the 'TO' column input field so we know you reached the store. The following stores have no TO store name: ${missingToStores.join(", ")}`,
              { missingStores: missingToStores },
            ),
          );
      }
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("liquidation:creating", {
        reference_id,
        description,
        amount_obtained,
        amount_expended,
        reimburse_return,
        timestamp: new Date().toISOString(),
      });
    }

    const liquidationData = [
      [
        reference_id,
        description,
        amount_obtained,
        amount_expended,
        reimburse_return,
        request_date,
        status,
      ],
    ];

    const insertSql = InsertStatement(
      Liquidations.liquidation.tablename,
      Liquidations.liquidation.prefix,
      Liquidations.liquidation.insertColumns,
    );

    const liquidationResult = await Insert(insertSql, liquidationData);

    const liquidation_id = liquidationResult[0].id;

    if (!liquidation_id) {
      console.log("Failed to insert liquidation");
      return res
        .status(400)
        .json(JsonResposeError("Failed to insert liquidation"));
    }

    if (Array.isArray(request_items) && request_items.length > 0) {
      for (const [index, item] of request_items.entries()) {
        if (!item.date || !item.particulars) {
          console.log(
            `Request item at index ${index} is missing required fields (date, particulars).`,
          );
          return res
            .status(400)
            .json(
              JsonResposeError(
                `Request item at index ${index} is missing required fields (date, particulars).`,
              ),
            );
        }
      }
      const activityData = [
        [
          liquidation_id,
          action,
          remarks || "",
          receipts ? JSON.stringify(receipts) : null,
          created_at,
          created_by,
        ],
      ];

      const activityInsertSql = InsertStatement(
        Liquidations.liquidation_activity.tablename,
        Liquidations.liquidation_activity.prefix,
        Liquidations.liquidation_activity.insertColumns,
      );

      await Insert(activityInsertSql, activityData);

      // // Process receipt images to extract address and VAT information
      // if (receipts && Array.isArray(receipts) && receipts.length > 0) {
      //   console.log(`\n📸 Found ${receipts.length} receipt(s) to process for address and VAT extraction`);

      //   for (let i = 0; i < receipts.length; i++) {
      //     const receipt = receipts[i];
      //     let base64Data = null;

      //     // Handle both string format and object format
      //     if (typeof receipt === 'string') {
      //       // Receipt is a base64 string
      //       base64Data = receipt;
      //       console.log(`\n🔍 Processing receipt ${i + 1}/${receipts.length} (string format)`);
      //     } else if (receipt && receipt.base64) {
      //       // Receipt is an object with base64 property
      //       base64Data = receipt.base64;
      //       console.log(`\n🔍 Processing receipt ${i + 1}/${receipts.length} (object format)`);
      //     } else {
      //       console.log(`⚠️  Receipt ${i + 1} is missing base64 data or is invalid`);
      //       console.log(`   Receipt type: ${typeof receipt}`);
      //       console.log(`   Receipt content:`, receipt);
      //       continue;
      //     }

      //     if (base64Data) {
      //       const extractedData = await processReceiptImage(base64Data, i);

      //       // Log the extracted information for verification
      //       console.log(`✅ Receipt ${i + 1} Processing Complete:`);
      //       console.log(`   - Address: ${extractedData.address || 'Not detected'}`);
      //       console.log(`   - VAT: ${extractedData.vat ? extractedData.vat + '%' : 'Not detected'}`);
      //       console.log(`   - Total Amount: ${extractedData.totalAmount ? '$' + extractedData.totalAmount : 'Not detected'}`);

      //       if (extractedData.error) {
      //         console.log(`   - Error: ${extractedData.error}`);
      //       }
      //     }
      //   }

      //   console.log(`\n🎉 All receipt images processed successfully!\n`);
      // } else {
      //   console.log(`\n📄 No receipts found or receipts array is empty\n`);
      // }

      const insertedItems = [];

      const itemsData = [];

      for (const item of request_items) {
        const cleanFrom = (item.from || "")
          .replace(/[^\w\s]/g, "")
          .replace(/\s{2,}/g, " ")
          .trim()
          .replace(/\s/g, " ")
          .toUpperCase();
        const cleanTo = (item.to || "")
          .replace(/[^\w\s]/g, "")
          .replace(/\s{2,}/g, " ")
          .trim()
          .replace(/\s/g, " ")
          .toUpperCase();
        const cleanMode = (item.mode_of_transportation || "")
          .replace(/[^\w\s]/g, "")
          .replace(/\s{2,}/g, " ")
          .trim()
          .replace(/\s/g, " ")
          .toUpperCase();
        const amount = parseFloat(item.amount) || 0;

        itemsData.push([
          liquidation_id,
          item.date || "N/A",
          item.rt || "N/A",
          item.store_name || "N/A",
          item.particulars || "N/A",
          item.reason || "N/A",
          cleanFrom,
          cleanTo,
          cleanMode,
          amount,
        ]);

        insertedItems.push({
          liquidation_id,
          from: cleanFrom,
          to: cleanTo,
          mode: cleanMode,
          amount,
        });
      }

      if (itemsData.length > 0) {
        const itemsInsertSql = InsertStatement(
          Liquidations.liquidation_item.tablename,
          Liquidations.liquidation_item.prefix,
          Liquidations.liquidation_item.insertColumns,
        );

        const bulkRes = await Insert(itemsInsertSql, itemsData);
        console.log(
          "Bulk inserted liquidation items, insertId:",
          bulkRes[0]?.id,
          "affectedRows:",
          itemsData.length,
        );
      }

      // const select_red_flags_sql = SelectStatement(`
      //     WITH counted AS (
      //         SELECT
      //         li.li_from,
      //         li.li_to,
      //         li.li_mode_of_transportation,
      //         li.li_amount,
      //         COUNT(*) AS cnt
      //         FROM liquidation_item li
      //         LEFT JOIN liquidation l ON li.li_liquidation_id = l.l_id
      //         WHERE l.l_status != 'rejected'
      //         GROUP BY li.li_from, li.li_to, li.li_mode_of_transportation, li.li_amount
      //     ),
      //     ranked AS (
      //         SELECT
      //         li_from,
      //         li_to,
      //         li_mode_of_transportation,
      //         li_amount,
      //         cnt,
      //         DENSE_RANK() OVER (
      //             PARTITION BY li_from, li_to, li_mode_of_transportation
      //             ORDER BY cnt DESC
      //         ) AS rnk
      //         FROM counted
      //     )
      //     SELECT
      //         li_from AS started_from,
      //         li_to AS ended_to,
      //         li_mode_of_transportation AS mode_of_transportation,
      //         MIN(CASE WHEN rnk = 1 THEN li_amount END) AS min_amount,
      //         MAX(CASE WHEN rnk IN (1,2) THEN li_amount END) AS max_amount
      //     FROM ranked
      //     GROUP BY li_from, li_to, li_mode_of_transportation
      //     ORDER BY started_from, ended_to, mode_of_transportation;
      //     `);

      // const red_flags = await Select(select_red_flags_sql);
      // const redFlaggedItems = [];

      // for (const item of insertedItems) {
      //     const match = red_flags.find(
      //         r =>
      //             r.started_from === item.from &&
      //             r.ended_to === item.to &&
      //             r.mode_of_transportation === item.mode
      //     );

      //     if (match) {
      //         const { min_amount, max_amount } = match;

      //         if (item.amount < min_amount || item.amount > max_amount) {
      //             redFlaggedItems.push({
      //                 rf_liquidation_id: item.liquidation_id,
      //                 rf_liquidation_item_id: item.liquidation_item_id,
      //                 rf_from: item.from,
      //                 rf_to: item.to,
      //                 rf_mode_of_transportation: item.mode,
      //                 rf_amount: item.amount,
      //                 rf_min_amount: min_amount,
      //                 rf_max_amount: max_amount,
      //                 rf_created_by: created_by,
      //                 rf_created_date: new Date().toISOString().slice(0, 19).replace("T", " ")
      //             });
      //         }
      //     }
      // }

      // if (redFlaggedItems.length > 0) {
      //     const redFlagInsertSql = InsertStatement(
      //         Masters.red_flags.tablename,
      //         Masters.red_flags.prefix,
      //         Masters.red_flags.insertColumns
      //     );

      //     for (const rf of redFlaggedItems) {
      //         const values = [
      //             rf.rf_liquidation_id,
      //             rf.rf_liquidation_item_id,
      //             rf.rf_from,
      //             rf.rf_to,
      //             rf.rf_mode_of_transportation,
      //             rf.rf_min_amount,
      //             rf.rf_max_amount,
      //             rf.rf_amount,
      //             rf.rf_created_by,
      //             rf.rf_created_date
      //         ];

      //         await Insert(redFlagInsertSql, [[values]]);
      //     }
      // }

      // console.log("✅ Red flagged items:", redFlaggedItems);
    }

    if (io) {
      io.emit("liquidation:created", {
        id: liquidation_id,
        reference_id,
        status,
        amount_obtained,
        amount_expended,
        reimburse_return,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json(JsonResponseSuccess({ id: liquidation_id }));
  } catch (error) {
    console.error("Error in create_liquidation:", error);

    const io = req.app.get("io");
    if (io) {
      io.emit("liquidation:create_error", {
        message:
          error.message || "An error occurred while creating the liquidation",
        timestamp: new Date().toISOString(),
      });
    }

    res
      .status(500)
      .json(
        JsonResposeError(
          error.message || "An error occurred while creating the liquidation",
        ),
      );
  }
});

router.put("/undo_liquidation", async (req, res) => {
  try {
    const { liquidation_id } = req.body;

    if (!liquidation_id) {
      return res.status(400).json(JsonResposeError("Missing liquidation_id"));
    }

    const checkSql = SelectStatement(
      `SELECT l_id FROM liquidation WHERE l_id = ? LIMIT 1`,
      [liquidation_id],
    );

    const existing = await Select(checkSql);
    if (existing.length === 0) {
      return res.status(404).json(JsonResposeError("Liquidation not found"));
    }

    const id = existing[0].l_id;
    const reference_id = existing[0].l_reference_id;

    await Delete(
      `DELETE FROM liquidation_activity
       WHERE lia_liquidation_id = ? AND lia_action = ?`,
      [id, "CHECKED"],
    );

    const status = "approved";
    const notification = 1;
    const updateData = [status, notification, id];

    const update_sql = UpdateStatement(
      Liquidations.liquidation.tablename,
      [
        Liquidations.liquidation.selectOptionsColumn.status,
        Liquidations.liquidation.selectOptionsColumn.notification,
      ],
      [Liquidations.liquidation.selectOptionsColumn.id],
    );

    await Update(update_sql, updateData);

    emitLiquidationUpdate(req, "rollback_liquidation", {
      event: "liquidation_rollback",
      status: "success",
      id,
      reference_id,
      timestamp: new Date().toISOString(),
    });

    return res
      .status(200)
      .json(JsonResponseSuccess("Undo liquidation successful"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(JsonResposeError(error));
  }
});

router.put("/update_liquidation", async (req, res) => {
  try {
    const { status, id, remarks, receipts, created_by } = req.body;
    console.log(req.body);
    let created_at = GetCurrentDatetime();
    if (!id || !status) {
      return res.status(400).json(JsonResposeError("Missing required fields"));
    }

    async function ProcessData() {
      emitLiquidationUpdate(req, "updating", {
        event: "liquidation_updating",
        status: "in_progress",
        liquidation_id: id,
        new_status: status,
        timestamp: new Date().toISOString(),
      });

      if (status === "approved") {
        let data = [status, 1, id];
        let update_sql = UpdateStatement(
          Liquidations.liquidation.tablename,
          [
            Liquidations.liquidation.selectOptionsColumn.status,
            Liquidations.liquidation.selectOptionsColumn.notification,
          ],
          [Liquidations.liquidation.selectOptionsColumn.id],
        );
        await Update(update_sql, [data]);

        let activityData = [
          [id, "NOTED", remarks || "", receipts, created_at, created_by],
        ];
        let activity_insert_sql = InsertStatement(
          Liquidations.liquidation_activity.tablename,
          Liquidations.liquidation_activity.prefix,
          Liquidations.liquidation_activity.insertColumns,
        );
        await Insert(activity_insert_sql, activityData);

        emitLiquidationUpdate(req, "approved", {
          event: "liquidation_approved",
          status: "success",
          liquidation_id: id,
          approved_by: created_by,
          timestamp: new Date().toISOString(),
        });
      } else if (status === "verified") {
        let data = [status, 1, id];
        let update_sql = UpdateStatement(
          Liquidations.liquidation.tablename,
          [
            Liquidations.liquidation.selectOptionsColumn.status,
            Liquidations.liquidation.selectOptionsColumn.notification,
          ],
          [Liquidations.liquidation.selectOptionsColumn.id],
        );
        await Update(update_sql, [data]);

        let activityData = [
          [id, "CHECKED", "", receipts, created_at, created_by],
        ];
        let activity_insert_sql = InsertStatement(
          Liquidations.liquidation_activity.tablename,
          Liquidations.liquidation_activity.prefix,
          Liquidations.liquidation_activity.insertColumns,
        );
        await Insert(activity_insert_sql, activityData);
        let select_liquidation = SelectStatement(
          `SELECT
            l_cr_reference_id as reference_id,
            l_amount_obtained as amount_issued,
            l_amount_expended as amount_expended,
            IF(l_amount_expended > l_amount_obtained, l_amount_expended - l_amount_obtained, 0) as amount_reimburse,
            IF(l_amount_expended < l_amount_obtained, l_amount_obtained - l_amount_expended, 0) as amount_return,
            cr_cv_number as cash_voucher
            FROM liquidation
            INNER JOIN cash_request ON l_cr_reference_id = cr_reference_id
            WHERE l_id = ?
          `,
          [id],
        );
        let liquidation = await Select(select_liquidation);

        let {
          amount_issued,
          amount_expended,
          amount_reimburse,
          amount_return,
          cash_voucher,
        } = liquidation[0];

        let select_emmployee_id = SelectStatement(
          `SELECT
                    cr_employee_id as employee_id
                    FROM cash_request
                    WHERE cr_reference_id = "${liquidation[0]?.reference_id}"`,
        );
        let employee_id = await Select(select_emmployee_id);
        employee_id = employee_id[0]?.employee_id;

        let select_wallet_sql = SelectStatement(
          `SELECT
                    mw_id as id,
                    mw_employee_id as employee_id,
                    mw_previous_amount as previous_amount,
                    mw_current_amount as current_amount
                    FROM master_wallet
                    WHERE mw_employee_id = "${employee_id}"`,
        );
        let walletResult = await Select(select_wallet_sql);
        let { previous_amount, current_amount } = walletResult[0];
        console.log(
          "Current and Previouse amount",
          previous_amount,
          current_amount,
        );

        let wallet_data = [current_amount, 0, employee_id];
        let update_wallet_sql = UpdateStatement(
          Masters.master_wallet.tablename,
          [
            Masters.master_wallet.selectOptionsColumn.previous_amount,
            Masters.master_wallet.selectOptionsColumn.current_amount,
          ],
          [Masters.master_wallet.selectOptionsColumn.employee_id],
        );
        await Update(update_wallet_sql, [wallet_data]);

        let wallet_activityData = [
          [
            walletResult[0]?.id,
            `Updated wallet balance in liquidation from:${current_amount} to 0, ${amount_issued} issued, ${amount_expended} expended, ${amount_reimburse} reimbursed, ${amount_return} returned`,
            created_at,
          ],
        ];
        let wallet_activity_insert_sql = InsertStatement(
          Masters.master_wallet_activity.tablename,
          Masters.master_wallet_activity.prefix,
          Masters.master_wallet_activity.insertColumns,
        );
        await Insert(wallet_activity_insert_sql, wallet_activityData);

        const accountingPayload = await buildAccountingPayload(id);
        try {
          await sendAccountingPayload(accountingPayload);
        } catch (error) {
          console.error(
            "Failed to send accounting payload:",
            error?.message || error,
          );
        }

        emitLiquidationUpdate(req, "verified", {
          event: "liquidation_verified",
          status: "success",
          liquidation_id: id,
          reference_id: liquidation[0]?.reference_id,
          cash_voucher: liquidation[0]?.cash_voucher,
          amount_expended: liquidation[0]?.amount_expended,
          amount_issued: liquidation[0]?.amount_issued,
          updated_by: created_by,
          timestamp: new Date().toISOString(),
        });

        return res.status(200).json(liquidation);
      } else if (status === "completed") {
        let data = [status, 1, id];
        let update_sql = UpdateStatement(
          Liquidations.liquidation.tablename,
          [
            Liquidations.liquidation.selectOptionsColumn.status,
            Liquidations.liquidation.selectOptionsColumn.notification,
          ],
          [Liquidations.liquidation.selectOptionsColumn.id],
        );
        await Update(update_sql, [data]);

        let activityData = [
          [id, "APPROVED", "", receipts, created_at, created_by],
        ];
        let activity_insert_sql = InsertStatement(
          Liquidations.liquidation_activity.tablename,
          Liquidations.liquidation_activity.prefix,
          Liquidations.liquidation_activity.insertColumns,
        );
        await Insert(activity_insert_sql, activityData);

        emitLiquidationUpdate(req, "completed", {
          event: "liquidation_completed",
          status: "success",
          liquidation_id: id,
          updated_by: created_by,
          timestamp: new Date().toISOString(),
        });
      } else if (status === "rejected") {
        let data = [[status, 1, id]];
        let update_sql = UpdateStatement(
          Liquidations.liquidation.tablename,
          [
            Liquidations.liquidation.selectOptionsColumn.status,
            Liquidations.liquidation.selectOptionsColumn.notification,
          ],
          [Liquidations.liquidation.selectOptionsColumn.id],
        );
        await Update(update_sql, data);

        let select_liquidation_activity_sql = SelectStatement(
          `SELECT lia_id FROM liquidation_activity 
           WHERE lia_liquidation_id = ? AND lia_action != 'REJECTED'`,
          [id],
        );
        let liquidation_activity = await Select(
          select_liquidation_activity_sql,
        );
        if (liquidation_activity.length > 0) {
          await Delete(
            `DELETE FROM liquidation_activity 
             WHERE lia_liquidation_id = ? AND lia_action = 'REJECTED'`,
            [id],
          );
        }

        let activityData = [
          [id, "REJECTED", remarks || "", receipts, created_at, created_by],
        ];
        let activity_insert_sql = InsertStatement(
          Liquidations.liquidation_activity.tablename,
          Liquidations.liquidation_activity.prefix,
          Liquidations.liquidation_activity.insertColumns,
        );
        await Insert(activity_insert_sql, activityData);

        emitLiquidationUpdate(req, "rejected", {
          event: "liquidation_rejected",
          status: "success",
          liquidation_id: id,
          remarks: remarks || "",
          updated_by: created_by,
          timestamp: new Date().toISOString(),
        });
      } else if (status === "incomplete") {
        let data = [[status, 1, id]];
        let update_sql = UpdateStatement(
          Liquidations.liquidation.tablename,
          [
            Liquidations.liquidation.selectOptionsColumn.status,
            Liquidations.liquidation.selectOptionsColumn.notification,
          ],
          [Liquidations.liquidation.selectOptionsColumn.id],
        );
        await Update(update_sql, data);

        let activityData = [
          [id, "INCOMPLETE", remarks || "", receipts, created_at, created_by],
        ];
        let activity_insert_sql = InsertStatement(
          Liquidations.liquidation_activity.tablename,
          Liquidations.liquidation_activity.prefix,
          Liquidations.liquidation_activity.insertColumns,
        );
        await Insert(activity_insert_sql, activityData);

        emitLiquidationUpdate(req, "incomplete", {
          event: "liquidation_incomplete",
          status: "success",
          liquidation_id: id,
          remarks: remarks || "",
          updated_by: created_by,
          timestamp: new Date().toISOString(),
        });
      }

      emitLiquidationUpdate(req, "updated", {
        event: "liquidation_updated",
        status: "success",
        liquidation_id: id,
        new_status: status,
        updated_by: created_by,
        timestamp: new Date().toISOString(),
      });
      res.status(200).json(JsonResponseSuccess());
    }

    await ProcessData();
  } catch (error) {
    console.log(error);
    res.status(500).json(JsonResposeError(error));
  }
});

router.put("/update_liquidation_rejected", async (req, res) => {
  try {
    const { liquidation_id, items, remarks, receipts, status, updated_by } =
      req.body;
    console.log(req.body);
    if (!liquidation_id) {
      console.log("Missing liquidation_id");
      return res.status(400).json(JsonResposeError("Missing liquidation_id"));
    }

    // if (!Array.isArray(items) || items.length === 0) {
    //     return res.status(400).json(JsonResposeError("At least one item is required"));
    // }

    // for (const item of items) {
    //     if (!item.date || !item.particulars) {
    //         return res.status(400).json(
    //             JsonResposeError("Each item must have date, particulars, and amount")
    //         );
    //     }
    // }

    if (Array.isArray(items) && items.length > 0) {
      const cleanedItems = items.map((item) => ({
        store_name: (item.store_name || "")
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, " ")
          .trim(),
        to: (item.to || "")
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, " ")
          .trim(),
        mode_of_transportation: (item.mode_of_transportation || "")
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, " ")
          .trim(),
      }));

      const uniqueStores = [
        ...new Set(cleanedItems.map((i) => i.store_name).filter(Boolean)),
      ];
      const uniqueTo = [
        ...new Set(cleanedItems.map((i) => i.to).filter(Boolean)),
      ];

      let hasReachedAllDestinations = false;
      if (uniqueStores.length === 1) {
        const store = uniqueStores[0];
        hasReachedAllDestinations = cleanedItems.some((i) => i.to === store);
      } else {
        hasReachedAllDestinations = uniqueStores.every((store) =>
          cleanedItems.some((i) => i.to === store),
        );
      }

      let missingToStores = [];
      uniqueStores.forEach((store) => {
        if (
          !cleanedItems.some(
            (i) =>
              i.store_name === store &&
              i.to === store &&
              i.mode_of_transportation !== "",
          )
        ) {
          missingToStores.push(store);
        }
      });
      if (missingToStores.length > 0) {
        return res
          .status(400)
          .json(
            JsonResposeError(
              `Please mention the store destination you reached in the 'TO' column input field so we know you reached the store. The following stores have no TO store name: ${missingToStores.join(
                ", ",
              )}`,
              { missingStores: missingToStores },
            ),
          );
      }
    }

    let storedReceipts = Array.isArray(receipts)
      ? receipts.map((r, i) => ({
          id: r.id || (i + 1).toString(),
          image: r.image || "",
        }))
      : [];

    const liquidationSql = SelectStatement(
      `SELECT l_amount_obtained AS amount_obtained 
       FROM liquidation 
       WHERE l_id = ?`,
      [liquidation_id],
    );

    const liquidation = await Select(liquidationSql);
    const amount_obtained = liquidation?.[0]?.amount_obtained || 0;

    const amount_expended = items.reduce(
      (sum, i) => sum + (parseFloat(i.amount) || 0),
      0,
    );
    let reimburse_return = amount_obtained - amount_expended;
    if (reimburse_return < 0) reimburse_return = Math.abs(reimburse_return);

    const updateLiquidationSql = UpdateStatement(
      Liquidations.liquidation.tablename,
      ["l_amount_expended", "l_reimburse_return"],
      ["l_id"],
    );
    await Update(updateLiquidationSql, [
      amount_expended,
      reimburse_return,
      liquidation_id,
    ]);

    await Delete(`DELETE FROM red_flags WHERE rf_liquidation_id = ?`, [
      liquidation_id,
    ]);

    await Delete(`DELETE FROM liquidation_item WHERE li_liquidation_id = ?`, [
      liquidation_id,
    ]);

    const itemsData = items.map((item) => [
      liquidation_id,
      item.date || "N/A",
      item.rt || "N/A",
      item.store_name || "N/A",
      item.particulars || "N/A",
      item.reason || "N/A",
      item.from
        ? item.from.replace(/[^\w\s]/g, "").replace(/\s+/g, " ")
        : "N/A",
      item.to ? item.to.replace(/[^\w\s]/g, "").replace(/\s+/g, " ") : "N/A",
      item.mode_of_transportation
        ? item.mode_of_transportation
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, " ")
        : "N/A",
      parseFloat(item.amount) || 0,
    ]);

    if (itemsData.length > 0) {
      const insert_item_sql = InsertStatement(
        Liquidations.liquidation_item.tablename,
        Liquidations.liquidation_item.prefix,
        Liquidations.liquidation_item.insertColumns,
      );
      await Insert(insert_item_sql, itemsData);

      const selectInsertedSql = SelectStatement(
        `SELECT li_id, li_liquidation_id, li_from, li_to, li_mode_of_transportation, li_amount 
   FROM liquidation_item 
   WHERE li_liquidation_id = ? 
   ORDER BY li_id DESC LIMIT ${itemsData.length}`,
        [liquidation_id],
      );

      const insertedRows = await Select(selectInsertedSql);

      const insertedItems = insertedRows.map((row) => ({
        liquidation_id: row.li_liquidation_id,
        liquidation_item_id: row.li_id,
        from: row.li_from,
        to: row.li_to,
        mode: row.li_mode_of_transportation,
        amount: parseFloat(row.li_amount) || 0,
      }));
      // if (insertedItems.length > 0) {
      //     const select_red_flags_sql = `
      //         WITH counted AS (
      //             SELECT
      //                 li.li_from,
      //                 li.li_to,
      //                 li.li_mode_of_transportation,
      //                 li.li_amount,
      //                 COUNT(*) AS cnt
      //             FROM liquidation_item li
      //             LEFT JOIN liquidation l ON li.li_liquidation_id = l.l_id
      //             WHERE l.l_status != 'rejected'
      //             AND li.li_liquidation_id != ?
      //             GROUP BY li.li_from, li.li_to, li.li_mode_of_transportation, li.li_amount
      //         ),
      //         ranked AS (
      //             SELECT
      //                 li_from,
      //                 li_to,
      //                 li_mode_of_transportation,
      //                 li_amount,
      //                 cnt,
      //                 DENSE_RANK() OVER (
      //                     PARTITION BY li_from, li_to, li_mode_of_transportation
      //                     ORDER BY cnt DESC
      //                 ) AS rnk
      //             FROM counted
      //         )
      //         SELECT
      //             li_from AS started_from,
      //             li_to AS ended_to,
      //             li_mode_of_transportation AS mode_of_transportation,
      //             MIN(CASE WHEN rnk = 1 THEN li_amount END) AS min_amount,
      //             MAX(CASE WHEN rnk IN (1,2) THEN li_amount END) AS max_amount
      //         FROM ranked
      //         GROUP BY li_from, li_to, li_mode_of_transportation
      //         ORDER BY started_from, ended_to, mode_of_transportation;
      //     `;

      //     const select_red_flags_formatted = SelectStatement(select_red_flags_sql, [liquidation_id]);
      //     const red_flags = await Select(select_red_flags_formatted);
      //     const redFlaggedItems = [];

      //     for (const item of insertedItems) {
      //         const match = red_flags.find(
      //             r =>
      //                 r.started_from === item.from &&
      //                 r.ended_to === item.to &&
      //                 r.mode_of_transportation === item.mode
      //         );

      //         if (match) {
      //             const { min_amount, max_amount } = match;

      //             if (item.amount < min_amount || item.amount > max_amount) {
      //                 redFlaggedItems.push([
      //                     item.liquidation_id,
      //                     item.liquidation_item_id,
      //                     item.from,
      //                     item.to,
      //                     item.mode,
      //                     min_amount,
      //                     max_amount,
      //                     item.amount,
      //                     updated_by,
      //                     new Date().toISOString().slice(0, 19).replace("T", " ")
      //                 ]);
      //             }
      //         }
      //     }

      //     if (redFlaggedItems.length > 0) {
      //         const redFlagInsertSql = InsertStatement(
      //             Masters.red_flags.tablename,
      //             Masters.red_flags.prefix,
      //             Masters.red_flags.insertColumns
      //         );

      //         await Insert(redFlagInsertSql, redFlaggedItems);
      //     }

      //     console.log("✅ Red flagged items:", redFlaggedItems);
      // }
    }

    const updateActivitySql = UpdateStatement(
      Liquidations.liquidation_activity.tablename,
      [
        Liquidations.liquidation_activity.selectOptionsColumn.remarks,
        Liquidations.liquidation_activity.selectOptionsColumn.receipts,
      ],
      [
        Liquidations.liquidation_activity.selectOptionsColumn.liquidation_id,
        Liquidations.liquidation_activity.selectOptionsColumn.action,
      ],
    );

    await Update(updateActivitySql, [
      remarks || "",
      storedReceipts ? JSON.stringify(storedReceipts) : null,
      liquidation_id,
      "PREPARED",
    ]);

    if (status != "incomplete") {
      const updateStatusSql = UpdateStatement(
        "liquidation",
        ["l_status", "l_notification"],
        ["l_id"],
      );
      await Update(updateStatusSql, ["pending", 1, liquidation_id]);
    } else {
      const updateStatusSql = UpdateStatement(
        "liquidation",
        ["l_status", "l_notification"],
        ["l_id"],
      );
      await Update(updateStatusSql, ["verified", 1, liquidation_id]);
    }

    // await Delete(
    //   `DELETE FROM liquidation_activity
    //    WHERE lia_liquidation_id = ? AND lia_action != ?`,
    //   [liquidation_id, 'REJECTED']
    // );

    emitLiquidationUpdate(req, "reopened", {
      event: "liquidation_reopened_after_rejection",
      status: "success",
      liquidation_id,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(JsonResponseSuccess());
  } catch (error) {
    console.error("Error in update_liquidation_rejected:", error);
    res
      .status(500)
      .json(
        JsonResposeError(
          error.message || "An error occurred while processing your request.",
        ),
      );
  }
});

router.put("/update_liquidation_notification", async (req, res) => {
  try {
    const { id, notification } = req.body;
    console.log(req.body);
    if (!id || notification === undefined) {
      return res.status(400).json(JsonResposeError("Missing required fields"));
    }

    let updateData = [[notification, id]];
    let update_liquidation_sql = UpdateStatement(
      Liquidations.liquidation.tablename,
      [Liquidations.liquidation.selectOptionsColumn.notification],
      [Liquidations.liquidation.selectOptionsColumn.id],
    );
    await Update(update_liquidation_sql, updateData);

    res.status(200).json(JsonResponseSuccess());
  } catch (error) {
    console.error("Error in update_liquidation_notification:", error);
    res.status(500).json(JsonResposeError(error));
  }
});
