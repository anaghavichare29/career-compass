import React from "react";

const MentorNavbar = ({ pageTitle = "Mentor Workspace" }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Industry Mentor";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "M";

  return (
    <header className="student-navbar mentor-navbar">
      <div className="mentor-navbar-title-wrap">
        <h3>{pageTitle}</h3>        
      </div>

      <div className="student-navbar-right mentor-navbar-right">
        {/* Status Pill */}
        {/* <div className="mentor-status-indicator">
          <span className="mentor-pulse-dot"></span>
          <span>Verified Mentor</span>
        </div> */}

        {/* User Pill */}
        <div className="mentor-user-pill">
          <div className="mentor-avatar sm">{initial}</div>
          <span className="mentor-user-pill-name">{fullName}</span>
        </div>
      </div>
    </header>
  );
};

export default MentorNavbar;
