import React from "react";
import StudentLayout from "../../components/student/StudentLayout";
import "./StudentSkillGap.css";


// =====================================================
// CURRENT SKILL DATA
// =====================================================
// Temporary frontend data.
// Later these values can come from Django/API + AI.
// =====================================================

const skillData = [
  {
    name: "Excel",
    category: "Data Analysis",
    current: 100,
    required: 80,
    status: "Strong",
    color: "green",
  },

  {
    name: "Python",
    category: "Programming",
    current: 82,
    required: 85,
    status: "Almost There",
    color: "blue",
  },

  {
    name: "SQL",
    category: "Database",
    current: 62,
    required: 90,
    status: "Needs Improvement",
    color: "orange",
  },

  {
    name: "Statistics",
    category: "Data Analysis",
    current: 48,
    required: 80,
    status: "Needs Improvement",
    color: "orange",
  },

  {
    name: "Power BI",
    category: "Visualization",
    current: 20,
    required: 75,
    status: "Beginner",
    color: "purple",
  },

  {
    name: "Data Visualization",
    category: "Visualization",
    current: 35,
    required: 80,
    status: "Needs Improvement",
    color: "orange",
  },
];


// =====================================================
// AI PLACEHOLDER DATA
// =====================================================

const aiInsight = {
  title: "SQL is currently your highest-priority skill gap",

  description:
    "Your current SQL proficiency is below the level recommended for your Data Analyst career path. Strengthening SQL can improve your readiness for the next stage of your roadmap.",

  recommendation:
    "Continue your SQL course and complete the related practice tasks before moving to advanced analysis topics.",
};


// =====================================================
// COMPONENT
// =====================================================

