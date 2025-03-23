const { Sequelize } = require("sequelize");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false, // Disable SQL logging in console
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Connected to PostgreSQL database."))
  .catch((err) => console.error("Unable to connect to DB:", err));

module.exports = sequelize;
