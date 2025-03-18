const express = require("express");
const cors = require("cors");
const sequelize = require("./index");
const { Log, App } = require("./models");
const http = require("http");
const { Server } = require("socket.io");
const { Op, Sequelize } = require("sequelize");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Sync database
sequelize.sync({ alter: true }).then(() => console.log("Database synced."));

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Async function to generate the time condition
const getTimeCondition = async (timeFrame) => {
  if (!timeFrame) return null;

  switch (timeFrame) {
    case "10m":
      return Sequelize.literal(
        `CAST("time" AS TIMESTAMP) >= NOW() - INTERVAL '10 minutes'`
      );
    case "30m":
      return Sequelize.literal(
        `CAST("time" AS TIMESTAMP) >= NOW() - INTERVAL '30 minutes'`
      );
    case "1h":
      return Sequelize.literal(
        `CAST("time" AS TIMESTAMP) >= NOW() - INTERVAL '1 hour'`
      );
    case "24h":
      return Sequelize.literal(
        `CAST("time" AS TIMESTAMP) >= NOW() - INTERVAL '24 hours'`
      );
    case "7d":
      return Sequelize.literal(
        `CAST("time" AS TIMESTAMP) >= NOW() - INTERVAL '7 days'`
      );
    default:
      return null;
  }
};

// Get all logs
app.get("/logs", async (req, res) => {
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

// Add a logs manually
app.post("/log", async (req, res) => {
  try {
    const { service_id, message, level, time } = req.body;
    if (!service_id || !message || !level || !time)
      return res.status(400).json({ error: "All fields are required" });

    const newLog = await Log.create({ service_id, message, level, time });

    io.emit("new_log", newLog);

    res.json({ message: "Log added successfully", log: newLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/logs", async (req, res) => {
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

    io.emit("new_log", newLogs);

    res.json({ message: "Logs added successfully", log: newLogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all applications
app.get("/apps", async (req, res) => {
  try {
    const apps = await App.findAll();
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/apps", async (req, res) => {
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
app.post("/apps/:server_id", async (req, res) => {
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
