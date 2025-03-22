import axios from 'axios';
import io from "socket.io-client";

const BASE_URL = "http://localhost:5000";

const socket = io(BASE_URL, {
  transports: ["websocket", "polling"],
});

// Test fetching all logs
async function testGetLogs() {
  try {
    const response = await axios.get(`${BASE_URL}/logs`, {
      params: {
        limit: 10,
        service_id: "Test App 2",
        level: "error",
        timeFrame: "1h",
      },
    });
    console.log("GET /logs response:", response.data);
  } catch (error) {
    console.error("Error fetching logs:", error.response.data);
  }
}

// Test adding a single log
async function testAddLog() {
  try {
    const newLog = {
      service_id: "Auth Service",
      message: "User logged in",
      level: "info",
      time: new Date().toISOString(),
    };
    const response = await axios.post(`${BASE_URL}/log`, newLog);
    console.log("POST /log response:", response.data);
  } catch (error) {
    console.error("Error adding log:", error.response.data);
  }
}

// Test adding multiple logs
async function testAddLogs() {
  try {
    const newLogs = [
      {
        service_id: "Payment Service",
        message: "Transaction failed",
        level: "error",
        time: new Date().toISOString(),
      },
      {
        service_id: "API Gateway",
        message: "Rate limit exceeded",
        level: "warning",
        time: new Date().toISOString(),
      },
    ];
    const response = await axios.post(`${BASE_URL}/logs`, newLogs);
    console.log("POST /logs response:", response.data);
  } catch (error) {
    console.error("Error adding logs:", error.response.data);
  }
}

// Test fetching realtime log.
async function setupSocketListener() {
  // Test fetching realtime log.
  socket.on("new_log", (log) => {
    console.log("realtime logs,", log);
  });

  return () => {
    socket.off("new_log");
  };
}
// Test fetching all applications
async function testGetApps() {
  try {
    const response = await axios.get(`${BASE_URL}/apps`);
    console.log("GET /apps response:", response.data);
  } catch (error) {
    console.error("Error fetching apps:", error.response.data);
  }
}

// Test adding a new application
async function testAddApp() {
  try {
    const newApp = { service_id: "New Service" };
    const response = await axios.post(`${BASE_URL}/apps`, newApp);
    console.log("POST /apps response:", response.data);
  } catch (error) {
    console.error("Error adding app:", error.response.data);
  }
}

// Test removing an application
async function testRemoveApp() {
  try {
    const service_id = "New Service";
    const response = await axios.post(`${BASE_URL}/apps/${service_id}`);
    console.log("POST /apps/:service_id response:", response.data);
  } catch (error) {
    console.error("Error removing app:", error.response.data);
  }
}

// Run all tests
async function runTests() {
  await testGetLogs();
  await testAddLog();
  await testAddLogs();
  await setupSocketListener();
  await testGetApps();
  await testAddApp();
  await testRemoveApp();
}

runTests();
