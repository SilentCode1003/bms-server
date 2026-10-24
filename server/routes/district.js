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
const axios = require("axios");
const ExcelJS = require("exceljs");
const multer = require("multer");
const upload = multer();
var router = express.Router();

const SLINK_API_BASE_URL = (
  process.env.SLINK_LINK ||
  process.env.SLINK_API_BASE_URL ||
  "https://slink-api.5lsolutions.com"
).replace(/\/$/, "");

const MAX_SLINK_SYNC_LIMIT = 1000;

const normalizeSyncLimit = (value, fallback = 500) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  if (numericValue < 1) {
    return 1;
  }

  if (numericValue > MAX_SLINK_SYNC_LIMIT) {
    return MAX_SLINK_SYNC_LIMIT;
  }

  return Math.floor(numericValue);
};

const cleanText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeStoreNumber = (value) => {
  const normalized = cleanText(value).replace(/['"]/g, "");

  if (!normalized) {
    return null;
  }

  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  if (normalized.length > 10) {
    return null;
  }

  return normalized;
};

const normalizeStoreName = (value) => {
  const normalized = cleanText(value).replace(/['"]/g, "");

  if (!normalized) {
    return null;
  }

  if (/^[0-9]+$/.test(normalized)) {
    return null;
  }

  return normalized;
};

const normalizeDistrictRecord = (store = {}) => {
  const storeNumberCandidate = normalizeStoreNumber(
    store.store_no ?? store.storeNo ?? store.store_number ?? store.storeNumber,
  );

  const storeNameCandidate = normalizeStoreName(
    store.store_name ?? store.storeName ?? store.name ?? store.company_name,
  );

  if (!storeNumberCandidate || !storeNameCandidate) {
    return null;
  }

  const region = cleanText(
    store.region ??
      store.region_name ??
      store.regionName ??
      store.company_region ??
      "N/A",
  );
  const cityProvince = cleanText(
    store.city_province ??
      store.cityProvince ??
      store.city_province_name ??
      store.city ??
      store.province ??
      "N/A",
  );
  const status = String(store.status ?? "ACTIVE")
    .trim()
    .toUpperCase();

  return {
    store_number: String(storeNumberCandidate).trim(),
    store_name: String(storeNameCandidate).trim(),
    region: region || "N/A",
    city_province: cityProvince || "N/A",
    status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
};

const extractSlinkStoreList = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const nestedPayload =
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
      ? payload.data
      : payload;

  if (Array.isArray(nestedPayload)) {
    return nestedPayload;
  }

  if (Array.isArray(nestedPayload.customers)) {
    return nestedPayload.customers;
  }

  if (Array.isArray(nestedPayload.stores)) {
    return nestedPayload.stores;
  }

  if (Array.isArray(nestedPayload.items)) {
    return nestedPayload.items;
  }

  if (Array.isArray(nestedPayload.result)) {
    return nestedPayload.result;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

async function syncDistrictFromSlinkStores({
  status = "ACTIVE",
  limit = 500,
} = {}) {
  const safeLimit = normalizeSyncLimit(limit, 500);
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PROJECT_AUTHORIZATION_TOKEN}`,
  };

  let afterId = null;
  let page = 0;
  let skippedDuplicates = 0;
  const districtRecordsByStoreNumber = new Map();

  do {
    page += 1;

    const params = {
      limit: safeLimit,
      ...(status ? { status } : {}),
      ...(afterId !== null ? { after_id: afterId } : {}),
    };

    const response = await axios.get(`${SLINK_API_BASE_URL}/bms/stores`, {
      params,
      headers,
      timeout: 30000,
    });

    const responsePayload = response?.data || {};
    const payload =
      responsePayload &&
      responsePayload.data &&
      typeof responsePayload.data === "object"
        ? responsePayload.data
        : responsePayload;
    const stores = extractSlinkStoreList(payload);

    if (!stores.length) {
      break;
    }

    for (const store of stores) {
      const districtRecord = normalizeDistrictRecord(store);

      if (!districtRecord) {
        continue;
      }

      if (districtRecordsByStoreNumber.has(districtRecord.store_number)) {
        skippedDuplicates += 1;
        continue;
      }
      districtRecordsByStoreNumber.set(
        districtRecord.store_number,
        districtRecord,
      );
    }

    const nextAfterId =
      payload.next_after_id ?? payload.nextAfterId ?? payload.after_id ?? null;
    const hasMore =
      payload.has_more !== undefined
        ? Boolean(payload.has_more)
        : payload.hasMore !== undefined
          ? Boolean(payload.hasMore)
          : nextAfterId !== null && nextAfterId !== undefined;

    if (!hasMore || !nextAfterId) {
      break;
    }

    afterId = nextAfterId;
  } while (page < 50);

  if (districtRecordsByStoreNumber.size === 0) {
    const error = new Error(
      "Slink returned no stores with valid store numbers. Existing district data was not changed. Check the owner filter and Slink response.",
    );
    error.statusCode = 502;
    throw error;
  }

  await Delete("DELETE FROM master_district");

  const insertSql = InsertStatement("master_district", "md_", [
    "store_number",
    "store_name",
    "region",
    "city_province",
    "status",
  ]);
  const syncedStoreNumbers = [];

  for (const districtRecord of districtRecordsByStoreNumber.values()) {
    const insertData = [
      [
        districtRecord.store_number,
        districtRecord.store_name,
        districtRecord.region,
        districtRecord.city_province,
        districtRecord.status,
      ],
    ];

    await Insert(insertSql, insertData);
    syncedStoreNumbers.push(districtRecord.store_number);
  }

  return {
    totalSynced: syncedStoreNumbers.length,
    skippedDuplicates,
    syncedStoreNumbers,
    status,
    limit: safeLimit,
  };
}

/* GET district page. */
router.get("/", function (req, res, next) {
  res.render("district", { title: "Express" });
});

module.exports = router;

router.post("/sync_slink_stores", async (req, res) => {
  try {
    const { status = "ACTIVE", limit = 500 } = req.body || {};

    const safeLimit = normalizeSyncLimit(limit, 500);

    const syncResult = await syncDistrictFromSlinkStores({
      status,
      limit: safeLimit,
    });

    return res.status(200).json(
      JsonResponseSuccess({
        message: "District sync from Slink completed successfully.",
        ...syncResult,
      }),
    );
  } catch (error) {
    console.error(
      "Error syncing district from Slink:",
      error.response?.data || error.message,
    );
    return res
      .status(error.statusCode || 500)
      .json(JsonResposeError(error.message));
  }
});

router.get("/sync_slink_stores", async (req, res) => {
  try {
    const { status = "ACTIVE", limit = 500 } = req.query;

    const safeLimit = normalizeSyncLimit(limit, 500);

    const syncResult = await syncDistrictFromSlinkStores({
      status,
      limit: safeLimit,
    });

    return res.status(200).json(
      JsonResponseSuccess({
        message: "District sync from Slink completed successfully.",
        ...syncResult,
      }),
    );
  } catch (error) {
    console.error(
      "Error syncing district from Slink:",
      error.response?.data || error.message,
    );
    return res
      .status(error.statusCode || 500)
      .json(JsonResposeError(error.message));
  }
});

router.get("/getdistrict", async (req, res) => {
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
                                `,
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

router.get("/getdistrict_by_search", async (req, res) => {
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
          [
            `%${search.replace(/'/g, "\\'")}%`,
            `%${search.replace(/'/g, "\\'")}%`,
            `%${search.replace(/'/g, "\\'")}%`,
          ],
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
           LIMIT 10`,
        );
      }

      let result = await Select(select_district_sql);
      console.log("Result:", result);
      return res.status(200).json(result);
    }

    await ProcessData();
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json(JsonResposeError(error));
  }
});

router.get("/getdistrict_by_id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "District ID is required" });
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
                                `,
        [id],
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

router.post("/create_district", async (req, res) => {
  try {
    async function ProcessData() {
      const { store_number, store_name, city_province } = req.body;
      let data = [[store_number, store_name, city_province, "ACTIVE"]];

      let insert_sql = InsertStatement(
        Masters.master_district.tablename,
        Masters.master_district.prefix,
        Masters.master_district.insertColumns,
      );

      let districtResult = await Insert(insert_sql, data);

      return res.status(200).json(
        JsonResponseSuccess({
          message: "District created successfully.",
          district: districtResult,
        }),
      );
    }

    await ProcessData();
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json(JsonResposeError(error));
  }
});

router.put("/update_district", async (req, res) => {
  try {
    async function ProcessData() {
      const { id, store_number, store_name, city_province, status } = req.body;
      let data = [];
      let set_columns = [];

      if (store_number) {
        set_columns.push(
          Masters.master_district.selectOptionsColumn.store_number,
        );
        data.push(store_number);
      }
      if (store_name) {
        set_columns.push(
          Masters.master_district.selectOptionsColumn.store_name,
        );
        data.push(store_name);
      }
      if (city_province) {
        set_columns.push(
          Masters.master_district.selectOptionsColumn.city_province,
        );
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
        [Masters.master_district.selectOptionsColumn.id],
      );
      await Update(update_sql, [data]);

      return res.status(200).json(
        JsonResponseSuccess({
          message: "District updated successfully.",
        }),
      );
    }

    await ProcessData();
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json(JsonResposeError(error));
  }
});

router.post(
  "/createdistrict_excel",
  upload.single("file"),
  async (req, res) => {
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

      const requiredCols = [
        "STORE NO",
        "STORE NAME",
        "REGION",
        "CITY PROVINCE",
        "STATUS",
      ];
      for (const col of requiredCols) {
        if (!headers[col]) {
          return res
            .status(400)
            .json(JsonResposeError(`Missing column: ${col}`));
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
        const insert_data = [
          [store_no, store_name, region, city_province, status],
        ];
        const insert_sql = InsertStatement("master_district", "md_", [
          "store_number",
          "store_name",
          "region",
          "city_province",
          "status",
        ]);

        await Insert(insert_sql, insert_data);

        importedRows.push({
          store_no,
          store_name,
          region,
          city_province,
          status,
        });
      }

      res.status(200).json(
        JsonResponseSuccess({
          message: `${importedRows.length} store records successfully imported.`,
          imported: importedRows,
        }),
      );
    } catch (error) {
      console.error(error);
      res.status(500).json(JsonResposeError(error));
    }
  },
);
// Download sample template for district import
router.get("/download_template", async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("District Template");

    // Add headers
    const headers = [
      "STORE NO",
      "STORE NAME",
      "REGION",
      "CITY PROVINCE",
      "STATUS",
    ];
    worksheet.addRow(headers);

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF366092" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    // Add sample data
    const sampleData = [
      ["1001", "MAIN STORE", "REGION 1", "METRO MANILA", "ACTIVE"],
      ["1002", "BRANCH STORE", "REGION 2", "CEBU", "ACTIVE"],
      ["1003", "SATELLITE STORE", "REGION 3", "DAGUPAN", "ACTIVE"],
    ];

    sampleData.forEach((row, index) => {
      worksheet.addRow(row);
      const dataRow = worksheet.getRow(index + 2);
      dataRow.alignment = { horizontal: "left", vertical: "middle" };
    });

    // Auto-fit column widths
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = maxLength + 2;
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="District_Import_Template.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json(JsonResposeError(error));
  }
});
