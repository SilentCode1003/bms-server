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
const ExcelJS = require('exceljs');
const multer = require('multer');
const upload = multer();
var router = express.Router();


/* GET district page. */
router.get('/', function (req, res, next) {
        res.render('district', { title: 'Express' });
});

module.exports = router;

router.get('/getdistrict', async (req, res) => {
        try {
                async function ProcessData() {
                        let select_district_sql = SelectStatement(
                                `SELECT
                                md_id as id,
                                md_store_number as store_number,
                                md_store_name as store_name,
                                md_city_province as city_province,
                                md_status as status
                                FROM master_district
                                `
                        );

                        let result = await Select(select_district_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.get('/getdistrict_by_id', async (req, res) => {
        try {
                const { id } = req.query;

                if (!id) {
                        return res.status(400).json({ error: 'District ID is required' });
                }

                async function ProcessData() {
                        let select_district_sql = SelectStatement(
                                `SELECT
                                md_id as id,
                                md_store_number as store_number,
                                md_store_name as store_name,
                                md_city_province as city_province,
                                md_status as status
                                FROM master_district
                                WHERE md_id = ?
                                `, [id]
                        );

                        let result = await Select(select_district_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.post("/createdistrict_excel", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(JsonResposeError("No file uploaded."));
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const ws = workbook.worksheets[0];

    if (!ws) {
      return res.status(400).json(JsonResposeError("Invalid Excel format."));
    }

    const headerRow = ws.getRow(1);
    const headers = {};
    headerRow.eachCell((cell, colNumber) => {
      headers[cell.value?.toString().trim()] = colNumber;
    });

    const requiredCols = ["STORE NO", "STORE NAME", "CITY PROVINCE", "STATUS"];
    for (const col of requiredCols) {
      if (!headers[col]) {
        return res.status(400).json(JsonResposeError(`Missing column: ${col}`));
      }
    }

    let importedRows = [];
    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      const store_no = row.getCell(headers["STORE NO"]).value;
      const store_name = row.getCell(headers["STORE NAME"]).value;
      const city_province = row.getCell(headers["CITY PROVINCE"]).value;
      const status = row.getCell(headers["STATUS"]).value || "ACTIVE";

      if (!store_no || !store_name) continue;

      const check_sql = SelectStatement(`
        SELECT md_id FROM master_district WHERE md_store_number = '${store_no}'
      `);
      const check_result = await Select(check_sql);
      if (check_result.length > 0) {
        console.log(`Skipping duplicate store: ${store_no}`);
        continue;
      }
      const insert_data = [[store_no, store_name, city_province, status]];
      const insert_sql = InsertStatement(
        "master_district",
        "md_",
        ["store_number", "store_name", "city_province", "status"]
      );

      await Insert(insert_sql, insert_data);

      importedRows.push({
        store_no,
        store_name,
        city_province,
        status
      });
    }

    res.status(200).json(JsonResponseSuccess({
      message: `${importedRows.length} store records successfully imported.`,
      imported: importedRows
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json(JsonResposeError(error));
  }
});
