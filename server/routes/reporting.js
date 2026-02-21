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

// Function to emit reporting updates
const emitReportingUpdate = (req, event, data) => {
    const io = req.app.get('io');
    if (io) {
        io.emit(`reporting:${event}`, data);
    }
};

/* GET reporting page. */
router.get('/', function (req, res, next) {
    res.render('reporting', { title: 'Express' });
});

module.exports = router;


router.get('/get_region_city_province', async (req, res) => {
  try {
    let select_region_city_province = SelectStatement(`
      SELECT
        md.md_region AS region,
        md.md_city_province AS city_province,
        li.li_amount AS amount
      FROM liquidation_item li
      LEFT JOIN master_district md
        ON CONCAT(md.md_store_number, ' ', md.md_store_name) = li.li_store_name
      LEFT JOIN liquidation l
        ON l.l_id = li.li_liquidation_id
    `);

    let rows = await Select(select_region_city_province);

    const result = {
      Region: {},
      City_Province: {},
      Overall: { count: 0, sum: 0 }
    };

    rows.forEach(row => {
      const count = 1;
      const sum = parseFloat(row.amount || 0);

      if (row.region) {
        if (!result.Region[row.region]) {
          result.Region[row.region] = { count: 0, sum: 0 };
        }
        result.Region[row.region].count += count;
        result.Region[row.region].sum += sum;
      }

      if (row.city_province) {
        if (!result.City_Province[row.city_province]) {
          result.City_Province[row.city_province] = { count: 0, sum: 0 };
        }
        result.City_Province[row.city_province].count += count;
        result.City_Province[row.city_province].sum += sum;
      }

      result.Overall.count += count;
      result.Overall.sum += sum;
    });

    Object.values(result.Region).forEach(r => r.sum = parseFloat(r.sum.toFixed(2)));
    Object.values(result.City_Province).forEach(c => c.sum = parseFloat(c.sum.toFixed(2)));
    result.Overall.sum = parseFloat(result.Overall.sum.toFixed(2));

    return res.status(200).json({
      message: "SUCCESS",
      data: result
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", error: error.toString() });
  }
});

// router.get('/get_data', async (req, res) => {
//     try {
//     let select_data = SelectStatement(`
//     SELECT
//     md_store_name,
//     md_region
//     master_district
//     `);
//     let rows = await Select(select_data);
//     return res.status(200).json({
//         message: "SUCCESS",
//         data: rows
//     });
//     } catch (error) {
//    return res.status(500).json(JsonResposeError(error));     
//     }
// });