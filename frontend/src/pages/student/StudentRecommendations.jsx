import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentRecommendations.css";

const CAREER_ICONS = {
  "Data Analyst": "bi-bar-chart-line",
  "Data Scientist": "bi-bar-chart-line",
  "Software Engineer": "bi-code-slash",
  "Product Manager": "bi-briefcase",
  "UX/UI Designer": "bi-palette",
  "Cybersecurity Analyst": "bi-shield-lock",
  "Cloud Engineer": "bi-cloud",
  "AI/ML Engineer": "bi-cpu",
  "Full Stack Developer": "bi-code-square",
  "Business Analyst": "bi-graph-up",
  "DevOps Engineer": "bi-gear",
  "Mobile App Developer": "bi-phone",
  "Blockchain Developer": "bi-link-45deg",
  "Game Developer": "bi-controller",
  "Network Engineer": "bi-hdd-network",
  "Embedded Systems Engineer": "bi-cpu-fill",
  "Data Engineer": "bi-database",
  "Scrum Master": "bi-kanban",
  "Digital Marketing Analyst": "bi-megaphone",
};

const matchFactors = [
  {
    title: "Interests",
    value: "Based on your answers",
    description:
      "Your interests were compared against the tags associated with each career.",
    icon: "bi-stars",
  },
  {
    title: "Aptitude",
    value: "Based on your answers",
    description:
      "Your problem-solving and work-style answers were factored into your match.",
    icon: "bi-lightbulb",
  },
  {
    title: "Skills",
    value: "Based on your answers",
    description:
      "Skills you rated yourself confident in were matched against each career's requirements.",
    icon: "bi-bar-chart",
  },
  {
    title: "Academic Background",
    value: "On file",
    description:
      "Your academic background is stored with your assessment for future reference.",
    icon: "bi-mortarboard",
  },
];

const StudentRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCareer, setSelectedCareer] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await api.get("careers/", {
          params: { user_id: user?.user_id },
        });
        const data = response.data;
        setRecommendations(data);

        // Check if there is already a persisted selected career
        const saved = localStorage.getItem("selectedCareer");
        if (saved) {
          try {
            setSelectedCareer(JSON.parse(saved));
          } catch {
            // ignore – fall through to default
          }
        } else if (data.length > 0) {
          // Auto-select the top match if nothing was previously chosen
          setSelectedCareer(data[0]);
          localStorage.setItem("selectedCareer", JSON.stringify(data[0]));
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
        setError("Could not load your recommendations right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleSelectCareer = (career) => {
    setSelectedCareer(career);
    localStorage.setItem("selectedCareer", JSON.stringify(career));
    window.dispatchEvent(new CustomEvent("selectedCareerChanged", { detail: career }));
  };

  const handleExploreCareer = (career) => {
    handleSelectCareer(career);
    window.location.href = "/student/roadmap";
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Recommendations">
        <div className="recommendations-page">
          <p>Loading your recommendations...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout pageTitle="Recommendations">
        <div className="recommendations-page">
          <p>{error}</p>
        </div>
      </StudentLayout>
    );
  }

  if (recommendations.length === 0) {
    return (
      <StudentLayout pageTitle="Recommendations">
        <div className="recommendations-page">
          <section className="recommendations-introduction">
            <span className="student-section-label">CAREER GUIDANCE</span>
            <h1>Your Career Recommendations</h1>
            <p>
              You haven't taken the career assessment yet. Complete it to see
              career paths matched to your interests, skills and aptitude.
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

  return (
    <StudentLayout pageTitle="Recommendations">
      <div className="recommendations-page">

        <section className="recommendations-introduction">
          <span className="student-section-label">CAREER GUIDANCE</span>
          <h1>Your Career Recommendations</h1>
          <p>
            Based on your assessment, here are 5 career paths matched to your
            interests, skills and aptitude. Select any career to explore its
            roadmap, skill gap and progress.
          </p>
        </section>

        <div className="recommendation-ai-note">
          <div className="recommendation-ai-icon">
            <i className="bi bi-stars"></i>
          </div>
          <div>
            <strong>Personalized for you</strong>
            <p>
              These recommendations are based on your career assessment. Click
              <strong> "Select This Career"</strong> on any card to explore its
              roadmap and skill gap analysis.
            </p>
          </div>
        </div>

        {/* All 5 career cards — selectable */}
        <section className="recommendation-section">
          <div className="recommendation-section-heading">
            <div>
              <span className="student-section-label">YOUR MATCHES</span>
              <h2>Select a Career to Explore</h2>
              <p>Choose any of your top career matches to get a detailed roadmap, skill gap analysis and progress tracking.</p>
            </div>
            <span className="recommendation-count">
              {recommendations.length} Careers
            </span>
          </div>

          <div className="recommended-careers-grid">
            {recommendations.map((career, idx) => {
              const isSelected = selectedCareer?.career_name === career.career_name || selectedCareer?.id === career.id;
              const careerSkills = [
                ...career.matched_skills.map((name) => ({ name, status: "Strong" })),
                ...career.missing_skills.map((name) => ({ name, status: "Developing" })),
              ];

              return (
                <div
                  className={`recommended-career-card selectable ${isSelected ? "career-selected" : ""} ${idx === 0 ? "top-match" : ""}`}
                  key={career.id}
                >
                  {idx === 0 && (
                    <div className="top-match-badge">
                      <i className="bi bi-trophy-fill"></i> Top Match
                    </div>
                  )}

                  <div className="career-card-top">
                    <div className="career-card-icon">
                      <i
                        className={`bi ${
                          CAREER_ICONS[career.career_name] || "bi-briefcase"
                        }`}
                      ></i>
                    </div>
                    <div className="career-card-match">
                      {career.match_percent}% Match
                    </div>
                  </div>

                  <h3>{career.career_name}</h3>
                  <p>{career.description}</p>

                  {/* Match progress bar */}
                  <div className="career-match-bar">
                    <div className="career-match-bar-fill" style={{ width: `${career.match_percent}%` }}></div>
                  </div>

                  <div className="career-card-skills">
                    {careerSkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill.name}
                        className={skill.status === "Strong" ? "skill-tag-strong" : "skill-tag-developing"}
                      >
                        <i className={`bi ${skill.status === "Strong" ? "bi-check-circle-fill" : "bi-arrow-up-circle"}`}></i>
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  <div className="career-card-actions">
                    <button
                      className={`career-select-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectCareer(career)}
                    >
                      {isSelected ? (
                        <>
                          <i className="bi bi-check-circle-fill"></i>
                          Selected
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cursor"></i>
                          Select This Career
                        </>
                      )}
                    </button>
                    <button
                      className="career-explore-btn"
                      onClick={() => handleExploreCareer(career)}
                    >
                      Explore Roadmap
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why these match you */}
        <section className="recommendation-section">
          <div className="recommendation-section-heading">
            <div>
              <span className="student-section-label">YOUR PROFILE</span>
              <h2>Why these careers match you</h2>
              <p>Your assessment responses indicate alignment across several areas.</p>
            </div>
          </div>

          <div className="match-factors-grid">
            {matchFactors.map((factor) => (
              <div className="match-factor-card" key={factor.title}>
                <div className="match-factor-icon">
                  <i className={`bi ${factor.icon}`}></i>
                </div>
                <div className="match-factor-content">
                  <div className="match-factor-title">
                    <h3>{factor.title}</h3>
                    <span>{factor.value}</span>
                  </div>
                  <p>{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Next step */}
        {selectedCareer && (
          <section className="recommendation-next-step">
            <div className="next-step-icon">
              <i className="bi bi-map"></i>
            </div>
            <div className="next-step-content">
              <span className="student-section-label">NEXT STEP</span>
              <h2>Ready to explore {selectedCareer.career_name}?</h2>
              <p>
                View a structured roadmap, identify your skill gaps and track
                your progress toward this career.
              </p>
            </div>
            <div className="next-step-action-group">
              <button
                className="student-primary-btn"
                onClick={() => (window.location.href = "/student/roadmap")}
              >
                View Career Roadmap
                <i className="bi bi-arrow-right"></i>
              </button>
              <button
                className="assessment-secondary-btn"
                onClick={() => (window.location.href = "/student/skill-gap")}
              >
                Skill Gap Analysis
                <i className="bi bi-bar-chart"></i>
              </button>
            </div>
          </section>
        )}

        {!selectedCareer && (
          <section className="recommendation-next-step">
            <div className="next-step-icon">
              <i className="bi bi-map"></i>
            </div>
            <div className="next-step-content">
              <span className="student-section-label">NEXT STEP</span>
              <h2>Select a career to get started</h2>
              <p>
                Choose one of the career recommendations above to view its
                personalized roadmap, skill gap and progress tracker.
              </p>
            </div>
          </section>
        )}

      </div>
    </StudentLayout>
  );
};

export default StudentRecommendations;