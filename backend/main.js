const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const { Log, App, Account } = require("./models");
const { Op, Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { path } = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.FRONTEND_LOCAL,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SECRET_KEY = process.env.JWT_SECRET_KEY;

sequelize.sync({ alter: true }).then(() => console.log("Database synced."));

// Async function to generate the time condition
const getTimeCondition = async (timeFrame) => {
  if (!timeFrame) return null;

  const timeMap = {
    "10m": "10 minutes",
    "30m": "30 minutes",
    "1h": "1 hour",
    "24h": "24 hours",
    "7d": "7 days",
  };
  return timeMap[timeFrame]
    ? Sequelize.literal(
        `CAST("time" AS TIMESTAMP) >= NOW() - INTERVAL '${timeMap[timeFrame]}'`
      )
    : null;
};

// Jwt Middleware
const VerifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid Token" });
  }
};

// Register User
app.post("/v1/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });
    const userExists = await Account.findOne({ where: { email } });
    if (userExists)
      return res.status(400).json({ error: "Email already exists" });

    const newUser = await Account.create({
      username,
      email,
      password,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//User Login
app.post("/v1/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const user = await Account.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credenitails" });

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// reset the password
app.post("/v1/reset-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword)
      return res.status(400).json({ error: "All fields are required" });

    const user = await Account.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({ password: newPassword });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all logs
app.get("/v1/logs", VerifyToken, async (req, res) => {
  try {
    const { limit, service_id, level, timeFrame } = req.query; // Accept limit, service_id, and level from query params

    // Set a default limit if not provided
    const logsLimit = limit ? parseInt(limit) : 50; // Default to 50 if no limit is passed

    const whereConditions = {};

    // Optionally filter by service_id if provided
    if (service_id) {
      whereConditions.service_id = { [Op.iLike]: `%${service_id}%` }; // Case-insensitive search
    }

    // Optionally filter by level if provided
    if (level && level !== "all") {
      whereConditions.level = level;
    }

    // Optionally filter by time if provided
    const timeCondition = await getTimeCondition(timeFrame);
    if (timeCondition) {
      whereConditions[Op.and] = [timeCondition];
    }
    // Fetch logs with limit and filter conditions
    const logs = await Log.findAll({
      where: whereConditions,
      limit: logsLimit,
      order: [["time", "DESC"]], // Order by time in descending order to show newest logs first
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a log manually
app.post("/v1/log", VerifyToken, async (req, res) => {
  try {
    const { service_id, message, level, time } = req.body;
    if (!service_id || !message || !level || !time)
      return res.status(400).json({ error: "All fields are required" });

    const newLog = await Log.create({ service_id, message, level, time });

    res.json({ message: "Log added successfully", log: newLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// post list of logs to save to db
app.post("/v1/logs", VerifyToken, async (req, res) => {
  try {
    const logs = req.body; // Expecting an array of logs
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: "Logs must be a non-empty array" });
    }
    // Validate each log entry
    for (const log of logs) {
      if (!log.service_id || !log.message || !log.level || !log.time) {
        return res
          .status(400)
          .json({ error: "All fields are required for each log" });
      }
    }
    // Insert all logs in bulk
    const newLogs = await Log.bulkCreate(logs);
    res.json({ message: "Logs added successfully", log: newLogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all apps
app.get("/v1/apps", VerifyToken, async (req, res) => {
  try {
    const apps = await App.findAll();
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// create app or update
app.post("/v1/add-app", VerifyToken, async (req, res) => {
  try {
    const { service_id } = req.body;

    if (!service_id) {
      return res.status(400).json({ error: "App name is required" });
    }

    // Check if app already exists
    let existingApp = await App.findOne({ where: { service_id } });

    if (existingApp) {
      // If found, update `deleted` to false
      existingApp.deleted = false;
      await existingApp.save();
      return res.json(existingApp);
    }

    // If not found, create a new app
    const newApp = await App.create({ service_id, deleted: false });

    res.json(newApp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove an application
app.post("/v1/delete-app/:server_id", VerifyToken, async (req, res) => {
  try {
    // Ensure the requested app exists before updating
    const appToDelete = await App.findOne({
      where: { service_id: req.params.server_id },
    });

    if (!appToDelete) {
      return res.status(404).json({ error: "App not found" });
    }

    // Perform soft delete
    await App.update(
      { deleted: true },
      { where: { service_id: req.params.server_id } }
    );

    // Fetch updated list of non-deleted apps
    const activeApps = await App.findAll({ where: { deleted: false } });

    res.json({
      message: "App deleted successfully",
      apps: activeApps, // Send updated app list back to the frontend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => console.log(`Server running on port ${PORT}`));
