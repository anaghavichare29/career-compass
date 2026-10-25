import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import CareerPathSelector from "../../components/student/CareerPathSelector";
import "./StudentDashboard.css";
import "./StudentCareerReadiness.css";
import "./StudentProgress.css";

const StudentProgress = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCareerName, setActiveCareerName] = useState("");

  const loadProgress = (careerOverride = null) => {
    if (!user) {
      setError("Please log in to view your learning progress.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const savedCareer = JSON.parse(localStorage.getItem("selectedCareer") || "null");
    const currentCareer = careerOverride || savedCareer;
    const targetCareerName = currentCareer?.career_name || currentCareer?.name || "";

    if (targetCareerName) {
      setActiveCareerName(targetCareerName);
    }

    const params = { user_id: user.user_id };
    if (targetCareerName) {
      params.career_name = targetCareerName;
    }

    api
      .get("students/progress/", { params })
      .then((res) => {
        setProgressData(res.data);
        if (res.data?.target_career) {
          setActiveCareerName(res.data.target_career);
        }
      })
      .catch((err) => {
        console.error("Failed to load progress:", err);
        setError("Could not load your progress records.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProgress();

    const handleCareerChange = (e) => {
      if (e.detail) {
        loadProgress(e.detail);
      }
    };
    window.addEventListener("selectedCareerChanged", handleCareerChange);
    return () => window.removeEventListener("selectedCareerChanged", handleCareerChange);
  }, []);

  // Learning Workspace local data filtered specifically for this career's skills
  const storageKey = (type) => `lw_${user?.user_id}_${type}`;
  const verifiedLessons = JSON.parse(localStorage.getItem(storageKey("lessons")) || "{}");
  const practiceSubmissions = JSON.parse(localStorage.getItem(storageKey("practice")) || "{}");
  const lwQuizResults = JSON.parse(localStorage.getItem(storageKey("quizzes")) || "{}");
  const completedSkills = JSON.parse(localStorage.getItem(storageKey("completed")) || "[]");

  const careerSkillsList = (progressData?.careerSkills || []).map((s) => s.toLowerCase().trim());
  const careerSkillSet = new Set(careerSkillsList);

  const isCareerSkill = (skillName) => {
    if (!skillName) return false;
    const clean = skillName.toLowerCase().trim();
    if (careerSkillSet.has(clean)) return true;
    return careerSkillsList.some((cs) => clean.includes(cs) || cs.includes(clean));
  };

  const verifiedCount = Object.entries(verifiedLessons).filter(
    ([k, v]) => Boolean(v) && (careerSkillSet.size === 0 || isCareerSkill(k))
  ).length;

  const practiceCount = Object.keys(practiceSubmissions).filter(
    (k) => careerSkillSet.size === 0 || isCareerSkill(k)
  ).length;

  const passedQuizzes = Object.entries(lwQuizResults).filter(
    ([k, r]) => r?.passed && (careerSkillSet.size === 0 || isCareerSkill(k))
  ).length;

  const lwCompletedCount = completedSkills.filter(
    (s) => careerSkillSet.size === 0 || isCareerSkill(s)
  ).length;

  if (loading && !progressData) {
    return (
      <StudentLayout pageTitle="Career Progress">
        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <div className="student-loading-spinner" style={{ fontSize: "2.5rem", color: "#4f46e5", marginBottom: "1rem" }}>
            <i className="bi bi-arrow-repeat bi-spin"></i>
          </div>
          <h2 style={{ color: "#1e293b", fontWeight: 700 }}>Loading Career Progress...</h2>
          <p style={{ color: "#64748b" }}>Fetching milestones, assessments, and metrics for your career</p>
        </div>
      </StudentLayout>
    );
  }

  const careerName = progressData?.target_career || activeCareerName || "Target Career";
  const metrics = progressData?.metrics || {
    roadmapProgress: 0,
    tasksCompleted: "0 of 0",
    taskPercent: 0,
    quizzesCompleted: "0 of 0",
    quizzesPassed: 0,
    averageQuizScore: "0%",
    readinessScore: 0,
  };

  const assessmentProfile = progressData?.assessmentProfile || {
    has_assessment: false,
    match_percent: 0,
    matched_skills: [],
    missing_skills: [],
    description: "",
  };

  const stageMilestones = progressData?.stageMilestones || [];
  const achievements = progressData?.achievements || [];
  const recentQuizzes = progressData?.recentQuizzes || [];
  const categories = progressData?.categories || [];
  const readiness = progressData?.readiness || {};

  return (
    <StudentLayout pageTitle="Career Progress">
      <div className="student-progress-container">
        {/* Career Selector */}
        <CareerPathSelector
          onCareerChange={(career) => loadProgress(career)}
          selectedCareerName={careerName}
        />

        {error && (
          <div style={{ padding: "1rem", background: "#fef2f2", color: "#991b1b", borderRadius: "10px", marginBottom: "1.5rem" }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: "0.5rem" }}></i>
            {error}
          </div>
        )}

        {/* Career Focus Hero Banner */}
        <section className="progress-hero-banner">
          <div className="progress-hero-header">
            <div className="progress-hero-title-area">
              <span className="progress-track-pill">
                <i className="bi bi-crosshair"></i> CAREER SPECIFIC PROGRESS
              </span>
              <h1>
                <span>{careerName}</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 500, opacity: 0.85, background: "rgba(255,255,255,0.15)", padding: "0.2rem 0.75rem", borderRadius: "9999px" }}>
                  Active Pathway
                </span>
              </h1>
              <p>
                All milestones, roadmap stages, skill assessments, knowledge checkpoints, and learning progress below are tailored exclusively to <strong>{careerName}</strong>.
              </p>
            </div>

            <div className="progress-hero-badges">
              {assessmentProfile.has_assessment && (
                <div className="progress-meta-badge">
                  <div className="progress-meta-icon purple">
                    <i className="bi bi-pie-chart-fill"></i>
                  </div>
                  <div className="progress-meta-info">
                    <span>Assessment Match</span>
                    <strong>{assessmentProfile.match_percent}% Match</strong>
                  </div>
                </div>
              )}

              <div className="progress-meta-badge">
                <div className="progress-meta-icon emerald">
                  <i className="bi bi-stars"></i>
                </div>
                <div className="progress-meta-info">
                  <span>Career Readiness</span>
                  <strong>{metrics.readinessScore || readiness.overall || 0}% ({readiness.level || "Foundational"})</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Core Career Performance Metrics */}
        <section className="student-stats-grid">
          <div className="student-stat-card">
            <div className="student-stat-icon purple">
              <i className="bi bi-signpost-split"></i>
            </div>
            <div>
              <span>Roadmap Progress</span>
              <h2>{metrics.roadmapProgress}%</h2>
              <small>Across {careerName} stages</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon blue">
              <i className="bi bi-kanban"></i>
            </div>
            <div>
              <span>Practical Tasks</span>
              <h2>{metrics.tasksCompleted}</h2>
              <small>{metrics.taskPercent}% coursework complete</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon green">
              <i className="bi bi-patch-check"></i>
            </div>
            <div>
              <span>Career Quizzes</span>
              <h2>{metrics.quizzesCompleted}</h2>
              <small>{metrics.quizzesPassed || 0} passed with 70%+</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon orange">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div>
              <span>Assessment Avg</span>
              <h2>{metrics.averageQuizScore}</h2>
              <small>Across {careerName} quizzes</small>
            </div>
          </div>
        </section>

        {/* Section: Career Roadmap Milestones */}
        <section style={{ marginTop: "2rem" }}>
          <div className="progress-section-header">
            <h3>
              <i className="bi bi-flag-fill"></i> {careerName} Roadmap Milestones
            </h3>
            <a href="/student/roadmap" className="progress-section-link">
              View Interactive Roadmap <i className="bi bi-arrow-right"></i>
            </a>
          </div>

          {stageMilestones.length === 0 ? (
            <div className="stage-milestone-card" style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#64748b" }}>
              <i className="bi bi-map" style={{ fontSize: "2rem", display: "block", marginBottom: "0.75rem", color: "#94a3b8" }}></i>
              <p style={{ margin: 0, fontWeight: 500 }}>No stages generated yet for this career.</p>
              <a href="/student/roadmap" className="student-primary-btn" style={{ display: "inline-block", marginTop: "1rem" }}>
                Generate Roadmap
              </a>
            </div>
          ) : (
            <div className="stage-milestones-grid">
              {stageMilestones.map((stage) => {
                const isCompleted = stage.status === "completed" || stage.progress >= 100;
                const isCurrent = stage.status === "current";
                return (
                  <div
                    key={stage.id}
                    className={`stage-milestone-card ${isCompleted ? "completed" : isCurrent ? "current" : ""}`}
                  >
                    <div className="stage-card-top">
                      <span className="stage-number-pill">Milestone #{stage.order}</span>
                      <span className={`stage-status-badge ${isCompleted ? "completed" : isCurrent ? "current" : "upcoming"}`}>
                        {isCompleted ? (
                          <>
                            <i className="bi bi-check-circle-fill"></i> Completed
                          </>
                        ) : isCurrent ? (
                          <>
                            <i className="bi bi-arrow-repeat"></i> In Progress
                          </>
                        ) : (
                          <>
                            <i className="bi bi-lock-fill"></i> Upcoming
                          </>
                        )}
                      </span>
                    </div>

                    <h4 className="stage-milestone-title">{stage.name}</h4>
                    <p className="stage-milestone-desc">
                      {stage.description || `Key developmental competencies for ${stage.name}.`}
                    </p>

                    <div className="stage-milestone-meta">
                      <div className="stage-progress-bar-wrapper">
                        <div className="stage-progress-track">
                          <div
                            className={`stage-progress-fill ${isCompleted ? "green" : isCurrent ? "indigo" : "slate"}`}
                            style={{ width: `${stage.progress}%` }}
                          ></div>
                        </div>
                        <span className="stage-progress-percent">{stage.progress}%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#64748b" }}>
                        <span>{stage.completedSkills} of {stage.totalSkills} skills complete</span>
                        {stage.duration && <span><i className="bi bi-clock"></i> {stage.duration}</span>}
                      </div>
                    </div>

                    {stage.skills && stage.skills.length > 0 && (
                      <div className="stage-skills-preview">
                        {stage.skills.slice(0, 4).map((sk, idx) => (
                          <span
                            key={idx}
                            className={`stage-skill-pill ${sk.progress >= 100 ? "done" : ""}`}
                            title={`${sk.name}: ${sk.progress}%`}
                          >
                            {sk.progress >= 100 && <i className="bi bi-check2"></i>}
                            {sk.name}
                          </span>
                        ))}
                        {stage.skills.length > 4 && (
                          <span className="stage-skill-pill">+{stage.skills.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section: Career Assessment & Competency Evaluation */}
        <section style={{ marginTop: "1rem" }}>
          <div className="progress-section-header">
            <h3>
              <i className="bi bi-clipboard2-data-fill"></i> {careerName} Assessment & Readiness Profile
            </h3>
            <a href="/student/career-readiness" className="progress-section-link">
              Full Readiness Analytics <i className="bi bi-arrow-right"></i>
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {/* Assessment Findings Card */}
            <div className="assessment-overview-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                <div>
                  <span className="student-section-label">ASSESSMENT MATCH</span>
                  <h4 style={{ margin: "0.2rem 0", fontSize: "1.1rem", fontWeight: 700, color: "#1e293b" }}>
                    {careerName} Alignment
                  </h4>
                </div>
                {assessmentProfile.has_assessment ? (
                  <span
                    style={{
                      padding: "0.35rem 0.75rem",
                      background: "#ecfdf5",
                      color: "#059669",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    {assessmentProfile.match_percent}% Match
                  </span>
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Pending Assessment</span>
                )}
              </div>

              <p style={{ fontSize: "0.86rem", color: "#64748b", lineHeight: 1.6, marginBottom: "1rem" }}>
                {assessmentProfile.description ||
                  `Evaluated based on your interests, academic profile, and skill compatibility with ${careerName}.`}
              </p>

              {assessmentProfile.matched_skills && assessmentProfile.matched_skills.length > 0 && (
                <div style={{ marginBottom: "0.9rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <i className="bi bi-check2-circle"></i> Baseline Skills Matched:
                  </span>
                  <div className="assessment-pill-group">
                    {assessmentProfile.matched_skills.map((skill, idx) => (
                      <span key={idx} className="matched-pill">
                        <i className="bi bi-check-lg"></i> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {assessmentProfile.missing_skills && assessmentProfile.missing_skills.length > 0 && (
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <i className="bi bi-arrow-up-right-circle"></i> Skills to Develop for {careerName}:
                  </span>
                  <div className="assessment-pill-group">
                    {assessmentProfile.missing_skills.map((skill, idx) => (
                      <span key={idx} className="missing-pill">
                        <i className="bi bi-bullseye"></i> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Career Readiness Pillars */}
            <div className="assessment-overview-card">
              <span className="student-section-label">COMPETENCY READINESS</span>
              <h4 style={{ margin: "0.2rem 0 1rem", fontSize: "1.1rem", fontWeight: 700, color: "#1e293b" }}>
                Pillars of Career Preparation
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {(categories.length > 0
                  ? categories
                  : [
                      { name: "Technical Skills", value: metrics.roadmapProgress || 0, icon: "bi-code-slash" },
                      { name: "Learning Progress", value: metrics.roadmapProgress || 0, icon: "bi-book" },
                      { name: "Practical Experience", value: metrics.taskPercent || 0, icon: "bi-kanban" },
                      { name: "Knowledge Assessment", value: parseInt(metrics.averageQuizScore) || 0, icon: "bi-patch-question" },
                    ]
                ).map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>
                      <span>
                        <i className={`bi ${cat.icon || "bi-circle"}`} style={{ marginRight: "0.4rem", color: "#4f46e5" }}></i>
                        {cat.name}
                      </span>
                      <span>{cat.value}%</span>
                    </div>
                    <div style={{ height: "7px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(100, Math.max(0, cat.value))}%`,
                          background:
                            cat.value >= 75
                              ? "#10b981"
                              : cat.value >= 40
                              ? "#4f46e5"
                              : "#f59e0b",
                          borderRadius: "9999px",
                          transition: "width 0.4s ease",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Achievements & Career Assessments History */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
          {/* Achievements Card */}
          <div className="student-card" style={{ height: "100%" }}>
            <div className="student-card-header" style={{ marginBottom: "1rem" }}>
              <div>
                <span className="student-section-label">MILESTONES & ACHIEVEMENTS</span>
                <h3 style={{ margin: "0.25rem 0", fontSize: "1.2rem", fontWeight: "600" }}>
                  {careerName} Badges
                </h3>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    background: ach.achieved ? "rgba(16, 185, 129, 0.08)" : "rgba(100, 116, 139, 0.06)",
                    border: ach.achieved ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(148, 163, 184, 0.2)",
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
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${ach.icon || "bi-trophy"}`}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                      <strong style={{ fontSize: "0.92rem", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ach.title}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "9999px",
                          background: ach.achieved ? "#dcfce7" : "#f1f5f9",
                          color: ach.achieved ? "#15803d" : "#64748b",
                          flexShrink: 0,
                        }}
                      >
                        {ach.achieved ? (ach.badge || "Earned") : "In Progress"}
                      </span>
                    </div>
                    <small style={{ color: "#64748b", fontSize: "0.78rem", display: "block", marginTop: "0.15rem" }}>
                      {ach.description}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Assessments & Quiz Scores */}
          <div className="student-card" style={{ height: "100%" }}>
            <div className="student-card-header" style={{ marginBottom: "1rem" }}>
              <div>
                <span className="student-section-label">ASSESSMENTS</span>
                <h3 style={{ margin: "0.25rem 0", fontSize: "1.2rem", fontWeight: "600" }}>
                  {careerName} Quiz Scores
                </h3>
              </div>
            </div>

            {recentQuizzes.length === 0 ? (
              <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#64748b" }}>
                <i className="bi bi-journal-check" style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.75rem", color: "#cbd5e1" }}></i>
                <h4 style={{ margin: "0 0 0.4rem 0", color: "#334155" }}>No Quizzes Completed for {careerName}</h4>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  Test your technical domain knowledge on skills in your {careerName} roadmap.
                </p>
                <a href="/student/quizzes" className="student-primary-btn" style={{ display: "inline-block", marginTop: "1rem" }}>
                  Take a {careerName} Quiz
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentQuizzes.map((q, idx) => (
                  <div key={idx} className="quiz-item-row">
                    <div>
                      <strong style={{ display: "block", fontSize: "0.92rem", color: "#1e293b" }}>
                        {q.quizTitle}
                      </strong>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                        {q.skill && (
                          <span style={{ fontSize: "0.72rem", background: "#e2e8f0", color: "#334155", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                            {q.skill}
                          </span>
                        )}
                        <small style={{ color: "#64748b" }}>Completed {q.date}</small>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span className={`quiz-score-badge ${q.passed ? "passed" : "review"}`}>
                        {q.score} / {q.total} ({q.percent}%)
                      </span>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                  <a href="/student/quizzes" className="progress-section-link">
                    Take More {careerName} Quizzes <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Career Learning Workspace Activity */}
        <section className="workspace-progress-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.65 }}>
                HANDS-ON LEARNING WORKSPACE
              </span>
              <h3 style={{ margin: "0.25rem 0 0.2rem", fontSize: "1.15rem", fontWeight: 700 }}>
                {careerName} Skill Practice
              </h3>
              <p style={{ margin: 0, fontSize: "0.83rem", opacity: 0.75 }}>
                Verified lessons, code submissions, and practice exercises completed for {careerName} skills.
              </p>
            </div>
            <a
              href="/student/learning-workspace"
              style={{
                color: "#93c5fd",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              Open Learning Workspace <i className="bi bi-arrow-right"></i>
            </a>
          </div>

          <div className="workspace-stats-grid">
            {[
              { label: "Lessons Verified", value: verifiedCount, icon: "bi-book", color: "#60a5fa" },
              { label: "Practices Submitted", value: practiceCount, icon: "bi-code-slash", color: "#34d399" },
              { label: "Skill Quizzes Passed", value: passedQuizzes, icon: "bi-patch-check", color: "#f59e0b" },
              { label: "Skills Completed", value: lwCompletedCount, icon: "bi-trophy", color: "#a78bfa" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="workspace-stat-item">
                <i className={`bi ${icon}`} style={{ fontSize: "1.4rem", color, display: "block", marginBottom: "0.4rem" }}></i>
                <strong style={{ display: "block", fontSize: "1.5rem", fontWeight: 800 }}>{value}</strong>
                <span style={{ fontSize: "0.74rem", opacity: 0.75 }}>{label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
};

export default StudentProgress;
