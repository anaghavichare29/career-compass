import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentDashboard.css";
import "./StudentCareerReadiness.css";

const StudentProgress = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setError("Please log in to view your learning progress.");
      setLoading(false);
      return;
    }

    api
      .get(`students/progress/?user_id=${user.user_id}`)
      .then((res) => {
        setProgressData(res.data);
      })
      .catch((err) => {
        console.error("Failed to load progress:", err);
        setError("Could not load your progress records.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <StudentLayout pageTitle="Learning Progress">
        <p style={{ padding: "2rem" }}>Loading learning progress...</p>
      </StudentLayout>
    );
  }

  const metrics = progressData?.metrics || {
    roadmapProgress: 0,
    tasksCompleted: "0 of 0",
    taskPercent: 0,
    quizzesCompleted: "0 of 0",
    averageQuizScore: "0%",
  };

  const achievements = progressData?.achievements || [];
  const recentQuizzes = progressData?.recentQuizzes || [];

  return (
    <StudentLayout pageTitle="Learning Progress">
      <div className="career-readiness-page">
        {/* Header */}
        <section className="readiness-introduction">
          <span className="student-section-label">TRACK JOURNEY</span>
          <h1>Overall Learning Progress</h1>
          <p>
            Monitor your milestones, roadmap completion, quiz performance, and earned career achievements.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="student-stats-grid">
          <div className="student-stat-card">
            <div className="student-stat-icon purple">
              <i className="bi bi-map"></i>
            </div>
            <div>
              <span>Roadmap Progress</span>
              <h2>{metrics.roadmapProgress}%</h2>
              <small>Stages completed</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon blue">
              <i className="bi bi-check2-square"></i>
            </div>
            <div>
              <span>Tasks Finished</span>
              <h2>{metrics.tasksCompleted}</h2>
              <small>{metrics.taskPercent}% completion rate</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon green">
              <i className="bi bi-patch-check"></i>
            </div>
            <div>
              <span>Quizzes Taken</span>
              <h2>{metrics.quizzesCompleted}</h2>
              <small>Knowledge checkpoints</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon orange">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div>
              <span>Average Score</span>
              <h2>{metrics.averageQuizScore}</h2>
              <small>Across quiz attempts</small>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
          {/* Achievements Card */}
          <div className="student-card">
            <div className="student-card-header" style={{ marginBottom: "1rem" }}>
              <div>
                <span className="student-section-label">MILESTONES</span>
                <h3 style={{ margin: "0.25rem 0", fontSize: "1.2rem", fontWeight: "600" }}>
                  Achievements & Badges
                </h3>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    background: ach.achieved ? "rgba(16, 185, 129, 0.08)" : "rgba(100, 116, 139, 0.06)",
                    border: ach.achieved ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(148, 163, 184, 0.2)",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      background: ach.achieved ? "#10b981" : "#94a3b8",
                      color: "#fff",
                    }}
                  >
                    <i className={`bi ${ach.icon}`}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: "0.95rem" }}>{ach.title}</strong>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: ach.achieved ? "#10b981" : "#64748b",
                        }}
                      >
                        {ach.achieved ? "Earned" : "In Progress"}
                      </span>
                    </div>
                    <small style={{ color: "#64748b" }}>{ach.description}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Performance History */}
          <div className="student-card">
            <div className="student-card-header" style={{ marginBottom: "1rem" }}>
              <div>
                <span className="student-section-label">ASSESSMENTS</span>
                <h3 style={{ margin: "0.25rem 0", fontSize: "1.2rem", fontWeight: "600" }}>
                  Recent Quiz Scores
                </h3>
              </div>
            </div>

            {recentQuizzes.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                <i className="bi bi-journal-check" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                <p>No quizzes completed yet.</p>
                <a href="/student/quizzes" className="student-primary-btn" style={{ display: "inline-block", marginTop: "0.75rem" }}>
                  Take a Quiz
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentQuizzes.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.85rem 1rem",
                      background: "rgba(248, 250, 252, 0.8)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>{q.quizTitle}</strong>
                      <small style={{ color: "#64748b" }}>Completed on {q.date}</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          background: q.percent >= 70 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: q.percent >= 70 ? "#059669" : "#d97706",
                        }}
                      >
                        {q.score} / {q.total} ({q.percent}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProgress;
