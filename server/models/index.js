
const dbConfig = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: process.env.NODE_ENV !== 'production'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Define models
db.customers = require("./customer.model.js")(sequelize, DataTypes);
db.products = require("./product.model.js")(sequelize, DataTypes);
db.productVersions = require("./productVersion.model.js")(sequelize, DataTypes);
db.licenses = require("./license.model.js")(sequelize, DataTypes);
db.licenseVerificationLogs = require("./licenseVerificationLog.model.js")(sequelize, DataTypes);
db.licenseAllowedCountries = require("./licenseAllowedCountry.model.js")(sequelize, DataTypes);
db.licenseMacAddresses = require("./licenseMacAddress.model.js")(sequelize, DataTypes);
db.users = require("./user.model.js")(sequelize, DataTypes);

// Define relationships
db.products.hasMany(db.productVersions, { as: "versions", foreignKey: "product_id" });
db.productVersions.belongsTo(db.products, { foreignKey: "product_id" });

db.customers.hasMany(db.licenses, { as: "licenses", foreignKey: "customer_id" });
db.licenses.belongsTo(db.customers, { foreignKey: "customer_id" });

db.products.hasMany(db.licenses, { as: "licenses", foreignKey: "product_id" });
db.licenses.belongsTo(db.products, { foreignKey: "product_id" });

db.productVersions.hasMany(db.licenses, { as: "licenses", foreignKey: "product_version_id" });
db.licenses.belongsTo(db.productVersions, { foreignKey: "product_version_id" });

db.licenses.hasMany(db.licenseVerificationLogs, { as: "verification_logs", foreignKey: "license_id" });
db.licenseVerificationLogs.belongsTo(db.licenses, { foreignKey: "license_id" });

db.licenses.hasMany(db.licenseAllowedCountries, { as: "allowed_countries", foreignKey: "license_id" });
db.licenseAllowedCountries.belongsTo(db.licenses, { foreignKey: "license_id" });

db.licenses.hasMany(db.licenseMacAddresses, { as: "mac_addresses", foreignKey: "license_id" });
db.licenseMacAddresses.belongsTo(db.licenses, { foreignKey: "license_id" });

module.exports = db;
