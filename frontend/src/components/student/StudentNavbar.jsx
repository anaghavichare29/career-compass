import React, { useEffect, useState } from "react";
import api from "../../services/api";

const StudentNavbar = ({ pageTitle }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Guest";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "?";

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = () => {
    if (!user) return;
    api
      .get(`notifications/?user_id=${user.user_id}`)
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    if (!user) return;
    try {
      await api.post("notifications/read-all/", { user_id: user.user_id });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <header className="student-navbar" style={{ position: "relative" }}>
      <h3>{pageTitle}</h3>

      <div className="student-navbar-right">
        <div style={{ position: "relative" }}>
          <button
            className="student-notification"
            aria-label="Notifications"
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown) fetchNotifications();
            }}
          >
            🔔
            {unreadCount > 0 && <span className="notification-dot"></span>}
          </button>

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 10px)",
                width: "320px",
                maxHeight: "380px",
                overflowY: "auto",
                background: "#ffffff",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                zIndex: 1000,
                padding: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <strong style={{ fontSize: "0.95rem" }}>Notifications</strong>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6366f1",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "center", margin: "1rem 0" }}>
                  No notifications yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "0.6rem 0.75rem",
                        borderRadius: "8px",
                        background: n.isRead ? "#f8fafc" : "rgba(99, 102, 241, 0.06)",
                        borderLeft: n.isRead ? "3px solid #cbd5e1" : "3px solid #6366f1",
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e293b" }}>
                        {n.title}
                      </strong>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0" }}>
                        {n.message}
                      </p>
                      <small style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                        {n.createdAt}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="student-mini-profile">
          <div className="student-avatar">{initial}</div>

          <div className="student-mini-info">
            <strong>{fullName}</strong>
            <span>{user?.role === "STUDENT" ? "Student" : user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;