import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminDashboard.css";

const defaultStats = [
  { label: "Total Students", value: "1,248", change: "+12.5%", icon: "bi-people", type: "blue" },
  { label: "Industry Experts", value: "86", change: "+8.2%", icon: "bi-person-badge", type: "purple" },
  { label: "Active Quizzes", value: "64", change: "+5.4%", icon: "bi-book", type: "green" },
  { label: "Assessments Completed", value: "3,842", change: "+18.7%", icon: "bi-clipboard-check", type: "orange" },
];

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Admin";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "A";

  const [stats, setStats] = useState(defaultStats);
  const [recentStudents, setRecentStudents] = useState([]);
  const [expertRequests, setExpertRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, studentsRes, expertsRes] = await Promise.all([
          api.get("admin-portal/stats/").catch(() => null),
          api.get("admin-portal/students/").catch(() => null),
          api.get("admin-portal/experts/").catch(() => null),
        ]);

        if (statsRes?.data?.stats) {
          setStats(statsRes.data.stats);
        }
        if (studentsRes?.data) {
          setRecentStudents(studentsRes.data.slice(0, 5));
        }
        if (expertsRes?.data) {
          setExpertRequests(expertsRes.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="admin-page">
      {/* =================================================
          HEADER
      ================================================= */}
      <header className="admin-header">
        <div className="admin-brand">
          <h1 onClick={() => (window.location.href = "/admin/dashboard")} style={{ cursor: "pointer" }}>
            CareerCompass <span style={{ fontSize: "14px", fontWeight: "600", color: "#2f5bea", background: "#eff6ff", padding: "3px 8px", borderRadius: "6px" }}>ADMIN</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button onClick={() => (window.location.href = "/admin/dashboard")} style={{ background: "none", border: "none", fontWeight: "700", color: "#2f5bea", cursor: "pointer", fontSize: "14px" }}>
            Dashboard
          </button>
          <button onClick={() => (window.location.href = "/admin/students")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Students
          </button>
          <button onClick={() => (window.location.href = "/admin/experts")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Experts
          </button>
          <button onClick={() => (window.location.href = "/admin/careers")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Careers & Skills
          </button>
          <button onClick={() => (window.location.href = "/admin/quizzes")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Quizzes & Tests
          </button>
          <button onClick={() => (window.location.href = "/admin/announcements")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Announcements & Moderation
          </button>
          <button onClick={() => (window.location.href = "/admin/reports")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Reports & Analytics
          </button>
        </div>

        <div className="admin-header-right">
          <div className="admin-profile">
            <div className="admin-avatar">{initial}</div>
            <div className="admin-profile-info">
              <strong>{fullName}</strong>
              <small>Administrator</small>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              color: "#64748b",
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}
      <main className="admin-content">
        {/* WELCOME */}
        <section className="admin-welcome">
          <div>
            <span className="admin-section-label">ADMINISTRATION</span>
            <h2>Welcome back, {fullName} 👋</h2>
            <p>
              Monitor real-time platform activity, verify industry mentors, oversee career paths, and manage students.
            </p>
          </div>

          <div className="admin-date">
            <i className="bi bi-calendar3"></i>
            <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="admin-stats-grid">
          {stats.map((stat) => (
            <div className="admin-stat-card" key={stat.label}>
              <div className={`admin-stat-icon ${stat.type}`}>
                <i className={`bi ${stat.icon}`}></i>
              </div>
              <div className="admin-stat-content">
                <span>{stat.label}</span>
                <h3>{stat.value}</h3>
                <small>
                  <i className="bi bi-arrow-up"></i>
                  {stat.change}
                </small>
              </div>
            </div>
          ))}
        </section>

        {/* MAIN GRID */}
        <section className="admin-main-grid">
          {/* USER ACTIVITY BARS */}
          <div className="admin-card admin-overview-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-section-label">PLATFORM OVERVIEW</span>
                <h3>User & Assessment Activity</h3>
              </div>
              <select className="admin-period-select">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
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
                  <div style={{ height: "45%" }}><span>Mon</span></div>
                  <div style={{ height: "62%" }}><span>Tue</span></div>
                  <div style={{ height: "52%" }}><span>Wed</span></div>
                  <div style={{ height: "76%" }}><span>Thu</span></div>
                  <div style={{ height: "68%" }}><span>Fri</span></div>
                  <div style={{ height: "88%" }}><span>Sat</span></div>
                  <div style={{ height: "72%" }}><span>Sun</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-section-label">MANAGEMENT</span>
                <h3>Quick Admin Modules</h3>
              </div>
            </div>

            <div className="admin-actions">
              <button onClick={() => (window.location.href = "/admin/students")}>
                <div className="action-icon blue"><i className="bi bi-people"></i></div>
                <div>
                  <strong>Manage Students</strong>
                  <span>View, filter and activate student accounts</span>
                </div>
                <i className="bi bi-arrow-right"></i>
              </button>

              <button onClick={() => (window.location.href = "/admin/experts")}>
                <div className="action-icon purple"><i className="bi bi-person-badge"></i></div>
                <div>
                  <strong>Verify & Manage Mentors</strong>
                  <span>Approve mentor verification requests</span>
                </div>
                <i className="bi bi-arrow-right"></i>
              </button>

              <button onClick={() => (window.location.href = "/admin/careers")}>
                <div className="action-icon green"><i className="bi bi-diagram-3"></i></div>
                <div>
                  <strong>Careers & Skills Management</strong>
                  <span>Configure career options & skill mappings</span>
                </div>
                <i className="bi bi-arrow-right"></i>
              </button>

              <button onClick={() => (window.location.href = "/admin/quizzes")}>
                <div className="action-icon orange"><i className="bi bi-clipboard2-check"></i></div>
                <div>
                  <strong>Quizzes & Assessment Monitoring</strong>
                  <span>Monitor test questions & submissions</span>
                </div>
                <i className="bi bi-arrow-right"></i>
              </button>

              <button onClick={() => (window.location.href = "/admin/announcements")}>
                <div className="action-icon blue"><i className="bi bi-megaphone"></i></div>
                <div>
                  <strong>Announcements & Moderation</strong>
                  <span>Broadcast notices & handle user complaints</span>
                </div>
                <i className="bi bi-arrow-right"></i>
              </button>

              <button onClick={() => (window.location.href = "/admin/reports")}>
                <div className="action-icon orange"><i className="bi bi-bar-chart"></i></div>
                <div>
                  <strong>Platform Reports & Analytics</strong>
                  <span>View performance and engagement trends</span>
                </div>
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </section>

        {/* LOWER GRID */}
        <section className="admin-lower-grid">
          {/* RECENT STUDENTS */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-section-label">STUDENTS</span>
                <h3>Registered Students</h3>
              </div>
              <button className="admin-view-button" onClick={() => (window.location.href = "/admin/students")}>
                View All
              </button>
            </div>

            <div className="admin-student-list">
              {recentStudents.map((student) => (
                <div className="admin-student-row" key={student.email || student.id}>
                  <div className="admin-student-avatar">{student.name.charAt(0)}</div>

                  <div className="admin-student-info">
                    <strong>{student.name}</strong>
                    <span>{student.email}</span>
                  </div>

                  <div className="admin-student-career">
                    <span>Career Goal</span>
                    <strong>{student.career}</strong>
                  </div>

                  <div className="admin-student-progress">
                    <div>
                      <span>Progress</span>
                      <strong>{student.progress}%</strong>
                    </div>
                    <div className="mini-progress">
                      <div style={{ width: `${student.progress}%` }}></div>
                    </div>
                  </div>

                  <span className={`admin-active-status ${student.status?.toLowerCase() === "inactive" ? "inactive" : ""}`}>
                    {student.status || "Active"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* EXPERT REQUESTS */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-section-label">INDUSTRY EXPERTS</span>
                <h3>Mentor Verification Overview</h3>
              </div>
              <button className="admin-view-button" onClick={() => (window.location.href = "/admin/experts")}>
                View All
              </button>
            </div>

            <div className="admin-request-list">
              {expertRequests.map((request) => (
                <div className="admin-request-row" key={request.email || request.id}>
                  <div className="admin-request-avatar">{request.initials || request.name.charAt(0)}</div>

                  <div className="admin-request-info">
                    <strong>{request.name}</strong>
                    <span>{request.role} • {request.company}</span>
                    <small>{request.domain} • {request.joined}</small>
                  </div>

                  <span className={`admin-request-status ${request.status?.toLowerCase() || "pending"}`}>
                    {request.status || (request.verified ? "Approved" : "Pending")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI & PLATFORM SYSTEM CARD */}
        <section className="admin-ai-card">
          <div className="admin-ai-icon">
            <i className="bi bi-stars"></i>
          </div>
          <div className="admin-ai-content">
            <span className="admin-section-label">AI PERSONALIZATION SYSTEM</span>
            <h3>CareerCompass Recommendation Engine</h3>
            <p>
              AI-driven skill gap assessment, tailored roadmap milestones, and verified industry mentor pairings are active and operating seamlessly.
            </p>
          </div>
          <div className="admin-ai-status">
            <span className="ai-status-dot"></span>
            <strong>Active & Healthy</strong>
            <small>All Systems Normal</small>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;