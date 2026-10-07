import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminStudents.css";

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("quizzes");

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        api.get("admin-portal/quizzes/"),
        api.get("admin-portal/assessments/"),
      ]);
      setQuizzes(qRes.data);
      setAssessments(aRes.data);
    } catch (err) {
      console.error("Failed to load quizzes & assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`admin-portal/quizzes/?id=${quizId}`);
      loadData();
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      alert("Failed to delete quiz.");
    }
  };

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
          <button onClick={() => (window.location.href = "/admin/quizzes")} style={{ background: "none", border: "none", fontWeight: "700", color: "#2f5bea", cursor: "pointer", fontSize: "14px" }}>
            Quizzes & Tests
          </button>
          <button onClick={() => (window.location.href = "/admin/announcements")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Announcements & Moderation
          </button>
          <button onClick={() => (window.location.href = "/admin/reports")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
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
            <span className="admin-section-label">ASSESSMENT & TESTING MONITORING</span>
            <h2>Quizzes & Assessment Activity</h2>
            <p>Monitor student assessments, review platform quizzes, and maintain quiz quality.</p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={activeSubTab === "quizzes" ? "admin-primary-button" : "admin-back-button"}
              onClick={() => setActiveSubTab("quizzes")}
              style={{ margin: 0 }}
            >
              Platform Quizzes ({quizzes.length})
            </button>
            <button
              className={activeSubTab === "assessments" ? "admin-primary-button" : "admin-back-button"}
              onClick={() => setActiveSubTab("assessments")}
              style={{ margin: 0 }}
            >
              Student Submissions ({assessments.length})
            </button>
          </div>
        </section>

        {activeSubTab === "quizzes" ? (
          <section className="admin-table-card">
            <div className="admin-table-header">
              <h3>All Platform Quizzes ({quizzes.length})</h3>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Skill Focus</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Difficulty</th>
                    <th>Questions</th>
                    <th>Author</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <strong>{q.title}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Duration: {q.durationMinutes} mins</div>
                      </td>
                      <td><span style={{ fontWeight: "600", color: "#2f5bea" }}>{q.skill}</span></td>
                      <td>
                        <span style={{ textTransform: "capitalize", fontSize: "12px", fontWeight: "600", color: q.source === "ai" ? "#7c3aed" : "#2563eb" }}>
                          {q.source}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-pill ${q.status === "approved" ? "success" : "pending"}`}>
                          {q.status}
                        </span>
                      </td>
                      <td>{q.difficulty}</td>
                      <td><strong>{q.questionsCount}</strong></td>
                      <td>
                        <div>{q.author}</div>
                        <small style={{ color: "#64748b" }}>{q.authorRole}</small>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteQuiz(q.id)}
                          style={{ padding: "6px 10px", borderRadius: "6px", background: "#fee2e2", color: "#b91c1c", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="admin-table-card">
            <div className="admin-table-header">
              <h3>Student Assessment Submissions ({assessments.length})</h3>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Recommended Career</th>
                    <th>Match %</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.studentName}</strong></td>
                      <td style={{ color: "#64748b" }}>{a.email}</td>
                      <td><strong style={{ color: "#2f5bea" }}>{a.recommendedCareer}</strong></td>
                      <td>
                        <span style={{ fontWeight: "700", color: "#10b981" }}>{a.matchPercent}%</span>
                      </td>
                      <td style={{ fontSize: "13px", color: "#64748b" }}>{a.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminQuizzes;
