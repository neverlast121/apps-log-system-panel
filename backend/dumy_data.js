const axios = require("axios");

axios
  .post("http://localhost:5000/logs", [
    {
      service_id: "Test App",
      message: "User logged in",
      level: "info",
      time: new Date().toISOString(),
    },
    {
      service_id: "Test App",
      message: "Transaction failed",
      level: "error",
      time: new Date().toISOString(),
    },
    {
      service_id: "Test App",
      message: "Rate limit exceeded",
      level: "warning",
      time: new Date().toISOString(),
    },

    {
      service_id: "Test App",
      message: "New entry added for test",
      level: "info",
      time: new Date().toISOString(),
    },
    {
      service_id: "Test App",
      message: "Payment processed for test have issue",
      level: "info",
      time: new Date().toISOString(),
    },
  ])
  .then((response) => console.log("Logs added:", response.data))
  .catch((error) => console.error("Error:", error));
