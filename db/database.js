const Sequelize = require("sequelize");
require('dotenv').config(); // .env унших

const sequelize = new Sequelize(
  process.env.DB_NAME,      // 'control_dash'
  process.env.DB_USER,      // 'root'
  process.env.DB_PASSWORD,  // '1234'
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;