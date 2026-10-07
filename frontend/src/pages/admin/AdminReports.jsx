import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminStudents.css";

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("admin-portal/analytics/")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-students-page">
      <header className="admin-header">
        <div className="admin-brand">
          <h1 onClick={() => (window.location.href = "/admin/dashboard")} style={{ cursor: "pointer" }}>
            CareerCompass <span style={{ fontSize: "14px", fontWeight: "600", color: "#2f5bea", background: "#eff6ff", padding: "3px 8px", borderRadius: "6px" }}>ADMIN</span>
          </h1>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button onClick={() => (window.location.href = "/admin/dashboard")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
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
          <button onClick={() => (window.location.href = "/admin/reports")} style={{ background: "none", border: "none", fontWeight: "700", color: "#2f5bea", cursor: "pointer", fontSize: "14px" }}>
            Reports & Analytics
          </button>
        </div>
      </header>

      <main className="admin-students-content">
        <button className="admin-back-button" onClick={() => (window.location.href = "/admin/dashboard")}>
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>

        <section className="admin-page-heading">
          <div>
            <span className="admin-section-label">PLATFORM INTELLIGENCE</span>
            <h2>Reports & Performance Analytics</h2>
            <p>Comprehensive report breakdown of student assessments, quiz performance, and mentor activity.</p>
          </div>
        </section>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <p>Loading reports...</p>
          </div>
        ) : (
          <div>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Task Completion Rate</span>
                <h2 style={{ margin: "6px 0", color: "#10b981" }}>{data?.overview?.taskCompletionRate}%</h2>
                <small style={{ color: "#64748b" }}>Overall coursework compliance</small>
              </div>

              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Average Quiz Score</span>
                <h2 style={{ margin: "6px 0", color: "#6366f1" }}>{data?.overview?.averageQuizScore}%</h2>
                <small style={{ color: "#64748b" }}>Across {data?.overview?.totalQuizAttempts} attempts</small>
              </div>

              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Mentor Response Rate</span>
                <h2 style={{ margin: "6px 0", color: "#f59e0b" }}>{data?.overview?.mentorResponseRate}%</h2>
                <small style={{ color: "#64748b" }}>Guidance requests answered</small>
              </div>

              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Platform Mentors</span>
                <h2 style={{ margin: "6px 0", color: "#0f172a" }}>{data?.overview?.totalMentors}</h2>
                <small style={{ color: "#64748b" }}>Industry professionals</small>
              </div>
            </div>

            {/* Distribution & Monthly Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
              {/* Domain Distribution */}
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Student Career Domain Distribution</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {data?.domainDistribution?.map((d) => (
                    <div key={d.domain}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                        <strong>{d.domain}</strong>
                        <span>{d.percentage}%</span>
                      </div>
                      <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${d.percentage}%`, height: "100%", background: "#2f5bea" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Engagement Table */}
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Monthly Engagement Growth</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Assessments</th>
                      <th>Quizzes Taken</th>
                      <th>Guidance Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.monthlyEngagement?.map((m) => (
                      <tr key={m.month}>
                        <td><strong>{m.month} 2026</strong></td>
                        <td>{m.assessments}</td>
                        <td>{m.quizzes}</td>
                        <td>{m.guidance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReports;
