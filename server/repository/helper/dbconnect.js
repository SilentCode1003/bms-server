const { query } = require("express");
const { createPool } = require("mysql2");
const { EncrypterString, DecrypterString } = require("./crytography");
require("dotenv").config();

console.log(DecrypterString("08cc3cf75d6891c1dc0cb6c94111381f"));

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: DecrypterString(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 30,
  waitForConnections: true,
  queueLimit: 0,
});

exports.CheckConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log("Error connecting to the database:", err);
        reject(err);
      } else {
        console.log("Connected to the database!");
        connection.release();
        resolve(true);
      }
    });
  });
};

exports.Select = (query) => {
  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        console.log("Error running query:", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.Update = (query, data) => {
  return new Promise((resolve, reject) => {
    const flatData = Array.isArray(data[0]) ? data[0] : data;

    pool.query(query, flatData, (err, result) => {
      if (err) {
        console.log("Error running query:", err);
        console.log("Query:", query);
        console.log("Data:", flatData);
        reject(err);
      } else {
        resolve(result.affectedRows);
      }
    });
  });
};

exports.Insert = (query, data) => {
  return new Promise((resolve, reject) => {
    pool.query(query, [data], (err, result) => {
      if (err) {
        console.log("Error running query:", err);
        reject(err);
      } else {
        resolve([{ rows: result.affectedRows, id: result.insertId }]);
      }
    });
  });
};

exports.Delete = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const flatParams = Array.isArray(params[0]) ? params[0] : params;

    pool.query(query, flatParams, (err, result) => {
      if (err) {
        console.log("Error running query:", err);
        console.log("Query:", query);
        console.log("Params:", flatParams);
        reject(err);
      } else {
        resolve(result.affectedRows);
      }
    });
  });
};

exports.pool = pool;
