const { DecrypterString } = require("../repository/helper/crytography");

require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: DecrypterString(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    pool: {
      max: 30,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER,
    password: DecrypterString(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    pool: {
      max: 30,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: DecrypterString(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    pool: {
      max: 30,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
};
