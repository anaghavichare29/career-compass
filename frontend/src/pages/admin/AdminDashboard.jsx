import React from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Admin";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "?";
  const stats = [
    {
      label: "Total Students",
      value: "1,248",
      change: "+12.5%",
      icon: "bi-people",
      type: "blue",
    },
    {
      label: "Industry Experts",
      value: "86",
      change: "+8.2%",
      icon: "bi-person-badge",
      type: "purple",
    },
    {
      label: "Active Courses",
      value: "64",
      change: "+5.4%",
      icon: "bi-book",
      type: "green",
    },
    {
      label: "Assessments Completed",
      value: "3,842",
      change: "+18.7%",
      icon: "bi-clipboard-check",
      type: "orange",
    },
  ];


  const recentStudents = [
    {
      name: "Ankita Shanbhag",
      email: "ankita@example.com",
      career: "Data Analyst",
      progress: 82,
      status: "Active",
    },
    {
      name: "Riya Patel",
      email: "riya@example.com",
      career: "Software Engineer",
      progress: 74,
      status: "Active",
    },
    {
      name: "Aditya Mehta",
      email: "aditya@example.com",
      career: "Data Scientist",
      progress: 68,
      status: "Active",
    },
    {
      name: "Sneha Kulkarni",
      email: "sneha@example.com",
      career: "Product Manager",
      progress: 91,
      status: "Active",
    },
  ];


  const expertRequests = [
    {
      name: "Karan Malhotra",
      domain: "AI / Machine Learning",
      date: "17 Aug 2026",
      status: "Pending",
    },
    {
      name: "Meera Joshi",
      domain: "Data Science",
      date: "16 Aug 2026",
      status: "Pending",
    },
    {
      name: "Vivek Shah",
      domain: "Cybersecurity",
      date: "15 Aug 2026",
      status: "Approved",
    },
  ];


  return (
    <div className="admin-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-header">

        <div className="admin-brand">
          <h1>CareerCompass</h1>
        </div>


        <div className="admin-header-right">

          <button
            className="admin-notification"
            type="button"
          >
            <i className="bi bi-bell"></i>

            <span></span>
          </button>


          <div className="admin-profile">

            <div className="admin-avatar">
              {initial}
            </div>

            <div className="admin-profile-info">

              <strong>
                {fullName}
              </strong>

              <small>
                Administrator
              </small>

            </div>

            <i className="bi bi-chevron-down"></i>

          </div>

        </div>

      </header>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="admin-content">


        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="admin-welcome">

          <div>

            <span className="admin-section-label">
              ADMINISTRATION
            </span>

            <h2>
              Good morning, {fullName} 👋
            </h2>

            <p>
              Monitor platform activity, manage users and
              keep CareerCompass running smoothly.
            </p>

          </div>


          <div className="admin-date">

            <i className="bi bi-calendar3"></i>

            <span>
              17 August 2026
            </span>

          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="admin-stats-grid">

          {stats.map((stat) => (

            <div
              className="admin-stat-card"
              key={stat.label}
            >

              <div
                className={`admin-stat-icon ${stat.type}`}
              >
                <i className={`bi ${stat.icon}`}></i>
              </div>


              <div className="admin-stat-content">

                <span>
                  {stat.label}
                </span>

                <h3>
                  {stat.value}
                </h3>

                <small>
                  <i className="bi bi-arrow-up"></i>
                  {stat.change} this month
                </small>

              </div>

            </div>

          ))}

        </section>


        {/* =================================================
            MAIN GRID
        ================================================= */}

        <section className="admin-main-grid">


          {/* =================================================
              PLATFORM OVERVIEW
          ================================================= */}

          <div className="admin-card admin-overview-card">

            <div className="admin-card-header">

              <div>

                <span className="admin-section-label">
                  PLATFORM OVERVIEW
                </span>

                <h3>
                  User Activity
                </h3>

              </div>


              <select className="admin-period-select">

                <option>
                  Last 7 days
                </option>

                <option>
                  Last 30 days
                </option>

                <option>
                  Last 3 months
                </option>

              </select>

            </div>


            <div className="admin-chart-placeholder">

              <div className="chart-y-axis">

                <span>400</span>
                <span>300</span>
                <span>200</span>
                <span>100</span>
                <span>0</span>

              </div>


              <div className="chart-area">

                <div className="chart-grid-line"></div>
                <div className="chart-grid-line"></div>
                <div className="chart-grid-line"></div>
                <div className="chart-grid-line"></div>
                <div className="chart-grid-line"></div>


                <div className="chart-bars">

                  <div style={{ height: "45%" }}>
                    <span>Mon</span>
                  </div>

                  <div style={{ height: "62%" }}>
                    <span>Tue</span>
                  </div>

                  <div style={{ height: "52%" }}>
                    <span>Wed</span>
                  </div>

                  <div style={{ height: "76%" }}>
                    <span>Thu</span>
                  </div>

                  <div style={{ height: "68%" }}>
                    <span>Fri</span>
                  </div>

                  <div style={{ height: "88%" }}>
                    <span>Sat</span>
                  </div>

                  <div style={{ height: "72%" }}>
                    <span>Sun</span>
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div className="admin-card">

            <div className="admin-card-header">

              <div>

                <span className="admin-section-label">
                  MANAGEMENT
                </span>

                <h3>
                  Quick Actions
                </h3>

              </div>

            </div>


            <div className="admin-actions">

              <button
                onClick={() =>
                  (window.location.href =
                    "/admin/students")
                }
              >

                <div className="action-icon blue">
                  <i className="bi bi-people"></i>
                </div>

                <div>
                  <strong>
                    Manage Students
                  </strong>

                  <span>
                    View and manage student accounts
                  </span>
                </div>

                <i className="bi bi-arrow-right"></i>

              </button>


              <button
                onClick={() =>
                  (window.location.href =
                    "/admin/experts")
                }
              >

                <div className="action-icon purple">
                  <i className="bi bi-person-badge"></i>
                </div>

                <div>
                  <strong>
                    Manage Experts
                  </strong>

                  <span>
                    Review industry professionals
                  </span>
                </div>

                <i className="bi bi-arrow-right"></i>

              </button>


              <button
                onClick={() =>
                  (window.location.href =
                    "/admin/careers")
                }
              >

                <div className="action-icon green">
                  <i className="bi bi-diagram-3"></i>
                </div>

                <div>
                  <strong>
                    Career Paths
                  </strong>

                  <span>
                    Manage careers and skills
                  </span>
                </div>

                <i className="bi bi-arrow-right"></i>

              </button>


              <button
                onClick={() =>
                  (window.location.href =
                    "/admin/reports")
                }
              >

                <div className="action-icon orange">
                  <i className="bi bi-bar-chart"></i>
                </div>

                <div>
                  <strong>
                    Reports & Analytics
                  </strong>

                  <span>
                    View platform performance
                  </span>
                </div>

                <i className="bi bi-arrow-right"></i>

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            LOWER GRID
        ================================================= */}

        <section className="admin-lower-grid">


          {/* =================================================
              RECENT STUDENTS
          ================================================= */}

          <div className="admin-card">

            <div className="admin-card-header">

              <div>

                <span className="admin-section-label">
                  STUDENTS
                </span>

                <h3>
                  Recent Students
                </h3>

              </div>


              <button
                className="admin-view-button"
                onClick={() =>
                  (window.location.href =
                    "/admin/students")
                }
              >
                View All
              </button>

            </div>


            <div className="admin-student-list">

              {recentStudents.map((student) => (

                <div
                  className="admin-student-row"
                  key={student.email}
                >

                  <div className="admin-student-avatar">
                    {student.name.charAt(0)}
                  </div>


                  <div className="admin-student-info">

                    <strong>
                      {student.name}
                    </strong>

                    <span>
                      {student.email}
                    </span>

                  </div>


                  <div className="admin-student-career">

                    <span>
                      Career
                    </span>

                    <strong>
                      {student.career}
                    </strong>

                  </div>


                  <div className="admin-student-progress">

                    <div>

                      <span>
                        Progress
                      </span>

                      <strong>
                        {student.progress}%
                      </strong>

                    </div>

                    <div className="mini-progress">

                      <div
                        style={{
                          width: `${student.progress}%`,
                        }}
                      ></div>

                    </div>

                  </div>


                  <span className="admin-active-status">
                    {student.status}
                  </span>

                </div>

              ))}

            </div>

          </div>


          {/* =================================================
              EXPERT REQUESTS
          ================================================= */}

          <div className="admin-card">

            <div className="admin-card-header">

              <div>

                <span className="admin-section-label">
                  INDUSTRY EXPERTS
                </span>

                <h3>
                  Expert Requests
                </h3>

              </div>


              <button
                className="admin-view-button"
                onClick={() =>
                  (window.location.href =
                    "/admin/experts")
                }
              >
                View All
              </button>

            </div>


            <div className="admin-request-list">

              {expertRequests.map((request) => (

                <div
                  className="admin-request-row"
                  key={request.name}
                >

                  <div className="admin-request-avatar">
                    {request.name.charAt(0)}
                  </div>


                  <div className="admin-request-info">

                    <strong>
                      {request.name}
                    </strong>

                    <span>
                      {request.domain}
                    </span>

                    <small>
                      {request.date}
                    </small>

                  </div>


                  <span
                    className={`admin-request-status ${request.status.toLowerCase()}`}
                  >
                    {request.status}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* =================================================
            AI SYSTEM STATUS
        ================================================= */}

        <section className="admin-ai-card">

          <div className="admin-ai-icon">
            <i className="bi bi-stars"></i>
          </div>


          <div className="admin-ai-content">

            <span className="admin-section-label">
              AI SYSTEM
            </span>

            <h3>
              CareerCompass AI Personalization
            </h3>

            <p>
              AI-powered career recommendations, skill-gap
              analysis, personalized roadmaps and expert
              matching will be connected here.
            </p>

          </div>


          <div className="admin-ai-status">

            <span className="ai-status-dot"></span>

            <strong>
              AI Ready
            </strong>

            <small>
              Integration pending
            </small>

          </div>

        </section>

      </main>

    </div>
  );
};

export default AdminDashboard;