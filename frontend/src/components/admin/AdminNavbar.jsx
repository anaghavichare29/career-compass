import React, { useState } from "react";

const AdminNavbar = ({ pageTitle = "Dashboard" }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Administrator";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "A";

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="student-navbar admin-navbar">
      <div className="admin-navbar-title-wrap">
        <h3>{pageTitle}</h3>
        {/* <span className="admin-portal-tag">System Console</span> */}
      </div>

      <div className="student-navbar-right admin-navbar-right">
        {/* System Status Pill */}
        {/* <div className="admin-status-indicator">
          <span className="admin-pulse-dot"></span>
          <span>System Online</span>
        </div> */}

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            className="student-notification admin-notification-btn"
            aria-label="Admin Alerts"
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            🔔
            <span className="notification-dot admin-dot"></span>
          </button>

          {showDropdown && (
            <div className="admin-dropdown-menu">
              <div className="admin-dropdown-header">
                <strong>System Alerts</strong>
                <span className="admin-alert-count">2 New</span>
              </div>
              <div className="admin-dropdown-list">
                <div className="admin-dropdown-item">
                  <i className="bi bi-person-check text-blue"></i>
                  <div>
                    <p className="admin-dd-text">New industry mentor pending verification</p>
                    <small>10 mins ago</small>
                  </div>
                </div>
                <div className="admin-dropdown-item">
                  <i className="bi bi-shield-check text-green"></i>
                  <div>
                    <p className="admin-dd-text">Database backup successfully synchronized</p>
                    <small>1 hour ago</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="admin-user-pill">
          <div className="admin-avatar sm">{initial}</div>
          <span className="admin-user-pill-name">{fullName}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