const StudentSkillGap = () => {

  // ---------------------------------------------------
  // Overall Skill Score
  // ---------------------------------------------------

  const overallSkillScore = Math.round(
    skillData.reduce(
      (total, skill) => total + skill.current,
      0
    ) / skillData.length
  );


  // ---------------------------------------------------
  // Strong Skills
  // ---------------------------------------------------

  const strongSkills = skillData.filter(
    (skill) => skill.current >= skill.required
  );


  // ---------------------------------------------------
  // Skills Requiring Improvement
  // ---------------------------------------------------

  const improvementSkills = skillData.filter(
    (skill) => skill.current < skill.required
  );


  // ---------------------------------------------------
  // Largest Skill Gap
  // ---------------------------------------------------

  const largestGap = [...skillData]
    .sort(
      (a, b) =>
        b.required -
        b.current -
        (a.required - a.current)
    )[0];


  return (
    <StudentLayout pageTitle="Skill Gap">

      <div className="skill-gap-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="skill-gap-introduction">

          <span className="student-section-label">
            SKILL ANALYSIS
          </span>

          <h1>
            Skill Gap
          </h1>

          <p>
            Understand your current skill level and identify
            the capabilities you need to strengthen for your
            recommended career path.
          </p>

        </section>


        {/* =================================================
            CAREER TARGET
        ================================================= */}

        <section className="skill-target-card">

          <div className="skill-target-icon">
            <i className="bi bi-bullseye"></i>
          </div>

          <div className="skill-target-content">

            <span>
              TARGET CAREER
            </span>

            <h2>
              Data Analyst
            </h2>

            <p>
              Your skill analysis is currently aligned with
              the requirements of your recommended Data
              Analyst career path.
            </p>

          </div>


          <div className="skill-target-match">

            <span>
              Career Match
            </span>

            <strong>
              91%
            </strong>

          </div>

        </section>


        {/* =================================================
            SUMMARY STATS
        ================================================= */}

        <section className="skill-gap-stats">

          <div className="skill-summary-card">

            <div className="skill-summary-icon blue">
              <i className="bi bi-bar-chart-line"></i>
            </div>

            <div>

              <span>
                Overall Skill Level
              </span>

              <strong>
                {overallSkillScore}%
              </strong>

              <small>
                Across assessed skills
              </small>

            </div>

          </div>


          <div className="skill-summary-card">

            <div className="skill-summary-icon green">
              <i className="bi bi-check-circle"></i>
            </div>

            <div>

              <span>
                Strong Skills
              </span>

              <strong>
                {strongSkills.length}
              </strong>

              <small>
                Meeting career requirements
              </small>

            </div>

          </div>


          <div className="skill-summary-card">

            <div className="skill-summary-icon orange">
              <i className="bi bi-arrow-up-circle"></i>
            </div>

            <div>

              <span>
                Skills to Improve
              </span>

              <strong>
                {improvementSkills.length}
              </strong>

              <small>
                Below target level
              </small>

            </div>

          </div>


          <div className="skill-summary-card">

            <div className="skill-summary-icon purple">
              <i className="bi bi-lightning-charge"></i>
            </div>

            <div>

              <span>
                Highest Gap
              </span>

              <strong>
                {largestGap.name}
              </strong>

              <small>
                {largestGap.required - largestGap.current}% gap
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            AI INSIGHT
        ================================================= */}

        <section className="skill-ai-card">

          <div className="skill-ai-icon">

            <i className="bi bi-stars"></i>

          </div>


          <div className="skill-ai-content">

            <span className="ai-label">
              AI-POWERED SKILL INSIGHT
            </span>

            <h2>
              {aiInsight.title}
            </h2>

            <p>
              {aiInsight.description}
            </p>

            <div className="skill-ai-recommendation">

              <i className="bi bi-lightbulb"></i>

              <span>
                {aiInsight.recommendation}
              </span>

            </div>

          </div>


          <span className="skill-ai-badge">
            AI Ready
          </span>

        </section>


        {/* =================================================
            SKILL GAP VISUALIZATION
        ================================================= */}

        <section className="skill-analysis-section">

          <div className="skill-section-header">

            <div>

              <span className="student-section-label">
                YOUR SKILLS
              </span>

              <h2>
                Current vs Required
              </h2>

              <p>
                Compare your current proficiency with the
                recommended level for your target career.
              </p>

            </div>

          </div>


          <div className="skill-list">

            {skillData.map((skill) => {

              const gap = Math.max(
                skill.required - skill.current,
                0
              );

              return (
                <article
                  className="skill-card"
                  key={skill.name}
                >

                  {/* Skill Header */}

                  <div className="skill-card-header">

                    <div className="skill-card-title">

                      <div
                        className={`skill-icon ${skill.color}`}
                      >
                        <i className="bi bi-lightning"></i>
                      </div>

                      <div>

                        <h3>
                          {skill.name}
                        </h3>

                        <span>
                          {skill.category}
                        </span>

                      </div>

                    </div>


                    <span
                      className={`skill-status ${skill.color}`}
                    >
                      {skill.status}
                    </span>

                  </div>


                  {/* Current Level */}

                  <div className="skill-level-row">

                    <div>

                      <span>
                        Current Level
                      </span>

                      <strong>
                        {skill.current}%
                      </strong>

                    </div>

                    <div>

                      <span>
                        Required
                      </span>

                      <strong>
                        {skill.required}%
                      </strong>

                    </div>

                    <div>

                      <span>
                        Skill Gap
                      </span>

                      <strong>
                        {gap}%
                      </strong>

                    </div>

                  </div>


                  {/* Current Progress */}

                  <div className="skill-progress-block">

                    <div className="skill-progress-label">

                      <span>
                        Your proficiency
                      </span>

                      <strong>
                        {skill.current}%
                      </strong>

                    </div>

                    <div className="skill-progress-track">

                      <div
                        className={`skill-current-progress ${skill.color}`}
                        style={{
                          width:
                            `${skill.current}%`,
                        }}
                      ></div>

                    </div>

                  </div>


                  {/* Required Level */}

                  <div className="skill-progress-block">

                    <div className="skill-progress-label">

                      <span>
                        Career requirement
                      </span>

                      <strong>
                        {skill.required}%
                      </strong>

                    </div>

                    <div className="skill-required-track">

                      <div
                        style={{
                          width:
                            `${skill.required}%`,
                        }}
                      ></div>

                    </div>

                  </div>


                  {/* Recommendation */}

                  {gap > 0 && (

                    <div className="skill-action">

                      <i className="bi bi-arrow-right-circle"></i>

                      <span>
                        Focus on {skill.name} to close
                        your {gap}% skill gap.
                      </span>

                    </div>

                  )}

                  {gap === 0 && (

                    <div className="skill-complete">

                      <i className="bi bi-check-circle-fill"></i>

                      <span>
                        You have reached the recommended
                        level for this skill.
                      </span>

                    </div>

                  )}

                </article>
              );
            })}

          </div>

        </section>


        {/* =================================================
            PRIORITY SKILLS
        ================================================= */}

        <section className="priority-section">

          <div className="skill-section-header">

            <div>

              <span className="student-section-label">
                FOCUS AREAS
              </span>

              <h2>
                Skills to Prioritize
              </h2>

              <p>
                Focus on these areas to make the most progress
                toward your career goal.
              </p>

            </div>

          </div>


          <div className="priority-grid">

            {improvementSkills
              .sort(
                (a, b) =>
                  (b.required - b.current) -
                  (a.required - a.current)
              )
              .slice(0, 3)
              .map((skill, index) => {

                const gap =
                  skill.required -
                  skill.current;

                return (
                  <div
                    className="priority-card"
                    key={skill.name}
                  >

                    <div className="priority-number">
                      0{index + 1}
                    </div>

                    <div className="priority-content">

                      <span>
                        {skill.category}
                      </span>

                      <h3>
                        {skill.name}
                      </h3>

                      <p>
                        {gap}% gap remaining
                      </p>

                    </div>

                    <i className="bi bi-arrow-up-right"></i>

                  </div>
                );

              })}

          </div>

        </section>


        {/* =================================================
            AI FUTURE SECTION
        ================================================= */}

        <section className="skill-ai-future">

          <div className="skill-ai-future-icon">

            <i className="bi bi-stars"></i>

          </div>


          <div>

            <span className="student-section-label">
              FUTURE AI PERSONALIZATION
            </span>

            <h2>
              Your skill gap will become personalized over time
            </h2>

            <p>
              Once AI integration is connected, CareerCompass
              can analyze your assessment responses, course
              progress, quiz performance and career goals to
              dynamically identify skill gaps and prioritize
              what you should learn next.
            </p>

            <div className="future-ai-tags">

              <span>
                AI Skill Analysis
              </span>

              <span>
                Personalized Priorities
              </span>

              <span>
                Adaptive Learning
              </span>

              <span>
                Career Readiness
              </span>

            </div>

          </div>

          <span className="coming-soon-badge">
            Coming with AI
          </span>

        </section>


      </div>

    </StudentLayout>
  );
};


export default StudentSkillGap;