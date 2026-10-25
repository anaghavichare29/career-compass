import React, { useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentAssessment.css";

const assessmentSections = [
  {
    id: "interests",
    title: "Interests",
    description:
      "Tell us about the areas of work and activities that genuinely interest you.",
    icon: "bi-stars",
    questions: [
      {
        id: "interest1",
        question:
          "Which type of activity do you enjoy most in your free time or studies?",
        options: [
          {
            text: "Analyzing data, numbers, or researching information",
            tags: ["data", "analytics", "logical"],
          },
          {
            text: "Building or coding software, apps, or websites",
            tags: ["software", "development", "technical"],
          },
          {
            text: "Organizing projects, leading teams, or planning strategies",
            tags: ["product", "planning", "people", "management"],
          },
          {
            text: "Designing visuals, interfaces, or creative content",
            tags: ["design", "creative", "people"],
          },
        ],
      },
      {
        id: "interest2",
        question:
          "Which subject or field do you find most fascinating to learn about?",
        options: [
          {
            text: "Mathematics, statistics, or data science",
            tags: ["data", "analytics", "logical"],
          },
          {
            text: "Computer science, programming, or software engineering",
            tags: ["software", "development", "technical"],
          },
          {
            text: "Business, economics, or management",
            tags: ["product", "planning", "management", "people"],
          },
          {
            text: "Art, design, media, or communications",
            tags: ["design", "creative", "communication"],
          },
        ],
      },
      {
        id: "interest3",
        question:
          "What kind of work environment excites you the most?",
        options: [
          {
            text: "Research lab or data team working with large datasets",
            tags: ["data", "analytics", "ai", "machine learning"],
          },
          {
            text: "Engineering or development team building products",
            tags: ["software", "technical", "building", "web"],
          },
          {
            text: "Fast-moving startup or strategy team",
            tags: ["product", "strategy", "planning"],
          },
          {
            text: "Security operations center or cloud infrastructure team",
            tags: ["security", "cybersecurity", "cloud", "infrastructure"],
          },
        ],
      },
      {
        id: "interest4",
        question:
          "Which of these real-world goals motivates you the most?",
        options: [
          {
            text: "Making data-driven decisions that improve business outcomes",
            tags: ["data", "analytics", "logical", "business intelligence"],
          },
          {
            text: "Creating software tools that solve real-world problems",
            tags: ["software", "development", "technical", "building"],
          },
          {
            text: "Building a product that millions of people use",
            tags: ["product", "planning", "people", "user experience"],
          },
          {
            text: "Protecting organizations from cybersecurity threats",
            tags: ["security", "cybersecurity", "cloud"],
          },
        ],
      },
    ],
  },

  {
    id: "aptitude",
    title: "Aptitude & Work Style",
    description:
      "Help us understand how you approach problems, learning and different work situations.",
    icon: "bi-lightbulb",
    questions: [
      {
        id: "aptitude1",
        question:
          "When you face an unfamiliar problem, what approach feels most natural to you?",
        options: [
          {
            text: "Gather and analyze all available information first",
            tags: ["logical", "analytics", "structured"],
          },
          {
            text: "Try different solutions through hands-on experimentation",
            tags: ["experimentation", "ai", "machine learning", "building"],
          },
          {
            text: "Collaborate with others and discuss possible approaches",
            tags: ["people", "collaborative", "communication"],
          },
          {
            text: "Break the problem down into smaller structured steps",
            tags: ["structured", "systems", "technical"],
          },
        ],
      },
      {
        id: "aptitude2",
        question: "How do you prefer to learn something new?",
        options: [
          {
            text: "Hands-on projects — learning by building",
            tags: ["building", "software", "development"],
          },
          {
            text: "Structured courses, textbooks, or formal tutorials",
            tags: ["structured", "systems", "logical"],
          },
          {
            text: "Exploration and experimentation — trying things out",
            tags: ["experimentation", "ai", "machine learning", "creative"],
          },
          {
            text: "Discussions, mentors, or peer learning",
            tags: ["people", "collaborative", "communication"],
          },
        ],
      },
      {
        id: "aptitude3",
        question:
          "When working on a group project, which role do you naturally take?",
        options: [
          {
            text: "The analyst — researching information and data",
            tags: ["logical", "analytics", "data", "independent"],
          },
          {
            text: "The developer — writing code or building the solution",
            tags: ["technical", "software", "building"],
          },
          {
            text: "The leader — coordinating tasks and managing the team",
            tags: ["people", "management", "product"],
          },
          {
            text: "The designer — creating visuals or improving usability",
            tags: ["design", "creative", "user experience"],
          },
        ],
      },
      {
        id: "aptitude4",
        question: "Which work style suits you best?",
        options: [
          {
            text: "Independent focused work with minimal interruptions",
            tags: ["independent", "data", "technical"],
          },
          {
            text: "Collaborative teamwork with frequent communication",
            tags: ["people", "collaborative", "product"],
          },
          {
            text: "Dynamic environment with frequent changing challenges",
            tags: ["experimentation", "strategy", "building"],
          },
          {
            text: "Structured environment with clear processes and deadlines",
            tags: ["structured", "cybersecurity", "systems"],
          },
        ],
      },
    ],
  },

  {
    id: "skills",
    title: "Skills & Confidence",
    description:
      "Reflect on your current technical and professional skills. There are no right or wrong answers.",
    icon: "bi-bar-chart",
    questions: [
      {
        id: "skill1",
        question: "How comfortable are you with programming or writing code?",
        skillName: "Programming",
        options: [
          { text: "Very comfortable — I code regularly", level: 4 },
          { text: "Somewhat comfortable — I can build basic projects", level: 3 },
          { text: "Basic knowledge — I have learned some concepts", level: 2 },
          { text: "Still learning — I am just getting started", level: 1 },
        ],
      },
      {
        id: "skill2",
        question:
          "How comfortable are you working with data, numbers, or analytics?",
        skillName: "Data Analysis",
        options: [
          { text: "Very comfortable — I regularly work with data", level: 4 },
          { text: "Somewhat comfortable — I can perform basic analysis", level: 3 },
          { text: "Basic knowledge — I understand the concepts", level: 2 },
          { text: "Still developing — I would like to learn more", level: 1 },
        ],
      },
      {
        id: "skill3",
        question:
          "How confident are you when communicating ideas or presenting to others?",
        skillName: "Communication",
        options: [
          { text: "Very confident — I enjoy presenting and leading discussions", level: 4 },
          { text: "Mostly confident — I can communicate clearly in most situations", level: 3 },
          { text: "Improving — I am building my confidence", level: 2 },
          { text: "Would like to develop — This is an area I want to work on", level: 1 },
        ],
      },
      {
        id: "skill4",
        question:
          "How comfortable are you with designing or thinking visually?",
        skillName: "Design Thinking",
        options: [
          { text: "Very comfortable — I create designs or use design tools regularly", level: 4 },
          { text: "Somewhat comfortable — I have a good visual sense", level: 3 },
          { text: "Basic — I can understand design principles", level: 2 },
          { text: "Not yet — This is something I want to explore", level: 1 },
        ],
      },
    ],
  },
];

const StudentAssessment = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [otherTexts, setOtherTexts] = useState({});

  const [academicInfo, setAcademicInfo] = useState({
    degree: "",
    branch: "",
    semester: "",
    cgpa: "",
    interests: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const section = assessmentSections[currentSection];
  const question = section?.questions[currentQuestion];
  const totalSections = assessmentSections.length + 1;
  const currentStep = currentSection + 1;
  const progress = (currentStep / totalSections) * 100;
  const selectedAnswer = question ? answers[question.id] : null;

  /* =====================================================
     ANSWERS
  ===================================================== */

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [question.id]: answer });
  };

  const handleOtherSelect = (questionId) => {
    const otherText = otherTexts[questionId] || "";
    const otherAnswer = {
      text: otherText || "(Other)",
      tags: [],
      isOther: true,
    };
    setAnswers({ ...answers, [questionId]: otherAnswer });
  };

  const handleOtherTextChange = (questionId, text) => {
    setOtherTexts({ ...otherTexts, [questionId]: text });
    // If "Other" is already selected, update the answer text live
    if (answers[questionId]?.isOther) {
      setAnswers({
        ...answers,
        [questionId]: { text: text || "(Other)", tags: [], isOther: true },
      });
    }
  };

  /* =====================================================
     NEXT QUESTION / SECTION
  ===================================================== */

  const handleNext = () => {
    if (!selectedAnswer) return;

    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    setCurrentQuestion(0);
    setCurrentSection(currentSection + 1);
  };

  /* =====================================================
     PREVIOUS
  ===================================================== */

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      return;
    }

    if (currentSection > 0) {
      const previousSection = assessmentSections[currentSection - 1];
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(previousSection.questions.length - 1);
    }
  };

  /* =====================================================
     ACADEMIC INFO
  ===================================================== */

  const handleAcademicChange = (e) => {
    setAcademicInfo({ ...academicInfo, [e.target.name]: e.target.value });
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await api.post("assessments/submit/", {
        user_id: user?.user_id,
        answers: answers,
        academic_info: academicInfo,
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(
        "Assessment submission failed:",
        error.response?.data || error.message,
      );
      setSubmitError(
        "Something went wrong submitting your assessment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     RETAKE
  ===================================================== */

  const handleRetake = () => {
    setAnswers({});
    setOtherTexts({});
    setAcademicInfo({ degree: "", branch: "", semester: "", cgpa: "", interests: "" });
    setCurrentSection(0);
    setCurrentQuestion(0);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =====================================================
     COMPLETION PAGE
  ===================================================== */

  if (submitted) {
    return (
      <StudentLayout pageTitle="Career Assessment">
        <div className="assessment-result-page">
          <div className="assessment-result-card">
            <div className="result-icon">
              <i className="bi bi-check-lg"></i>
            </div>

            <span className="student-section-label">ASSESSMENT COMPLETE</span>

            <h1>Your career assessment is complete!</h1>

            <p>
              Thank you for sharing your interests, strengths, skills and
              academic background. Your responses will help CareerCompass create
              personalized career recommendations for you.
            </p>

            <div className="assessment-completion-details">
              <div className="completion-detail">
                <div className="completion-icon">
                  <i className="bi bi-stars"></i>
                </div>
                <div>
                  <strong>Interests</strong>
                  <span>Your areas of career interest</span>
                </div>
              </div>

              <div className="completion-detail">
                <div className="completion-icon">
                  <i className="bi bi-lightbulb"></i>
                </div>
                <div>
                  <strong>Aptitude & Work Style</strong>
                  <span>How you approach work and learning</span>
                </div>
              </div>

              <div className="completion-detail">
                <div className="completion-icon">
                  <i className="bi bi-bar-chart"></i>
                </div>
                <div>
                  <strong>Skills</strong>
                  <span>Your current skill confidence</span>
                </div>
              </div>

              <div className="completion-detail">
                <div className="completion-icon">
                  <i className="bi bi-mortarboard"></i>
                </div>
                <div>
                  <strong>Academic Information</strong>
                  <span>Your educational background</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button
                className="student-primary-btn"
                onClick={() =>
                  (window.location.href = "/student/recommendations")
                }
              >
                View Career Recommendations
                <i className="bi bi-arrow-right"></i>
              </button>

              <button
                className="assessment-secondary-btn"
                onClick={handleRetake}
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  /* =====================================================
     ACADEMIC INFORMATION
  ===================================================== */

  const isAcademicSection = currentSection === assessmentSections.length;

  return (
    <StudentLayout pageTitle="Career Assessment">
      <div className="assessment-page">
        {/* =================================================
            INTRODUCTION
        ================================================= */}

        <section className="assessment-introduction">
          <span className="student-section-label">CAREER DISCOVERY</span>
          <h1>Career Assessment</h1>
          <p>
            Help us understand your interests, aptitude, skills and academic
            background so we can guide you towards suitable career paths.
          </p>
        </section>

        {/* =================================================
            SECTION PROGRESS
        ================================================= */}

        <div className="assessment-progress-card">
          <div className="assessment-progress-header">
            <div>
              <span>Assessment Progress</span>
              <strong>
                {isAcademicSection
                  ? "Academic Information"
                  : `${section.title}`}
              </strong>
            </div>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="assessment-progress-track">
            <div style={{ width: `${progress}%` }}></div>
          </div>

          <div className="assessment-section-indicators">
            {[
              ...assessmentSections,
              {
                id: "academic",
                title: "Academic Information",
                icon: "bi-mortarboard",
              },
            ].map((item, index) => (
              <div
                key={item.id}
                className={`assessment-section-indicator ${
                  index === currentSection
                    ? "active"
                    : index < currentSection
                      ? "completed"
                      : ""
                }`}
              >
                <span>
                  {index < currentSection ? (
                    <i className="bi bi-check"></i>
                  ) : (
                    <i className={`bi ${item.icon}`}></i>
                  )}
                </span>
                <small>{item.title}</small>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            ACADEMIC INFORMATION
        ================================================= */}

        {isAcademicSection ? (
          <form className="assessment-question-card" onSubmit={handleSubmit}>
            <div className="assessment-question-header">
              <div>
                <span className="question-category">ACADEMIC INFORMATION</span>
                <h2>Tell us about your education</h2>
              </div>
              <div className="question-section-icon">
                <i className="bi bi-mortarboard"></i>
              </div>
            </div>

            <p className="question-description">
              This information helps us understand your current academic
              background and provide more relevant career guidance.
            </p>

            <div className="academic-form-grid">
              <div className="academic-form-group">
                <label>Degree / Program</label>
                <input
                  type="text"
                  name="degree"
                  placeholder="e.g. B.Tech"
                  value={academicInfo.degree}
                  onChange={handleAcademicChange}
                  required
                />
              </div>

              <div className="academic-form-group">
                <label>Branch / Specialization</label>
                <input
                  type="text"
                  name="branch"
                  placeholder="e.g. Information Technology"
                  value={academicInfo.branch}
                  onChange={handleAcademicChange}
                  required
                />
              </div>

              <div className="academic-form-group">
                <label>Current Semester / Year</label>
                <input
                  type="text"
                  name="semester"
                  placeholder="e.g. Semester 4"
                  value={academicInfo.semester}
                  onChange={handleAcademicChange}
                  required
                />
              </div>

              <div className="academic-form-group">
                <label>Current CGPA</label>
                <input
                  type="text"
                  name="cgpa"
                  placeholder="e.g. 8.2"
                  value={academicInfo.cgpa}
                  onChange={handleAcademicChange}
                />
              </div>

              <div className="academic-form-group full-width">
                <label>Subjects / Areas You Enjoy</label>
                <textarea
                  name="interests"
                  placeholder="Tell us about subjects, technologies or areas you enjoy learning..."
                  value={academicInfo.interests}
                  onChange={handleAcademicChange}
                  rows="4"
                />
              </div>
            </div>

            {submitError && (
              <p style={{ color: "red", marginTop: "1rem" }}>{submitError}</p>
            )}

            <div className="assessment-navigation">
              <button
                type="button"
                className="assessment-secondary-btn"
                onClick={handlePrevious}
              >
                <i className="bi bi-arrow-left"></i>
                Previous
              </button>

              <button
                type="submit"
                className="student-primary-btn"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Complete Assessment"}
                <i className="bi bi-check-lg"></i>
              </button>
            </div>
          </form>
        ) : (
          /* =================================================
             QUESTIONS
          ================================================= */

          <section className="assessment-question-card">
            <div className="assessment-question-header">
              <div>
                <span className="question-category">{section.title}</span>
                <h2 className="assessment-section-title">
                  {section.description}
                </h2>
              </div>
              <div className="question-number">{currentQuestion + 1}</div>
            </div>

            <div className="question-count">
              Question {currentQuestion + 1} of {section.questions.length}
            </div>

            <h2 className="assessment-question-text">{question.question}</h2>

            <p className="question-description">
              There is no right or wrong answer. Choose the option that feels
              most appropriate for you.
            </p>

            <div className="assessment-options">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer?.text === option.text;

                return (
                  <button
                    type="button"
                    key={option.text}
                    className={`assessment-option ${isSelected ? "selected" : ""}`}
                    onClick={() => handleAnswer(option)}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">{option.text}</span>
                    <span className="option-check">
                      {isSelected && <i className="bi bi-check-lg"></i>}
                    </span>
                  </button>
                );
              })}

              {/* Other / Custom answer option */}
              <div
                className={`assessment-option other-option ${
                  selectedAnswer?.isOther ? "selected" : ""
                }`}
                onClick={() => handleOtherSelect(question.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleOtherSelect(question.id)}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + question.options.length)}
                </span>
                <div className="other-option-content">
                  <span className="option-text">Other — describe your answer</span>
                  <textarea
                    className="other-option-textarea"
                    placeholder="Type your answer here..."
                    value={otherTexts[question.id] || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleOtherTextChange(question.id, e.target.value);
                    }}
                    onFocus={() => handleOtherSelect(question.id)}
                    rows={2}
                  />
                </div>
                <span className="option-check">
                  {selectedAnswer?.isOther && <i className="bi bi-check-lg"></i>}
                </span>
              </div>
            </div>

            <div className="assessment-navigation">
              <button
                type="button"
                className="assessment-secondary-btn"
                onClick={handlePrevious}
                disabled={currentSection === 0 && currentQuestion === 0}
              >
                <i className="bi bi-arrow-left"></i>
                Previous
              </button>

              <button
                type="button"
                className="student-primary-btn"
                onClick={handleNext}
                disabled={!selectedAnswer}
              >
                {currentQuestion === section.questions.length - 1
                  ? "Continue"
                  : "Next Question"}
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="assessment-info">
          <i className="bi bi-lightbulb"></i>
          <p>
            Your responses are used to understand your preferences and create
            personalized career guidance. There are no right or wrong choices in
            this assessment.
          </p>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentAssessment;
