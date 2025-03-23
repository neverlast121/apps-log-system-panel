const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const bcrypt = require("bcryptjs");

const Log = sequelize.define("Log", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  service_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: DataTypes.STRING,
  level: DataTypes.STRING,
  time: DataTypes.STRING,
});

const App = sequelize.define("App", {
  service_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const Account = sequelize.define(
  "Account",
  {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (account) => {
        const salt = await bcrypt.genSalt(10);
        account.password = await bcrypt.hash(account.password, salt);
      },
      beforeUpdate: async (account) => {
        if (account.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          account.password = await bcrypt.hash(account.password, salt);
        }
      },
    },
  }
);
// Define associations
App.hasMany(Log, { foreignKey: "service_id", sourceKey: "service_id" });
Log.belongsTo(App, { foreignKey: "service_id", targetKey: "service_id" });

// Hook to ensure `App` exists before creating a `Log`
Log.beforeCreate(async (log, options) => {
  await ensureAppExists(log.service_id);
});

Log.beforeBulkCreate(async (logs, options) => {
  const serviceIds = [...new Set(logs.map((log) => log.service_id))]; // Get unique service IDs
  await Promise.all(
    serviceIds.map((service_id) => ensureAppExists(service_id))
  );
});

// Utility function to check and create App if needed
async function ensureAppExists(service_id) {
  const appExists = await App.findOne({ where: { service_id } });
  if (!appExists) {
    await App.create({ service_id });
  }
}

module.exports = { Log, App, Account };
