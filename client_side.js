const axios = require("axios");

// Define the base URL for the server
const BASE_URL = "http://localhost:5000";

/**
 * Function to add a log entry to the server
 * @param {string} app_name - The name of the application
 * @param {string} event_msg - The log message
 * @param {string} event_level - The log level (e.g., "info", "error", "warning")
 */
async function AddLog(app_name, event_msg, event_level) {
  try {
    // Create a new log object with the provided parameters
    const newLog = {
      service_id: app_name,
      message: event_msg,
      level: event_level,
      time: new Date().toISOString(),
    };

    // Send a POST request to the server to add the new log
    const response = await axios.post(`${BASE_URL}/log`, newLog);
  } catch (error) {
    console.error("Error adding log:", error.message);
  }
}

module.exports = { AddLog };
