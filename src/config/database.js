const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("task_manager", "admin", "admin123", {
  host: "db",
  dialect: "postgres",
});

module.exports = sequelize;
