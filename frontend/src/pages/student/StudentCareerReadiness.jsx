import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import CareerPathSelector from "../../components/student/CareerPathSelector";
import "./StudentCareerReadiness.css";

const StudentCareerReadiness = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCareerReadiness = async (careerOverride = null) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?.user_id;
      const selectedCareer = careerOverride || JSON.parse(localStorage.getItem("selectedCareer") || "null");
      
      const params = userId ? { user_id: userId } : {};
      if (selectedCareer?.career_name) params.career_name = selectedCareer.career_name;

      let response;
      try {
        response = await api.get("students/career-readiness/", { params });
      } catch {
        response = await api.get("progress/insights/", { params });
      }
      setData(response.data);
    } catch (err) {
      console.error("Failed to load career readiness:", err);
      setError("Could not load your career readiness right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCareerReadiness();
  }, []);

  if (loading) {
    return (
      <StudentLayout pageTitle="Career Readiness">
        <div className="career-readiness-page" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <div className="student-loading-spinner" style={{ fontSize: "2.5rem", color: "#3b82f6", marginBottom: "1rem" }}>
            <i className="bi bi-arrow-repeat bi-spin"></i>
          </div>
          <h2 style={{ color: "#1e293b", fontWeight: 700 }}>Calculating Career Readiness...</h2>
          <p style={{ color: "#64748b" }}>Analyzing your skills, course milestones, and quiz results</p>
        </div>
      </StudentLayout>
    );
  }

  if (error && !data) {
    return (
      <StudentLayout pageTitle="Career Readiness">
        <div className="career-readiness-page">
          <section className="readiness-introduction">
            <span className="student-section-label">CAREER PREPARATION</span>
            <h1>Career Readiness</h1>
            <p>{error}</p>
          </section>
          <button
            className="student-primary-btn"
            onClick={() => (window.location.href = "/student/assessment")}
          >
            Take the Assessment
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </StudentLayout>
    );
  }

  if (data && data.has_data === false) {
    return (
      <StudentLayout pageTitle="Career Readiness">
        <div className="career-readiness-page">
          <section className="readiness-introduction">
            <span className="student-section-label">CAREER PREPARATION</span>
            <h1>Career Readiness</h1>
            <p>
              Take the career assessment first. Your results are calculated from your
              recommended career and your real progress, so there is nothing to show yet.
            </p>
          </section>
          <button
            className="student-primary-btn"
            onClick={() => (window.location.href = "/student/assessment")}
          >
            Take the Assessment
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </StudentLayout>
    );
  }

  const r = data?.readiness || {
    overall: data?.overall || 0,
    insight: "Complete your learning tasks and quizzes to build your career readiness.",
    skill_progress: 0,
    roadmap_progress: 0,
    level: "Getting Started",
    level_note: "Work through your roadmap one step at a time.",
    categories: data?.categories || [],
    strengths: data?.strengths || [],
    improvement_areas: data?.improvementAreas || data?.improvement_areas || [],
    next_steps: data?.next_steps || [],
  };

  const targetCareer = data?.target_career || data?.targetCareer || "";
  const careerMatch = data?.career_match ?? data?.careerMatch ?? 0;

  return (
    <StudentLayout pageTitle="Career Readiness">
      <div className="career-readiness-page">
        <CareerPathSelector onCareerChange={(career) => loadCareerReadiness(career)} selectedCareerName={targetCareer} />

        <section className="readiness-introduction">
          <span className="student-section-label">CAREER PREPARATION</span>
          <h1>Career Readiness</h1>
          <p>
            Track how prepared you are for your recommended career and
            identify the areas you should focus on next.
          </p>
        </section>

        <section className="readiness-overview">
          <div className="readiness-score">
            <div
              className="readiness-circle"
              style={{
                background: `conic-gradient(#2f5bea ${r.overall * 3.6}deg, #e9edf5 0deg)`,
              }}
            >
              <div className="readiness-circle-inner">
                <strong>{r.overall}%</strong>
                <span>Ready</span>
              </div>
            </div>
          </div>

          <div className="readiness-overview-content">
            <span className="student-section-label">YOUR TARGET CAREER</span>
            <h2>{targetCareer}</h2>
            <p>{r.insight}</p>

            <div className="readiness-overview-meta">
              <div>
                <span>Career Match</span>
                <strong>{careerMatch}%</strong>
              </div>
              <div>
                <span>Skill Progress</span>
                <strong>{r.skill_progress}%</strong>
              </div>
              <div>
                <span>Learning Progress</span>
                <strong>{r.roadmap_progress}%</strong>
              </div>
            </div>
          </div>

          <div className="readiness-level">
            <span>READINESS LEVEL</span>
            <strong>{r.level}</strong>
            <p>{r.level_note}</p>
          </div>
        </section>

        <section className="readiness-section">
          <div className="readiness-section-header">
            <div>
              <span className="student-section-label">READINESS BREAKDOWN</span>
              <h2>Your Career Preparation</h2>
              <p>See how different areas contribute to your overall career readiness.</p>
            </div>
          </div>

          <div className="readiness-category-grid">
            {r.categories.map((category) => (
              <article className="readiness-category-card" key={category.name}>
                <div className="readiness-category-top">
                  <div className={`readiness-category-icon ${category.color}`}>
                    <i className={`bi ${category.icon}`}></i>
                  </div>
                  <strong>{category.value}%</strong>
                </div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className="readiness-progress-track">
                  <div
                    className={`readiness-progress-fill ${category.color}`}
                    style={{ width: `${category.value}%` }}
                  ></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="readiness-two-column">
          <div className="readiness-panel">
            <div className="readiness-panel-header">
              <div className="readiness-panel-icon green">
                <i className="bi bi-check-circle"></i>
              </div>
              <div>
                <span className="student-section-label">YOUR STRENGTHS</span>
                <h2>What you're doing well</h2>
              </div>
            </div>

            <div className="strength-list">
              {r.strengths.map((strength, index) => (
                <div className="strength-item" key={strength}>
                  <div className="strength-number">0{index + 1}</div>
                  <span>{strength}</span>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              ))}
            </div>
          </div>

          <div className="readiness-panel">
            <div className="readiness-panel-header">
              <div className="readiness-panel-icon orange">
                <i className="bi bi-arrow-up-circle"></i>
              </div>
              <div>
                <span className="student-section-label">FOCUS AREAS</span>
                <h2>Improve these areas</h2>
              </div>
            </div>

            <div className="improvement-list">
              {r.improvement_areas.length === 0 && (
                <p>You meet every target. Nice work!</p>
              )}
              {r.improvement_areas.map((area) => (
                <div className="improvement-item" key={area.name}>
                  <div className="improvement-item-top">
                    <strong>{area.name}</strong>
                    <span>{Math.max(area.target - area.progress, 0)}% gap</span>
                  </div>
                  <div className="improvement-track">
                    <div style={{ width: `${area.progress}%` }}></div>
                  </div>
                  <div className="improvement-meta">
                    <span>Current {area.progress}%</span>
                    <span>Target {area.target}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="next-steps-card">
          <div className="next-steps-icon">
            <i className="bi bi-signpost-2"></i>
          </div>
          <div className="next-steps-content">
            <span className="student-section-label">NEXT STEPS</span>
            <h2>Keep moving toward your career goal</h2>
            <p>
              These steps are picked from your current skill gaps and activity.
            </p>
            <div className="next-step-list">
              {r.next_steps.map((step, index) => (
                <div key={step}>
                  <span>0{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </StudentLayout>
  );
};

export default StudentCareerReadiness;
