import React from "react";

const AdminSidebar = ({ activePage = "dashboard" }) => {
  const currentPath = window.location.pathname;
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Administrator";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "A";

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "bi-grid-1x2",
    },
    {
      id: "students",
      name: "Students",
      path: "/admin/students",
      icon: "bi-people",
    },
    {
      id: "experts",
      name: "Industry Experts",
      path: "/admin/experts",
      icon: "bi-person-badge",
    },
    {
      id: "careers",
      name: "Careers & Skills",
      path: "/admin/careers",
      icon: "bi-diagram-3",
    },
    {
      id: "quizzes",
      name: "Quizzes & Tests",
      path: "/admin/quizzes",
      icon: "bi-clipboard-check",
    },
    {
      id: "announcements",
      name: "Announcements",
      path: "/admin/announcements",
      icon: "bi-megaphone",
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      path: "/admin/reports",
      icon: "bi-graph-up",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <aside className="student-sidebar admin-sidebar">
      {/* Logo */}
      <div
        className="student-sidebar-logo admin-sidebar-logo"
        onClick={() => (window.location.href = "/admin/dashboard")}
        style={{ cursor: "pointer" }}
      >
        <h2>
          Career<span>Compass</span>
        </h2>
        {/* <span className="admin-badge-pill">ADMIN</span> */}
      </div>

      {/* Navigation */}
      <nav className="student-sidebar-nav admin-sidebar-nav">
        <p className="student-menu-title">ADMIN CONSOLE</p>

        {menuItems.map((item) => {
          const isActive =
            activePage === item.id ||
            currentPath === item.path ||
            (item.path !== "/admin/dashboard" && currentPath.startsWith(item.path));

          return (
            <a
              key={item.id}
              href={item.path}
              className={`student-nav-link admin-nav-link ${
                isActive ? "active" : ""
              }`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* Bottom Navigation & Profile */}
      <div className="student-sidebar-bottom admin-sidebar-bottom">
        <div className="admin-sidebar-profile">
          <div className="admin-avatar">{initial}</div>
          <div className="admin-profile-meta">
            <span className="admin-profile-name" title={fullName}>
              {fullName}
            </span>
            <span className="admin-profile-tag">Super Admin</span>
          </div>
        </div>

        <button
          className="student-nav-link logout-btn admin-logout-link"
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

export default AdminSidebar;
