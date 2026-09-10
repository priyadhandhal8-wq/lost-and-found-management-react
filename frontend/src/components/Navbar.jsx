import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] =
    useState(false);

  const notificationRef = useRef(null);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );
    }
  };

  // ==========================================
  // FETCH UNREAD COUNT
  // ==========================================

  const fetchUnreadCount = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications/unread-count",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error(
        "Unread count error:",
        error
      );
    }
  };

  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  // ==========================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================
  // MARK SINGLE NOTIFICATION AS READ
  // ==========================================

  const markAsRead = async (notificationId) => {
    const currentToken =
      localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const markAllAsRead = async () => {
    const currentToken =
      localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  };

  // ==========================================
  // NOTIFICATION CLICK
  // ==========================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setShowNotifications(false);

    // CONTACT REQUEST
    if (
      notification.type ===
      "CONTACT_REQUEST"
    ) {
      navigate("/dashboard", {
        state: {
          notificationType:
            "CONTACT_REQUEST",
          claimId:
            notification.relatedClaim?._id,
        },
      });

      return;
    }

    // CONTACT SHARED
    if (
      notification.type ===
      "CONTACT_SHARED"
    ) {
      navigate("/dashboard", {
        state: {
          notificationType:
            "CONTACT_SHARED",
          claimId:
            notification.relatedClaim?._id,
        },
      });

      return;
    }

    // CONTACT DECLINED
    if (
      notification.type ===
      "CONTACT_DECLINED"
    ) {
      navigate("/dashboard", {
        state: {
          notificationType:
            "CONTACT_DECLINED",
          claimId:
            notification.relatedClaim?._id,
        },
      });

      return;
    }

    // NEW CLAIM
    if (
      notification.type ===
      "NEW_CLAIM"
    ) {
      navigate("/dashboard", {
        state: {
          notificationType:
            "NEW_CLAIM",
          claimId:
            notification.relatedClaim?._id,
        },
      });

      return;
    }

    // CLAIM APPROVED
    if (
      notification.type ===
      "CLAIM_APPROVED"
    ) {
      navigate("/dashboard", {
        state: {
          notificationType:
            "CLAIM_APPROVED",
          claimId:
            notification.relatedClaim?._id,
        },
      });

      return;
    }

    // CLAIM REJECTED
    if (
      notification.type ===
      "CLAIM_REJECTED"
    ) {
      navigate("/dashboard", {
        state: {
          notificationType:
            "CLAIM_REJECTED",
          claimId:
            notification.relatedClaim?._id,
        },
      });

      return;
    }

    // OTHER NOTIFICATIONS
    if (notification.relatedItem?._id) {
      navigate(
        `/items/${notification.relatedItem._id}`
      );
    }
  };

  // ==========================================
  // TIME FORMAT
  // ==========================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);
    const now = new Date();

    const difference = Math.floor(
      (now - notificationDate) / 1000
    );

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      return `${Math.floor(
        difference / 60
      )} min ago`;
    }

    if (difference < 86400) {
      return `${Math.floor(
        difference / 3600
      )} hr ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <nav className="navbar">

      {/* LOGO */}

      <div className="logo">
        Lost & Found
      </div>

      {/* NAV LINKS */}

      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/items">
          Items
        </Link>

        {token ? (
          <>
            {/* DASHBOARD */}

            <Link to="/dashboard">
              Dashboard
            </Link>

            {/* MY ITEMS */}

            <Link to="/my-items">
              My Items
            </Link>

            {/* SETTINGS */}

            <Link to="/settings">
              Settings
            </Link>

            {/* NOTIFICATIONS */}

            <div
              className="notification-wrapper"
              ref={notificationRef}
            >

              <button
                className="notification-button"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
                aria-label="Notifications"
              >
                🔔

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}

              {showNotifications && (
                <div className="notification-dropdown">

                  {/* HEADER */}

                  <div className="notification-header">

                    <h3>
                      Notifications
                    </h3>

                    {unreadCount > 0 && (
                      <button
                        className="mark-all-btn"
                        onClick={
                          markAllAsRead
                        }
                      >
                        Mark all as read
                      </button>
                    )}

                  </div>

                  {/* NO NOTIFICATIONS */}

                  {notifications.length === 0 ? (
                    <div className="no-notifications">

                      <div className="empty-bell">
                        🔕
                      </div>

                      <p>
                        No notifications
                      </p>

                    </div>
                  ) : (

                    /* NOTIFICATION LIST */

                    <div className="notification-list">

                      {notifications.map(
                        (notification) => (

                          <div
                            key={
                              notification._id
                            }
                            className={`notification-item ${
                              !notification.isRead
                                ? "unread"
                                : ""
                            }`}
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                          >

                            {/* ICON */}

                            <div className="notification-icon">

                              {notification.type ===
                              "NEW_CLAIM"
                                ? "📩"
                                : notification.type ===
                                  "CLAIM_APPROVED"
                                ? "✅"
                                : notification.type ===
                                  "CLAIM_REJECTED"
                                ? "❌"
                                : "🔔"}

                            </div>

                            {/* CONTENT */}

                            <div className="notification-content">

                              <h4>
                                {
                                  notification.title
                                }
                              </h4>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <span>
                                {formatTime(
                                  notification.createdAt
                                )}
                              </span>

                            </div>

                            {/* UNREAD DOT */}

                            {!notification.isRead && (
                              <span className="unread-dot">
                                •
                              </span>
                            )}

                          </div>

                        )
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* USER NAME REMOVED */}

          </>
        ) : (

          /* LOGGED OUT */

          <>
            <Link to="/login">
              Login
            </Link>

            <Link
              to="/register"
              className="register-btn"
            >
              Register
            </Link>

            <Link
              to="/admin/login"
              className="admin-login-btn"
            >
              Admin
            </Link>
          </>

        )}

      </div>

    </nav>
  );
}

export default Navbar;