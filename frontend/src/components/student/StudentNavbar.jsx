const StudentNavbar = ({ pageTitle }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Guest";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "?";
  return (
    <header className="student-navbar">

      <h3>{pageTitle}</h3>

      <div className="student-navbar-right">

        <button
          className="student-notification"
          aria-label="Notifications"
        >
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="student-mini-profile">

          <div className="student-avatar">
            {initial}
          </div>

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