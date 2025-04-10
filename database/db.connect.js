require("custom-env").env(true);

const { Sequelize } = require("sequelize");
const logger = require("./../logger/logger");

const sequelize = new Sequelize(
  process.env.DB_URL + "?timezone=+00:00",
  process.env.NODE_ENV != "staging"
    ? {
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: false,
            rejectUnauthorized: false,
          },
        },
        logging: false,
      }
    : { logging: false}
); // Example for postgres

global["sequelize"] = sequelize;

const syncTables = require("./table.sync");
const createData = require("./create.data");

async function connect() {
  try {
    await sequelize.authenticate();
    // logger.log('Connection has been established successfully.')
    console.log("Connection has been established successfully.");
    await syncTables();
    await createData();
  } catch (error) {
    console.log("Unable to connect to the databasez.",error);
     logger.err('Unable to connect to the database:', error);
  }
}

module.exports = { connect };
