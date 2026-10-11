import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";

// How often to check for new notifications while the dropdown is closed.
const POLL_INTERVAL_MS = 30000;

const StudentNavbar = ({ pageTitle }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Guest";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "?";

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  // Ids that were unread when the dropdown was opened. Only these are highlighted;
  // everything is marked read as soon as it has been shown, so old notifications
  // never show up as "new" again.
  const [freshIds, setFreshIds] = useState(() => new Set());

  const wrapperRef = useRef(null);
  const showDropdownRef = useRef(false);
  showDropdownRef.current = showDropdown;

  const fetchNotifications = useCallback(async () => {
    if (!user) return [];
    try {
      const res = await api.get(`notifications/?user_id=${user.user_id}`);
      setNotifications(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to load notifications:", err);
      return null;
    }
  }, [user?.user_id]);

  // Initial load + light polling so new notifications appear without a page refresh.
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(() => {
      if (!showDropdownRef.current) fetchNotifications();
    }, POLL_INTERVAL_MS);
    const onFocus = () => {
      if (!showDropdownRef.current) fetchNotifications();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications]);

  // Close when clicking anywhere outside the bell/dropdown, or pressing Escape.
  useEffect(() => {
    if (!showDropdown) return undefined;

    const onPointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeDropdown();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showDropdown]);

  const closeDropdown = () => {
    setShowDropdown(false);
    setFreshIds(new Set());
  };

  const openDropdown = async () => {
    setShowDropdown(true);

    const latest = (await fetchNotifications()) || notifications;
    const unread = latest.filter((n) => !n.isRead);
    setFreshIds(new Set(unread.map((n) => n.id)));

    if (unread.length > 0 && user) {
      try {
        await api.post("notifications/read-all/", { user_id: user.user_id });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    }
  };

  const toggleDropdown = () => {
    if (showDropdown) closeDropdown();
    else openDropdown();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="student-navbar" style={{ position: "relative" }}>
      <h3>{pageTitle}</h3>

      <div className="student-navbar-right">
        <div style={{ position: "relative" }} ref={wrapperRef}>
          <button
            className="student-notification"
            aria-label="Notifications"
            aria-expanded={showDropdown}
            onClick={toggleDropdown}
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
                {freshIds.size > 0 && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#4f46e5",
                      background: "rgba(99, 102, 241, 0.1)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                    }}
                  >
                    {freshIds.size} new
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "center", margin: "1rem 0" }}>
                  No notifications yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {notifications.map((n) => {
                    const isNew = freshIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        style={{
                          padding: "0.6rem 0.75rem",
                          borderRadius: "8px",
                          background: isNew ? "rgba(99, 102, 241, 0.06)" : "#f8fafc",
                          borderLeft: isNew ? "3px solid #6366f1" : "3px solid #cbd5e1",
                        }}
                      >
                        <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e293b" }}>
                          {n.title}
                        </strong>
                        <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0" }}>
                          {n.message}
                        </p>
                        <small style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{n.createdAt}</small>
                      </div>
                    );
                  })}
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
