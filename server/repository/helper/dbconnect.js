const { query } = require("express");
const { createConnection } = require("mysql2");
const { EncrypterString, DecrypterString } = require("./crytography");
require("dotenv").config();

console.log(EncrypterString("#Ebedaf19dd0d"));


const connection = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: DecrypterString(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

exports.CheckConnection = () => {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.log("Error connecting to the database:", err);
        reject(err);
      } else {
        console.log("Connected to the database!");
        resolve(true);
      }
    });
  });
};

exports.Select = (query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, result) => {
      if (err) {
        console.log("Error running query:", err);
        reject(err);
      } else {
        // console.log("Query executed successfully:", result);
        resolve(result);
      }
    });
  });
};

exports.Update = (query, data) => {
  return new Promise((resolve, reject) => {
    // Flatten the data array if it's nested
    const flatData = Array.isArray(data[0]) ? data[0] : data;
    
    connection.query(query, flatData, (err, result) => {
      if (err) {
        console.log("Error running query:", err);
        console.log("Query:", query);
        console.log("Data:", flatData);
        reject(err);
      } else {
        //console.log("Query executed successfully:", result);
        resolve(result.affectedRows);
      }
    });
  });
};

exports.Insert = (query, data) => {
  return new Promise((resolve, reject) => {
    connection.query(query, [data], (err, result) => {
      if (err) {
        console.log("Error running query:", err);
        reject(err);
      } else {
        //console.log("Query executed successfully:", result);
        resolve([{ rows: result.affectedRows, id: result.insertId }]);
      }
    });
  });
};

exports.Delete = (query, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, result) => {
      if (err) {
        console.log("Error running delete query:", err);
        console.log("Query:", query);
        console.log("Params:", params);
        reject(err);
      } else {
        resolve(result.affectedRows);
      }
    });
  });
};
