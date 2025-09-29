const mysql = require('mysql2/promise');
const { execSync } = require('child_process');
require('dotenv').config();
const { DecrypterString } = require('../helper/crytography');

(async () => {
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPass = DecrypterString(process.env.DB_PASSWORD);
  const dbHost = process.env.DB_HOST;

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPass,
    });

    const [rows] = await connection.query(`SHOW DATABASES LIKE ?`, [dbName]);

    if (rows.length === 0) {
      await connection.query(`CREATE DATABASE \`${dbName}\`;`);
      console.log(`✅ Database '${dbName}' created.`);
    } else {
      console.log(`⚠️ Database '${dbName}' already exists.`);
    }

    await connection.end();

    console.log(`📦 Running migrations...`);
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });

    console.log(`🌱 Running seeders...`);
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });

    console.log(`✅ Database setup complete.`);
  } catch (error) {
    console.error('❌ Error during DB setup:', error);
  }
})();
