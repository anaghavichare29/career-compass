import React from "react";
import StudentLayout from "../../components/student/StudentLayout";
import "./StudentCareerReadiness.css";

const readinessData = {
  overall: 76,
  targetCareer: "Data Analyst",

  categories: [
    {
      name: "Technical Skills",
      value: 82,
      icon: "bi-code-slash",
      color: "blue",
      description: "Python, SQL, Excel and data analysis skills",
    },
    {
      name: "Learning Progress",
      value: 80,
      icon: "bi-book",
      color: "purple",
      description: "Progress across your career roadmap",
    },
    {
      name: "Practical Experience",
      value: 68,
      icon: "bi-kanban",
      color: "orange",
      description: "Projects and real-world applications",
    },
    {
      name: "Knowledge Assessment",
      value: 74,
      icon: "bi-patch-question",
      color: "green",
      description: "Performance across quizzes and assessments",
    },
  ],
};

const strengths = [
  "Excel and spreadsheet analysis",
  "Python fundamentals",
  "Consistent learning progress",
];

const improvementAreas = [
  {
    name: "SQL",
    progress: 62,
    target: 90,
  },
  {
    name: "Statistics",
    progress: 48,
    target: 80,
  },
  {
    name: "Practical Projects",
    progress: 55,
    target: 85,
  },
];

