import React from "react";

const StudentSidebar = () => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: "bi-grid-1x2",
    },
    {
      name: "Career Assessment",
      path: "/student/assessment",
      icon: "bi-clipboard-check",
    },
    {
      name: "Recommendations",
      path: "/student/recommendations",
      icon: "bi-stars",
    },
    {
      name: "Career Roadmap",
      path: "/student/roadmap",
      icon: "bi-map",
    },
    {
      name: "Tasks",
      path: "/student/tasks",
      icon: "bi-check2-square",
    },
    {
      name: "Quizzes",
      path: "/student/quizzes",
      icon: "bi-question-circle",
    },
    {
      name: "Industry Professionals",
      path: "/student/industry-professionals",
      icon: "bi-people",
    },
    {
      name: "Skill Gap",
      path: "/student/skill-gap",
      icon: "bi-bar-chart",
    },
    {
      name: "Progress",
      path: "/student/progress",
      icon: "bi-graph-up",
    },
    {
      name: "Career Readiness",
      path: "/student/career-readiness",
      icon: "bi-trophy",
    },
  ];

  const currentPath = window.location.pathname;

  return (
    <aside className="student-sidebar">

      {/* Logo */}
      <div className="student-sidebar-logo">
        <h2>
          Career<span>Compass</span>
        </h2>
      </div>


      {/* Navigation */}
      <nav className="student-sidebar-nav">

        <p className="student-menu-title">
          CAREER JOURNEY
        </p>

        {menuItems.map((item) => {

          const isActive = currentPath === item.path;

          return (
            <a
              key={item.path}
              href={item.path}
              className={`student-nav-link ${
                isActive ? "active" : ""
              }`}
            >

              <i className={`bi ${item.icon}`}></i>

              <span>
                {item.name}
              </span>

            </a>
          );
        })}

      </nav>


      {/* Bottom Navigation */}
      <div className="student-sidebar-bottom">

        <a
          href="/student/profile"
          className={`student-nav-link ${
            currentPath === "/student/profile"
              ? "active"
              : ""
          }`}
        >
          <i className="bi bi-person"></i>

          <span>
            My Profile
          </span>
        </a>


        <button
          className="student-nav-link logout-btn"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <i className="bi bi-box-arrow-right"></i>

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
};

export default StudentSidebar;