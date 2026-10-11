import React from "react";

const MentorSidebar = ({
  activePage,
  activeTab,
  onSelectTab,
  pendingCounts = {},
}) => {
  const currentPath = window.location.pathname;
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Industry Mentor";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "M";

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const isTabMode = Boolean(onSelectTab);

  const workspaceTabs = [
    {
      id: "overview",
      name: "Overview",
      icon: "bi-grid-1x2",
      badge: null,
    },
    {
      id: "requests",
      name: "Mentorship Requests",
      icon: "bi-inbox",
      badge: pendingCounts.requests > 0 ? pendingCounts.requests : null,
      badgeColor: "urgent",
    },
    {
      id: "students",
      name: "My Students",
      icon: "bi-people",
      badge: pendingCounts.students > 0 ? pendingCounts.students : null,
      badgeColor: "neutral",
    },
    {
      id: "assign",
      name: "Assign Tasks",
      icon: "bi-plus-circle",
      badge: null,
    },
    {
      id: "submissions",
      name: "Review Tasks",
      icon: "bi-check2-all",
      badge: pendingCounts.submissions > 0 ? pendingCounts.submissions : null,
      badgeColor: "urgent",
    },
    {
      id: "quizzes",
      name: "Review Quizzes",
      icon: "bi-question-diamond",
      badge: pendingCounts.quizzes > 0 ? pendingCounts.quizzes : null,
      badgeColor: "urgent",
    },
  ];

  const profileTabs = [
    {
      id: "experience",
      name: "Profile & Journey",
      icon: "bi-person-lines-fill",
    },
    {
      id: "resources",
      name: "Recommend Resources",
      icon: "bi-bookmark-star",
    },
  ];

  return (
    <aside className="student-sidebar mentor-sidebar">
      {/* Logo */}
      <div
        className="student-sidebar-logo mentor-sidebar-logo"
        onClick={() => {
          if (isTabMode) onSelectTab("overview");
          else window.location.href = "/mentor/dashboard";
        }}
        style={{ cursor: "pointer" }}
      >
        <h2>
          Career<span>Compass</span>
        </h2>
        {/* <span className="mentor-badge-pill">MENTOR</span> */}
      </div>

      {/* Navigation */}
      <nav className="student-sidebar-nav mentor-sidebar-nav">
        {isTabMode ? (
          <>
            <p className="student-menu-title">MENTOR WORKSPACE</p>
            {workspaceTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`student-nav-link mentor-nav-link ${
                    isActive ? "active" : ""
                  }`}
                >
                  <i className={`bi ${tab.icon}`}></i>
                  <span>{tab.name}</span>
                  {tab.badge && (
                    <span className={`mentor-counter-badge ${tab.badgeColor || ""}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <p className="student-menu-title" style={{ marginTop: "18px" }}>
              EXPERTISE & TOOLS
            </p>
            {profileTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`student-nav-link mentor-nav-link ${
                    isActive ? "active" : ""
                  }`}
                >
                  <i className={`bi ${tab.icon}`}></i>
                  <span>{tab.name}</span>
                </button>
              );
            })}

            {/* <p className="student-menu-title" style={{ marginTop: "18px" }}>
              NETWORK
            </p>
            <a
              href="/industry-experts/dashboard"
              className={`student-nav-link mentor-nav-link ${
                currentPath === "/industry-experts/dashboard" ? "active" : ""
              }`}
            >
              <i className="bi bi-compass"></i>
              <span>Experts Directory</span>
            </a> */}
          </>
        ) : (
          <>
            <p className="student-menu-title">MENTOR PORTAL</p>
            <a
              href="/mentor/dashboard"
              className={`student-nav-link mentor-nav-link ${
                activePage === "workspace" || currentPath === "/mentor/dashboard"
                  ? "active"
                  : ""
              }`}
            >
              <i className="bi bi-grid-1x2"></i>
              <span>Mentor Workspace</span>
            </a>
            <a
              href="/industry-experts/dashboard"
              className={`student-nav-link mentor-nav-link ${
                activePage === "directory" ||
                currentPath === "/industry-experts/dashboard" ||
                currentPath.startsWith("/industry-experts/")
                  ? "active"
                  : ""
              }`}
            >
              <i className="bi bi-compass"></i>
              <span>Experts Directory</span>
            </a>
          </>
        )}
      </nav>

      {/* Bottom Profile & Logout */}
      <div className="student-sidebar-bottom mentor-sidebar-bottom">
        <div className="mentor-sidebar-profile">
          <div className="mentor-avatar">{initial}</div>
          <div className="mentor-profile-meta">
            <span className="mentor-profile-name" title={fullName}>
              {fullName}
            </span>
            <span className="mentor-profile-tag">Industry Mentor</span>
          </div>
        </div>

        <button
          className="student-nav-link logout-btn mentor-logout-link"
          onClick={handleLogout}
          type="button"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default MentorSidebar;
