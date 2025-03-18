import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "./card";
import axios from "axios";
import { Button } from "./button";
import { NotificationDropdown } from "./NotificationDropdown";
import { User, PlusCircle, Trash } from "lucide-react";

export default function App() {
  const [notifications, setNotifications] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [limit, setLimit] = useState(10);
  const [timeFrame, setTimeFrame] = useState("24h");
  const [logType, setLogType] = useState("all");
  const [apps, setApps] = useState([]);
  const [newApp, setNewApp] = useState("");
  const [logs, setLogs] = useState([]);
  const dropdownRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    try {
      const defaultApp = selectedApp.toLowerCase() || apps[0]?.service_id || "";
      const logTypeParam = logType === "all" ? "" : logType;
      const url = `http://localhost:5000/logs`;

      const res = await axios.get(url, {
        params: {
          limit: limit,
          service_id: defaultApp,
          level: logTypeParam,
          timeFrame: timeFrame,
        },
      });

      setLogs(res.data);
      console.log("Logs fetched:", res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }, [selectedApp, logType, limit, timeFrame, apps]);

  useEffect(() => {
    fetchLogs(); // Initial fetch
    const interval = setInterval(fetchLogs, 5000);

    return () => clearInterval(interval);
  }, [fetchLogs]);

  useEffect(() => {
    axios.get("http://localhost:5000/apps").then((response) => {
      setApps(response.data.filter((app) => !app.deleted));
    });
  }, []);

  // Add app in sidebar
  const addApp = () => {
    try {
      if (newApp.trim()) {
        axios
          .post("http://localhost:5000/apps", { service_id: newApp.trim() })
          .then((res) => {
            setApps([...apps, res.data]);
            setNewApp("");
            setSelectedApp(res.data.service_id);
          });
      }
    } catch (error) {
      console.error("Error adding app:", error);
    }
  };
  // remove app in sidebar
  const removeApp = async (serviceId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/apps/${serviceId}`
      );
      setApps(response.data.apps);
      setSelectedApp(
        response.data.apps.length > 0 ? response.data.apps[0].service_id : ""
      );
    } catch (error) {
      console.error("Error removing app:", error);
    }
  };

  useEffect(() => {
    if (apps.length === 0) {
      setSelectedApp("");
      setNotifications([]);
      return;
    }

    const errorLogs = logs.filter(
      (log) =>
        log.level === "error" &&
        apps.some(
          (app) => log.service_id.toLowerCase() === app.service_id.toLowerCase()
        )
    );
    setNotifications(errorLogs);
  }, [apps, logs]);

  const defaultApp = selectedApp.toLowerCase() || apps[0]?.service_id || "";
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-100 text-gray-900 p-4 space-y-4 rounded-r-lg shadow-lg border-r border-gray-300">
        <h2 className="text-xl font-bold border-b border-gray-400 pb-2">
          Applications
        </h2>
        <div className="space-y-2">
          {apps.map((app) => (
            <div
              key={app.service_id}
              className="flex font-bold items-center justify-between bg-white hover:bg-gray-200 p-3 rounded-lg shadow-sm"
            >
              <Button
                variant="ghost"
                className="w-full text-left"
                onClick={() => setSelectedApp(app.service_id)}
              >
                {app.service_id}
              </Button>
              <button
                onClick={() => removeApp(app.service_id)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center mt-4">
          <input
            type="text"
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
            placeholder="New App Name"
            className="flex-1 p-2 border rounded-md w-4"
          />
          <button
            onClick={addApp}
            className="ml-2 text-green-500 hover:text-green-700"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 space-y-4">
        {/* Top Menu */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100 p-4 rounded-md shadow border border-gray-300">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
            <label className="flex items-center">
              Limit:
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="ml-2 p-1 border rounded-md w-20"
              />
            </label>
            <label className="flex items-center">
              Time Frame:
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="ml-2 p-1 border rounded-md"
              >
                <option value="10m">Last 10 Min </option>
                <option value="30m">Last 30 Min </option>
                <option value="1h">Last 1 Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </label>
            <label className="flex items-center">
              Log Type:
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className="ml-2 p-1 border rounded-md"
              >
                <option value="all">ALL</option>
                <option value="info">INFO</option>
                <option value="error">ERROR</option>
                <option value="warning">WARNING</option>
              </select>
            </label>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationDropdown
              notifications={notifications}
              setNotifications={setNotifications}
            />
            <User className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        <h1 className="text-2xl font-bold">
          LOGS APPLICATION :{" "}
          {!selectedApp || defaultApp ? `- ${selectedApp || defaultApp}` : ""}
        </h1>

        {/* Logs Section */}
        {apps.length > 0 ? (
          <Card className="p-6 bg-gray-50 rounded-md shadow-lg border border-gray-300">
            <h2 className="text-lg font-bold text-gray-700 mb-3">LOGS</h2>
            <div
              className={`space-y-2 ${
                logs.length > 8 ? "overflow-y-auto max-h-64" : ""
              }`}
              ref={dropdownRef}
            >
              {logs.map((log) => (
                <p
                  key={log.id}
                  className={`p-2 rounded-md ${
                    log.level === "error" ? " text-red-700" : " text-black-700"
                  } ${log.level === "warning" ? "text-yellow-700" : ""}`}
                >
                  <strong>{log.level.toUpperCase()}</strong>
                  <span> | </span>
                  <span className="font-medium text-sm">{log.time}</span>
                  <span> | </span>
                  <span className="font-medium text-sm">{log.message}</span>
                </p>
              ))}
            </div>
          </Card>
        ) : (
          <p className="text-center text-gray-500">No applications added.</p>
        )}
      </div>
    </div>
  );
}