const StudentCareerReadiness = () => {
  return (
    <StudentLayout pageTitle="Career Readiness">

      <div className="career-readiness-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="readiness-introduction">

          <span className="student-section-label">
            CAREER PREPARATION
          </span>

          <h1>
            Career Readiness
          </h1>

          <p>
            Track how prepared you are for your recommended
            career and identify the areas you should focus on
            next.
          </p>

        </section>


        {/* =================================================
            OVERALL READINESS
        ================================================= */}

        <section className="readiness-overview">

          <div className="readiness-score">

            <div className="readiness-circle">

              <div className="readiness-circle-inner">

                <strong>
                  {readinessData.overall}%
                </strong>

                <span>
                  Ready
                </span>

              </div>

            </div>

          </div>


          <div className="readiness-overview-content">

            <span className="student-section-label">
              YOUR TARGET CAREER
            </span>

            <h2>
              {readinessData.targetCareer}
            </h2>

            <p>
              You are making good progress toward your target
              career. Continue strengthening your skill gaps
              and gaining practical experience to improve your
              overall readiness.
            </p>


            <div className="readiness-overview-meta">

              <div>
                <span>
                  Career Match
                </span>

                <strong>
                  91%
                </strong>
              </div>

              <div>
                <span>
                  Skill Progress
                </span>

                <strong>
                  82%
                </strong>
              </div>

              <div>
                <span>
                  Roadmap Progress
                </span>

                <strong>
                  42%
                </strong>
              </div>

            </div>

          </div>


          <div className="readiness-level">

            <span>
              READINESS LEVEL
            </span>

            <strong>
              Good Progress
            </strong>

            <p>
              Keep building your practical experience.
            </p>

          </div>

        </section>


        {/* =================================================
            AI INSIGHT
        ================================================= */}

        <section className="readiness-ai-card">

          <div className="readiness-ai-icon">

            <i className="bi bi-stars"></i>

          </div>


          <div className="readiness-ai-content">

            <span className="ai-label">
              AI CAREER INSIGHT
            </span>

            <h2>
              Personalized readiness analysis will appear here
            </h2>

            <p>
              Once AI integration is connected, CareerCompass
              can analyze your assessment results, skill gaps,
              course progress, quiz performance and projects
              to generate a personalized career-readiness
              analysis.
            </p>

            <div className="readiness-ai-tags">

              <span>
                Skill Analysis
              </span>

              <span>
                Learning Progress
              </span>

              <span>
                Project Experience
              </span>

              <span>
                Career Goals
              </span>

            </div>

          </div>


          <span className="coming-soon-badge">
            Coming with AI
          </span>

        </section>


        {/* =================================================
            READINESS CATEGORIES
        ================================================= */}

        <section className="readiness-section">

          <div className="readiness-section-header">

            <div>

              <span className="student-section-label">
                READINESS BREAKDOWN
              </span>

              <h2>
                Your Career Preparation
              </h2>

              <p>
                See how different areas contribute to your
                overall career readiness.
              </p>

            </div>

          </div>


          <div className="readiness-category-grid">

            {readinessData.categories.map(
              (category) => (

                <article
                  className="readiness-category-card"
                  key={category.name}
                >

                  <div className="readiness-category-top">

                    <div
                      className={`readiness-category-icon ${category.color}`}
                    >
                      <i
                        className={`bi ${category.icon}`}
                      ></i>
                    </div>

                    <strong>
                      {category.value}%
                    </strong>

                  </div>


                  <h3>
                    {category.name}
                  </h3>

                  <p>
                    {category.description}
                  </p>


                  <div className="readiness-progress-track">

                    <div
                      className={`readiness-progress-fill ${category.color}`}
                      style={{
                        width:
                          `${category.value}%`,
                      }}
                    ></div>

                  </div>

                </article>

              )
            )}

          </div>

        </section>


        {/* =================================================
            STRENGTHS + IMPROVEMENT
        ================================================= */}

        <section className="readiness-two-column">


          {/* Strengths */}

          <div className="readiness-panel">

            <div className="readiness-panel-header">

              <div className="readiness-panel-icon green">
                <i className="bi bi-check-circle"></i>
              </div>

              <div>

                <span className="student-section-label">
                  YOUR STRENGTHS
                </span>

                <h2>
                  What you're doing well
                </h2>

              </div>

            </div>


            <div className="strength-list">

              {strengths.map(
                (strength, index) => (

                  <div
                    className="strength-item"
                    key={strength}
                  >

                    <div className="strength-number">
                      0{index + 1}
                    </div>

                    <span>
                      {strength}
                    </span>

                    <i className="bi bi-check-circle-fill"></i>

                  </div>

                )
              )}

            </div>

          </div>


          {/* Improvement */}

          <div className="readiness-panel">

            <div className="readiness-panel-header">

              <div className="readiness-panel-icon orange">
                <i className="bi bi-arrow-up-circle"></i>
              </div>

              <div>

                <span className="student-section-label">
                  FOCUS AREAS
                </span>

                <h2>
                  Improve these areas
                </h2>

              </div>

            </div>


            <div className="improvement-list">

              {improvementAreas.map(
                (area) => {

                  const gap =
                    area.target -
                    area.progress;

                  return (
                    <div
                      className="improvement-item"
                      key={area.name}
                    >

                      <div className="improvement-item-top">

                        <strong>
                          {area.name}
                        </strong>

                        <span>
                          {gap}% gap
                        </span>

                      </div>

                      <div className="improvement-track">

                        <div
                          style={{
                            width:
                              `${area.progress}%`,
                          }}
                        ></div>

                      </div>

                      <div className="improvement-meta">

                        <span>
                          Current {area.progress}%
                        </span>

                        <span>
                          Target {area.target}%
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            NEXT STEPS
        ================================================= */}

        <section className="next-steps-card">

          <div className="next-steps-icon">

            <i className="bi bi-signpost-2"></i>

          </div>


          <div className="next-steps-content">

            <span className="student-section-label">
              NEXT STEPS
            </span>

            <h2>
              Keep moving toward your career goal
            </h2>

            <p>
              Focus on completing your current courses,
              strengthening your highest skill gaps and
              building practical projects.
            </p>


            <div className="next-step-list">

              <div>

                <span>
                  01
                </span>

                <p>
                  Continue your SQL learning path
                </p>

              </div>

              <div>

                <span>
                  02
                </span>

                <p>
                  Strengthen your Statistics fundamentals
                </p>

              </div>

              <div>

                <span>
                  03
                </span>

                <p>
                  Complete a practical Data Analysis project
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            FUTURE AI PERSONALIZATION
        ================================================= */}

        <section className="readiness-ai-future">

          <div className="readiness-ai-future-icon">

            <i className="bi bi-stars"></i>

          </div>


          <div>

            <span className="student-section-label">
              FUTURE AI PERSONALIZATION
            </span>

            <h2>
              Your readiness score will evolve with you
            </h2>

            <p>
              AI can continuously evaluate your learning
              progress, assessment responses, quiz results,
              projects and skill development to provide a
              dynamic readiness score and personalized actions.
            </p>

          </div>


          <span className="coming-soon-badge">
            AI Ready
          </span>

        </section>


      </div>

    </StudentLayout>
  );
};

export default StudentCareerReadiness;