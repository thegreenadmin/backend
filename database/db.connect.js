require("custom-env").env(true);

const { Sequelize } = require("sequelize");
const logger = require("./../logger/logger");

const sequelize = new Sequelize(process.env.DB_URL + "?timezone=+00:00", {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
}); // Example for postgres

global["sequelize"] = sequelize;

const syncTables = require("./table.sync");
const createData = require("./create.data");

async function connect() {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    await syncTables();
    console.log("Database models have been synced successfully.");
    await createData();
    console.log("All default data have been created successfully.");
  } catch (error) {
    console.log("Unable to connect to the database: ", error);
    logger.err("Unable to connect to the database: ", error);
  }
}

module.exports = { connect };
