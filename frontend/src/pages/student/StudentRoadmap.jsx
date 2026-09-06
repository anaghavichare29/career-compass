import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentRoadmap.css";

const aiRoadmapInsight = {
  title: "Your roadmap has been personalized",
  message:
    "Your roadmap is generated from your career assessment, prioritizing skills you still need to develop.",
  updated: "Updated after your latest assessment",
};

const aiLearningInsight = {
  title: "Keep building on your current stage",
  description:
    "Completing tasks for your current stage will move you closer to your next roadmap milestone.",
  recommendations: [
    "Review your current stage's skills",
    "Complete the assigned tasks for this stage",
    "Take the related quiz to test your progress",
  ],
};

const STAGE_ICONS = {
  Foundation: "bi-signpost-2",
  "Core Skills": "bi-database",
  Specialization: "bi-diagram-3",
  "Portfolio & Projects": "bi-briefcase",
};

const StudentRoadmap = () => {
  const [stages, setStages] = useState([]);
  const [topCareerName, setTopCareerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const [roadmapRes, careersRes] = await Promise.all([
          api.get("roadmaps/", { params: { user_id: user?.user_id } }),
          api.get("careers/", { params: { user_id: user?.user_id } }),
        ]);

        setStages(roadmapRes.data);
        if (careersRes.data.length > 0) {
          setTopCareerName(careersRes.data[0].career_name);
        }
      } catch (err) {
        console.error("Failed to load roadmap:", err);
        setError("Could not load your roadmap right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <StudentLayout pageTitle="Career Roadmap">
        <div className="roadmap-page">
          <p>Loading your roadmap...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout pageTitle="Career Roadmap">
        <div className="roadmap-page">
          <p>{error}</p>
        </div>
      </StudentLayout>
    );
  }

  if (stages.length === 0) {
    return (
      <StudentLayout pageTitle="Career Roadmap">
        <div className="roadmap-page">
          <section className="roadmap-introduction">
            <span className="student-section-label">YOUR CAREER PATH</span>
            <h1>Career Roadmap</h1>
            <p>
              You don't have a roadmap yet. Complete the career assessment
              first so we can generate one for you.
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

  const completedStages = stages.filter((s) => s.status === "completed").length;
  const totalStages = stages.length;

  const allSkills = stages.flatMap((s) => s.skills);
  const overallProgress = allSkills.length
    ? Math.round(allSkills.reduce((sum, sk) => sum + sk.progress, 0) / allSkills.length)
    : 0;

  // Find the first "current" skill across all stages for the Next Best Step card
  let nextBestSkill = null;
  for (const stage of stages) {
    const found = stage.skills.find((sk) => sk.status === "current");
    if (found) {
      nextBestSkill = { ...found, stageName: stage.name };
      break;
    }
  }

  return (
    <StudentLayout pageTitle="Career Roadmap">
      <div className="roadmap-page">

        <section className="roadmap-introduction">
          <span className="student-section-label">YOUR CAREER PATH</span>
          <h1>Career Roadmap</h1>
          <p>
            Follow a personalized path to build the skills, experience and
            confidence required for your recommended career.
          </p>
        </section>

        <section className="roadmap-overview-card">
          <div className="roadmap-overview-main">
            <div className="roadmap-career-icon">
              <i className="bi bi-bar-chart-line"></i>
            </div>
            <div>
              <span className="roadmap-small-label">TARGET CAREER</span>
              <h2>{topCareerName || "Your Career Path"}</h2>
              <p>
                Your roadmap combines your career recommendation, skill gaps
                and learning progress into a structured career path.
              </p>
            </div>
          </div>

          <div className="roadmap-overview-progress">
            <div className="roadmap-progress-circle">
              <strong>{overallProgress}%</strong>
              <span>Complete</span>
            </div>
            <div>
              <span className="roadmap-small-label">ROADMAP PROGRESS</span>
              <h3>{completedStages} of {totalStages} stages</h3>
              <div className="roadmap-main-progress">
                <div style={{ width: `${overallProgress}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="ai-roadmap-card">
          <div className="ai-roadmap-icon">
            <i className="bi bi-stars"></i>
          </div>
          <div className="ai-roadmap-content">
            <div className="ai-roadmap-title-row">
              <div>
                <span className="ai-label">AI PERSONALIZATION</span>
                <h2>{aiRoadmapInsight.title}</h2>
              </div>
              <span className="ai-ready-badge">AI Ready</span>
            </div>
            <p>{aiRoadmapInsight.message}</p>
            <span className="ai-updated">
              <i className="bi bi-clock"></i>
              {aiRoadmapInsight.updated}
            </span>
          </div>
        </section>

        <section className="roadmap-ai-grid">
          <div className="next-step-card">
            <div className="next-step-header">
              <div>
                <span className="ai-label">AI RECOMMENDATION</span>
                <h2>Your Next Best Step</h2>
              </div>
              <div className="next-step-ai-icon">
                <i className="bi bi-bullseye"></i>
              </div>
            </div>

            {nextBestSkill ? (
              <>
                <div className="next-step-main">
                  <div className="next-step-skill-icon">
                    <i className="bi bi-database"></i>
                  </div>
                  <div>
                    <span>Recommended focus</span>
                    <h3>{nextBestSkill.name}</h3>
                    <p>
                      This skill is part of your {nextBestSkill.stageName} stage
                      and is important for your target career.
                    </p>
                  </div>
                </div>

                <div className="next-step-progress">
                  <div className="next-step-progress-label">
                    <span>Current progress</span>
                    <strong>{nextBestSkill.progress}%</strong>
                  </div>
                  <div className="next-step-progress-track">
                    <div style={{ width: `${nextBestSkill.progress}%` }}></div>
                  </div>
                </div>

                <div className="next-step-footer">
                  <span className="priority-badge">
                    <i className="bi bi-flag-fill"></i>
                    High Priority
                  </span>
                  <button
                    className="student-primary-btn"
                    onClick={() => (window.location.href = "/student/tasks")}
                  >
                    Start Learning
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </>
            ) : (
              <p>All your roadmap skills are complete — great work!</p>
            )}
          </div>

          <div className="readiness-card">
            <div className="readiness-header">
              <div>
                <span className="ai-label">AI-ESTIMATED</span>
                <h2>Career Readiness</h2>
              </div>
              <div className="readiness-score">{overallProgress}%</div>
            </div>
            <p className="readiness-description">
              Your current readiness is estimated from your skills, learning
              progress and completed activities.
            </p>

            <div className="readiness-bars">
              {stages.map((stage) => {
                const stageAvg = stage.skills.length
                  ? Math.round(
                      stage.skills.reduce((sum, sk) => sum + sk.progress, 0) /
                        stage.skills.length
                    )
                  : 0;
                return (
                  <div className="readiness-item" key={stage.id}>
                    <div className="readiness-item-label">
                      <span>{stage.name}</span>
                      <strong>{stageAvg}%</strong>
                    </div>
                    <div className="readiness-track">
                      <div style={{ width: `${stageAvg}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="roadmap-section-heading">
          <div>
            <span className="student-section-label">LEARNING JOURNEY</span>
            <h2>Your Roadmap</h2>
          </div>
          <span className="roadmap-stage-count">{totalStages} Stages</span>
        </div>

        <section className="roadmap-timeline">
          {stages.map((stage, index) => (
            <div className={`roadmap-stage-card ${stage.status}`} key={stage.id}>
              <div className="roadmap-timeline-column">
                <div className="roadmap-stage-number">
                  {stage.status === "completed" ? (
                    <i className="bi bi-check-lg"></i>
                  ) : (
                    stage.order
                  )}
                </div>
                {index !== stages.length - 1 && (
                  <div className="roadmap-timeline-line"></div>
                )}
              </div>

              <div className="roadmap-stage-content">
                <div className="roadmap-stage-header">
                  <div>
                    <div className="roadmap-stage-title-row">
                      <h3>{stage.name}</h3>
                      <span className={`roadmap-status ${stage.status}`}>
                        {stage.status === "completed"
                          ? "Completed"
                          : stage.status === "current"
                          ? "Currently Learning"
                          : "Upcoming"}
                      </span>
                    </div>
                    <span className="roadmap-duration">
                      <i className="bi bi-clock"></i>
                      {stage.duration}
                    </span>
                  </div>
                </div>

                <p className="roadmap-stage-description">{stage.description}</p>

                <div className="roadmap-skills-grid">
                  {stage.skills.map((skill) => (
                    <div
                      className={`roadmap-skill-card ${skill.status}`}
                      key={skill.id}
                    >
                      <div className="roadmap-skill-top">
                        <div className="roadmap-skill-icon">
                          {skill.status === "completed" ? (
                            <i className="bi bi-check-lg"></i>
                          ) : skill.status === "current" ? (
                            <i className="bi bi-play-fill"></i>
                          ) : (
                            <i className="bi bi-lock"></i>
                          )}
                        </div>
                        <span>{skill.progress}%</span>
                      </div>

                      <strong>{skill.name}</strong>

                      <div className="roadmap-skill-progress">
                        <div style={{ width: `${skill.progress}%` }}></div>
                      </div>

                      <small>
                        {skill.status === "completed"
                          ? "Completed"
                          : skill.status === "current"
                          ? "In progress"
                          : "Upcoming"}
                      </small>
                    </div>
                  ))}
                </div>

                <div className="roadmap-stage-footer">
                  {stage.status === "current" ? (
                    <button
                      className="student-primary-btn"
                      onClick={() => (window.location.href = "/student/tasks")}
                    >
                      Continue Learning
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  ) : stage.status === "completed" ? (
                    <span className="roadmap-completed-label">
                      <i className="bi bi-check-circle-fill"></i>
                      Stage Completed
                    </span>
                  ) : (
                    <span className="roadmap-upcoming-label">
                      <i className="bi bi-lock"></i>
                      Upcoming Stage
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="ai-learning-insight">
          <div className="learning-insight-icon">
            <i className="bi bi-lightbulb"></i>
          </div>
          <div className="learning-insight-content">
            <span className="ai-label">AI LEARNING INSIGHT</span>
            <h2>{aiLearningInsight.title}</h2>
            <p>{aiLearningInsight.description}</p>

            <div className="learning-recommendations">
              {aiLearningInsight.recommendations.map((recommendation, index) => (
                <div className="learning-recommendation" key={recommendation}>
                  <span>{index + 1}</span>
                  <p>{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            className="insight-action-btn"
            onClick={() => (window.location.href = "/student/tasks")}
          >
            View Tasks
            <i className="bi bi-arrow-right"></i>
          </button>
        </section>

        <section className="adaptive-roadmap-card">
          <div className="adaptive-icon">
            <i className="bi bi-arrow-repeat"></i>
          </div>
          <div>
            <span className="student-section-label">ADAPTIVE ROADMAP</span>
            <h2>Your roadmap can evolve with you</h2>
            <p>
              As you complete tasks, improve your skills, take quizzes and
              receive feedback, your personalized roadmap can be updated to
              reflect your progress.
            </p>
          </div>
        </section>

        <section className="roadmap-next-step">
          <div className="roadmap-next-icon">
            <i className="bi bi-clipboard-check"></i>
          </div>
          <div className="roadmap-next-content">
            <span className="student-section-label">KEEP GOING</span>
            <h2>Turn your roadmap into action</h2>
            <p>
              Complete your assigned learning tasks and keep progressing
              through your career roadmap.
            </p>
          </div>
          <button
            className="student-primary-btn"
            onClick={() => (window.location.href = "/student/tasks")}
          >
            View My Tasks
            <i className="bi bi-arrow-right"></i>
          </button>
        </section>

      </div>
    </StudentLayout>
  );
};

export default StudentRoadmap;