
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import API_URL from "../api";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  // ===============================
  // FETCH NOTIFICATIONS
  // ===============================
  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // ===============================
  // FETCH UNREAD COUNT
  // ===============================
  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // ===============================
  // LOAD USER + NOTIFICATIONS
  // ===============================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    try {
      setUser(storedUser ? JSON.parse(storedUser) : {});
    } catch {
      setUser({});
    }

    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [token]);

  // ===============================
  // CLOSE NOTIFICATION DROPDOWN
  // ===============================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ===============================
  // MARK NOTIFICATION AS READ
  // ===============================
  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ===============================
  // MARK ALL AS READ
  // ===============================
  const markAllAsRead = async () => {
    try {
      await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // ===============================
  // NOTIFICATION CLICK
  // ===============================
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    setShowNotifications(false);

    // Claim related notification
    if (
      notification.type === "NEW_CLAIM" ||
      notification.type === "CLAIM_APPROVED" ||
      notification.type === "CLAIM_REJECTED"
    ) {
      navigate("/my-claims");
      return;
    }

    // Item match notification
    if (notification.type === "ITEM_MATCH") {
      if (notification.item?._id) {
        navigate(`/items/${notification.item._id}`);
      } else {
        navigate("/items");
      }
      return;
    }

    // Default
    navigate("/notifications");
  };

  // ===============================
  // NAVBAR
  // ===============================
  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          Lost & Found
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="navbar-links">

          <Link to="/">Home</Link>

          <Link to="/items">Items</Link>

          {token && (
            <>
              <Link to="/report-lost">Report Lost</Link>
              <Link to="/report-found">Report Found</Link>
              <Link to="/dashboard">Dashboard</Link>
            </>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="navbar-right">

          {token ? (
            <>
              {/* NOTIFICATIONS */}
              <div
                className="notification-container"
                ref={notificationRef}
              >
                <button
                  className="notification-button"
                  onClick={() =>
                    setShowNotifications(!showNotifications)
                  }
                  type="button"
                >
                  🔔

                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notification-dropdown">

                    <div className="notification-header">
                      <h3>Notifications</h3>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        No notifications
                      </div>
                    ) : (
                      <div className="notification-list">

                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`notification-item ${
                              notification.read ? "read" : "unread"
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="notification-message">
                              {notification.message}
                            </div>

                            {notification.createdAt && (
                              <div className="notification-time">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ))}

                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* PROFILE */}
              <Link to="/profile" className="navbar-profile">
                👤
              </Link>

              {/* SETTINGS */}
              <Link to="/settings" className="navbar-settings">
                ⚙️
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-login">
                Login
              </Link>

              <Link to="/register" className="navbar-register">
                Register
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;

