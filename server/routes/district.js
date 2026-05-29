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

router.get('/getdistrict_by_search', async (req, res) => {
  try {
    const { search } = req.query;

    async function ProcessData() {
      let select_district_sql;
      let params = [];

      if (search && search.trim() !== "") {
        select_district_sql = SelectStatement(
          `SELECT
            md_id as id,
            md_store_number as store_number,
            md_store_name as store_name,
            md_city_province as city_province,
            md_status as status
           FROM master_district
           WHERE
             md_status = 'ACTIVE' AND
             (md_store_number LIKE ? OR 
             md_store_name LIKE ? OR
             md_city_province LIKE ?)
           ORDER BY md_store_name ASC`,
          [`%${search.replace(/'/g, "\\'")}%`, `%${search.replace(/'/g, "\\'")}%`, `%${search.replace(/'/g, "\\'")}%`]
        );
      } else {
        select_district_sql = SelectStatement(
          `SELECT
            md_id as id,
            md_store_number as store_number,
            md_store_name as store_name,
            md_city_province as city_province,
            md_status as status
           FROM master_district
           WHERE md_status = 'ACTIVE'
           ORDER BY md_store_name ASC
           LIMIT 10`
        );
      }

      let result = await Select(select_district_sql);
      return res.status(200).json(result);
    }

    await ProcessData();
  } catch (error) {
    console.error("Error fetching districts:", error);
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

    const requiredCols = ["STORE NO", "STORE NAME", "REGION", "CITY PROVINCE", "STATUS"];
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
      const region = row.getCell(headers["REGION"]).value;
      const city_province = row.getCell(headers["CITY PROVINCE"]).value;
      const status = row.getCell(headers["STATUS"]).value || "ACTIVE";

      if (!store_no || !store_name) continue;

      const check_sql = SelectStatement(`
        SELECT md_id FROM master_district WHERE md_store_number = '${store_no}'
      `);
      const check_result = await Select(check_sql);
      if (check_result.length > 0) {
        continue;
      }
      const insert_data = [[store_no, store_name, region, city_province, status]];
      const insert_sql = InsertStatement(
        "master_district",
        "md_",
        ["store_number", "store_name", "region", "city_province", "status"]
      );

      await Insert(insert_sql, insert_data);

      importedRows.push({
        store_no,
        store_name,
        region,
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

router.post("/create_district", async (req, res) => {
  try {
    async function ProcessData() {
      const { store_number, store_name, city_province } = req.body;
      let data = [
        [
          store_number,
          store_name,
          city_province,
          "ACTIVE"
        ],
      ];

      let insert_sql = InsertStatement(
        Masters.master_district.tablename,
        Masters.master_district.prefix,
        Masters.master_district.insertColumns
      );

      let districtResult = await Insert(insert_sql, data);

      return res.status(200).json(JsonResponseSuccess({
        message: "District created successfully.",
        district: districtResult
      }));
    }

    await ProcessData();
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json(JsonResposeError(error));
  }
})

router.put("/update_district", async (req, res) => {
  try {
    async function ProcessData() {
      const { id, store_number, store_name, city_province, status } = req.body;
      let data = [];
      let set_columns = [];

      if (store_number) {
        set_columns.push(Masters.master_district.selectOptionsColumn.store_number);
        data.push(store_number);
      }
      if (store_name) {
        set_columns.push(Masters.master_district.selectOptionsColumn.store_name);
        data.push(store_name);
      }
      if (city_province) {
        set_columns.push(Masters.master_district.selectOptionsColumn.city_province);
        data.push(city_province);
      }
      if (status) {
        set_columns.push(Masters.master_district.selectOptionsColumn.status);
        data.push(status);
      }

      data.push(id);

      let update_sql = UpdateStatement(
        Masters.master_district.tablename,
        set_columns,
        [Masters.master_district.selectOptionsColumn.id]
      );
      await Update(update_sql, [data]);

      return res.status(200).json(JsonResponseSuccess({
        message: "District updated successfully.",
      }));
    }

    await ProcessData();
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json(JsonResposeError(error));
  }
})