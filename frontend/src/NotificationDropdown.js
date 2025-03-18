import { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";

export function NotificationDropdown({ notifications, setNotifications }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const showScroll = notifications.length > 5;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const removeNotification = (index) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
          <div
            className={`${showScroll ? "max-h-64 overflow-y-auto" : ""} p-2`}
          >
            {notifications.length === 0 ? (
              <p className="text-gray-500 p-2 text-sm">No new notifications</p>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className="p-2 border-b last:border-none flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {notification.service_id.toUpperCase()}
                    </p>
                    <p className="text-sm font-medium text-red-500">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                  <button
                    onClick={() => removeNotification(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
