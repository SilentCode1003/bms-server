const { query } = require("express");
const { createPool } = require("mysql2/promise");
const { EncrypterString, DecrypterString } = require("./crytography");
require("dotenv").config();

console.log(DecrypterString("6a77dbbee81cec62da79b87d2f2c5e82"));


// Create a connection pool instead of a single connection
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: DecrypterString(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

// Get a connection from the pool
exports.getConnection = async () => {
  return await pool.getConnection();
};

exports.CheckConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log("Connected to the database!");
    return true;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// Transaction methods
exports.beginTransaction = async () => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

exports.commitTransaction = async (connection) => {
  try {
    await connection.commit();
  } finally {
    connection.release();
  }
};

exports.rollbackTransaction = async (connection) => {
  try {
    await connection.rollback();
  } finally {
    connection.release();
  }
};

exports.Select = async (query, params = []) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error in Select:', error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.Update = async (query, data) => {
  const connection = await pool.getConnection();
  try {
    const flatData = Array.isArray(data[0]) ? data[0] : data;
    const [result] = await connection.query(query, flatData);
    return result.affectedRows;
  } catch (error) {
    console.error('Error in Update:', error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.Insert = async (query, data) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(query, [data]);
    return { rows: result.affectedRows, id: result.insertId };
  } catch (error) {
    console.error('Error in Insert:', error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.Delete = async (query, params = []) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(query, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Error in Delete:', error);
    throw error;
  } finally {
    connection.release();
  }
};
