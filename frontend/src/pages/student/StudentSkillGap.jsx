import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentSkillGap.css";

const StudentSkillGap = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const userId = user?.user_id;

        let response;
        try {
          response = await api.get("students/skill-gap/", {
            params: userId ? { user_id: userId } : {},
          });
        } catch {
          response = await api.get("progress/insights/", {
            params: userId ? { user_id: userId } : {},
          });
        }
        setData(response.data);
      } catch (err) {
        console.error("Failed to load skill gap:", err);
        setError("Could not load your skill gap right now.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <StudentLayout pageTitle="Skill Gap">
        <div className="skill-gap-page" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <div className="student-loading-spinner" style={{ fontSize: "2.5rem", color: "#3b82f6", marginBottom: "1rem" }}>
            <i className="bi bi-arrow-repeat bi-spin"></i>
          </div>
          <h2 style={{ color: "#1e293b", fontWeight: 700 }}>Analyzing Skill Proficiency...</h2>
          <p style={{ color: "#64748b" }}>Comparing your competencies with industry benchmarks</p>
        </div>
      </StudentLayout>
    );
  }

  if (error && !data) {
    return (
      <StudentLayout pageTitle="Skill Gap">
        <div className="skill-gap-page">
          <section className="skill-gap-introduction">
            <span className="student-section-label">SKILL ANALYSIS</span>
            <h1>Skill Gap</h1>
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

  const targetCareer = data?.target_career || data?.targetCareer || "Data Analyst";
  const careerMatch = data?.career_match || data?.careerMatch || 78;
  const skills = data?.skills || [];
  const summary = data?.skill_summary || data?.summary || {
    overall: 65,
    strong_count: 2,
    improve_count: 3,
    largest_gap: { name: "Python", gap: 35 },
  };
  const insight = data?.skill_insight || data?.insight || {
    title: "Focus on Core Fundamentals",
    description: "Strengthening key technical skills will accelerate your roadmap progress.",
    recommendation: "Take domain quizzes and complete assigned learning tasks.",
  };

  const improvementSkills = skills
    .filter((skill) => skill.current < skill.required)
    .sort((a, b) => (b.required - b.current) - (a.required - a.current));

  return (
    <StudentLayout pageTitle="Skill Gap">
      <div className="skill-gap-page">

        <section className="skill-gap-introduction">
          <span className="student-section-label">SKILL ANALYSIS</span>
          <h1>Skill Gap</h1>
          <p>
            Understand your current skill level and identify the capabilities
            you need to strengthen for your recommended career path.
          </p>
        </section>

        <section className="skill-target-card">
          <div className="skill-target-icon">
            <i className="bi bi-bullseye"></i>
          </div>
          <div className="skill-target-content">
            <span>TARGET CAREER</span>
            <h2>{targetCareer}</h2>
            <p>
              Your skill analysis is based on the skills required for your
              recommended {targetCareer} career path and your progress
              in learning tasks and quizzes.
            </p>
          </div>
          <div className="skill-target-match">
            <span>Career Match</span>
            <strong>{careerMatch}%</strong>
          </div>
        </section>

        <section className="skill-gap-stats">
          <div className="skill-summary-card">
            <div className="skill-summary-icon blue">
              <i className="bi bi-bar-chart-line"></i>
            </div>
            <div>
              <span>Overall Skill Level</span>
              <strong>{summary.overall}%</strong>
              <small>Across {skills.length} career skills</small>
            </div>
          </div>

          <div className="skill-summary-card">
            <div className="skill-summary-icon green">
              <i className="bi bi-check-circle"></i>
            </div>
            <div>
              <span>Strong Skills</span>
              <strong>{summary.strong_count}</strong>
              <small>Meeting career requirements</small>
            </div>
          </div>

          <div className="skill-summary-card">
            <div className="skill-summary-icon orange">
              <i className="bi bi-arrow-up-circle"></i>
            </div>
            <div>
              <span>Skills to Improve</span>
              <strong>{summary.improve_count}</strong>
              <small>Below target level</small>
            </div>
          </div>

          <div className="skill-summary-card">
            <div className="skill-summary-icon purple">
              <i className="bi bi-lightning-charge"></i>
            </div>
            <div>
              <span>Highest Gap</span>
              <strong>{summary.largest_gap ? summary.largest_gap.name : "None"}</strong>
              <small>
                {summary.largest_gap ? `${summary.largest_gap.gap}% gap` : "All targets met"}
              </small>
            </div>
          </div>
        </section>

        <section className="skill-ai-card">
          <div className="skill-ai-icon">
            <i className="bi bi-stars"></i>
          </div>
          <div className="skill-ai-content">
            <span className="ai-label">PERSONALISED SKILL INSIGHT</span>
            <h2>{insight.title}</h2>
            <p>{insight.description}</p>
            <div className="skill-ai-recommendation">
              <i className="bi bi-lightbulb"></i>
              <span>{insight.recommendation}</span>
            </div>
          </div>
          <span className="skill-ai-badge">Live</span>
        </section>

        <section className="skill-analysis-section">
          <div className="skill-section-header">
            <div>
              <span className="student-section-label">YOUR SKILLS</span>
              <h2>Current vs Required</h2>
              <p>
                Compare your current proficiency with the recommended level for
                your target career.
              </p>
            </div>
          </div>

          <div className="skill-list">
            {skills.map((skill) => {
              const gap = Math.max(skill.required - skill.current, 0);
              return (
                <article className="skill-card" key={skill.name}>
                  <div className="skill-card-header">
                    <div className="skill-card-title">
                      <div className={`skill-icon ${skill.color}`}>
                        <i className="bi bi-lightning"></i>
                      </div>
                      <div>
                        <h3>{skill.name}</h3>
                        <span>{skill.category}</span>
                      </div>
                    </div>
                    <span className={`skill-status ${skill.color}`}>{skill.status}</span>
                  </div>

                  <div className="skill-level-row">
                    <div>
                      <span>Current Level</span>
                      <strong>{skill.current}%</strong>
                    </div>
                    <div>
                      <span>Required</span>
                      <strong>{skill.required}%</strong>
                    </div>
                    <div>
                      <span>Skill Gap</span>
                      <strong>{gap}%</strong>
                    </div>
                  </div>

                  <div className="skill-progress-block">
                    <div className="skill-progress-label">
                      <span>Your proficiency</span>
                      <strong>{skill.current}%</strong>
                    </div>
                    <div className="skill-progress-track">
                      <div
                        className={`skill-current-progress ${skill.color}`}
                        style={{ width: `${skill.current}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="skill-progress-block">
                    <div className="skill-progress-label">
                      <span>Career requirement</span>
                      <strong>{skill.required}%</strong>
                    </div>
                    <div className="skill-required-track">
                      <div style={{ width: `${skill.required}%` }}></div>
                    </div>
                  </div>

                  {gap > 0 ? (
                    <div className="skill-action">
                      <i className="bi bi-arrow-right-circle"></i>
                      <span>
                        Focus on {skill.name} to close your {gap}% skill gap.
                      </span>
                    </div>
                  ) : (
                    <div className="skill-complete">
                      <i className="bi bi-check-circle-fill"></i>
                      <span>You have reached the recommended level for this skill.</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {improvementSkills.length > 0 && (
          <section className="priority-section">
            <div className="skill-section-header">
              <div>
                <span className="student-section-label">FOCUS AREAS</span>
                <h2>Skills to Prioritize</h2>
                <p>Focus on these areas to make the most progress toward your career goal.</p>
              </div>
            </div>

            <div className="priority-grid">
              {improvementSkills.slice(0, 3).map((skill, index) => (
                <div className="priority-card" key={skill.name}>
                  <div className="priority-number">0{index + 1}</div>
                  <div className="priority-content">
                    <span>{skill.category}</span>
                    <h3>{skill.name}</h3>
                    <p>{skill.required - skill.current}% gap remaining</p>
                  </div>
                  <i className="bi bi-arrow-up-right"></i>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </StudentLayout>
  );
};

export default StudentSkillGap;
