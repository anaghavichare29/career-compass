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

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await api.get("careers/", {
          params: { user_id: user?.user_id },
        });
        setRecommendations(response.data);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
        setError("Could not load your recommendations right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

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

  const [topCareer, ...otherCareers] = recommendations;
  const topCareerSkills = [
    ...topCareer.matched_skills.map((name) => ({ name, status: "Strong" })),
    ...topCareer.missing_skills.map((name) => ({ name, status: "Developing" })),
  ];

  return (
    <StudentLayout pageTitle="Recommendations">
      <div className="recommendations-page">

        <section className="recommendations-introduction">
          <span className="student-section-label">CAREER GUIDANCE</span>
          <h1>Your Career Recommendations</h1>
          <p>
            Explore career paths that align with your interests, skills,
            aptitude and academic background.
          </p>
        </section>

        <div className="recommendation-ai-note">
          <div className="recommendation-ai-icon">
            <i className="bi bi-stars"></i>
          </div>
          <div>
            <strong>Personalized for you</strong>
            <p>
              These recommendations are based on your career assessment and
              current profile.
            </p>
          </div>
        </div>

        <section className="top-career-card">
          <div className="top-career-content">
            <span className="student-section-label">TOP CAREER MATCH</span>

            <div className="top-career-title-row">
              <div>
                <h2>{topCareer.career_name}</h2>
                <span className="strong-match">
                  <i className="bi bi-check-circle-fill"></i>
                  Strong Match
                </span>
              </div>
              <div className="career-match-circle">
                {topCareer.match_percent}%
              </div>
            </div>

            <p className="top-career-description">{topCareer.description}</p>

            <div className="recommendation-match-progress">
              <div className="match-progress-label">
                <span>Career Match</span>
                <strong>{topCareer.match_percent}%</strong>
              </div>
              <div className="match-progress-track">
                <div style={{ width: `${topCareer.match_percent}%` }}></div>
              </div>
            </div>

            <div className="recommended-skills">
              <span className="skills-heading">Key Skills</span>
              <div className="recommendation-skill-tags">
                {topCareerSkills.map((skill) => (
                  <span
                    key={skill.name}
                    className={
                      skill.status === "Strong"
                        ? "skill-tag strong"
                        : "skill-tag developing"
                    }
                  >
                    <i
                      className={`bi ${
                        skill.status === "Strong"
                          ? "bi-check-circle-fill"
                          : "bi-arrow-up-circle"
                      }`}
                    ></i>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            <button
              className="student-primary-btn"
              onClick={() => (window.location.href = "/student/roadmap")}
            >
              Explore Career Path
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>

          <div className="top-career-summary">
            <div className="summary-header">
              <span>Why this career?</span>
              <i className="bi bi-compass"></i>
            </div>

            {topCareer.matched_skills.slice(0, 3).map((skill) => (
              <div className="summary-item" key={skill}>
                <i className="bi bi-check-circle-fill"></i>
                <span>Strong in {skill}</span>
              </div>
            ))}

            {topCareer.missing_skills.slice(0, 2).map((skill) => (
              <div className="summary-item" key={skill}>
                <i className="bi bi-arrow-up-circle"></i>
                <span>{skill} can be improved</span>
              </div>
            ))}
          </div>
        </section>

        <section className="recommendation-section">
          <div className="recommendation-section-heading">
            <div>
              <span className="student-section-label">YOUR PROFILE</span>
              <h2>Why this career matches you</h2>
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

        {otherCareers.length > 0 && (
          <section className="recommendation-section">
            <div className="recommendation-section-heading">
              <div>
                <span className="student-section-label">EXPLORE OPTIONS</span>
                <h2>Other Recommended Careers</h2>
                <p>Explore other career paths that may also suit your profile.</p>
              </div>
              <span className="recommendation-count">
                {otherCareers.length} Careers
              </span>
            </div>

            <div className="recommended-careers-grid">
              {otherCareers.map((career) => (
                <div className="recommended-career-card" key={career.id}>
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

                  <div className="career-card-skills">
                    {[...career.matched_skills, ...career.missing_skills]
                      .slice(0, 3)
                      .map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                  </div>

                  <button
                    className="career-explore-btn"
                    onClick={() => (window.location.href = "/student/roadmap")}
                  >
                    Explore Career
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="recommendation-next-step">
          <div className="next-step-icon">
            <i className="bi bi-map"></i>
          </div>
          <div className="next-step-content">
            <span className="student-section-label">NEXT STEP</span>
            <h2>Ready to build your career path?</h2>
            <p>
              Explore a structured roadmap designed to help you develop the
              skills required for your recommended career.
            </p>
          </div>
          <button
            className="student-primary-btn"
            onClick={() => (window.location.href = "/student/roadmap")}
          >
            View Career Roadmap
            <i className="bi bi-arrow-right"></i>
          </button>
        </section>

      </div>
    </StudentLayout>
  );
};

export default StudentRecommendations;