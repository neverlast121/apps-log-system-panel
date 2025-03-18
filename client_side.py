import requests
from datetime import datetime

# Define the base URL for the server
BASE_URL = "http://localhost:5000"

'''
 * Function to add a log entry to the server
 * @param {string} app_name - The name of the application
 * @param {string} event_msg - The log message
 * @param {string} event_level - The log level (e.g., "info", "error", "warning")
 '''

def AddLog(app_name, event_msg, event_level):
    try:
        # Create a new log object with the provided parameters
        new_log = {
            "service_id": app_name,
            "message": event_msg,
            "level": event_level,
            "time": (datetime.utcnow().isoformat()+'Z')
        }

        # Send a POST request to the server to add the new log
        response = requests.post(f"{BASE_URL}/log", json=new_log)

        # Check if the request was successful
        if response.status_code == 200:
            print("Log added successfully:", response.status_code)
    except Exception as e:
        print("Error adding log:", str(e))

# Example usage
if __name__ == "__main__":
    AddLog("Auth Service", "User logged in", "info")
