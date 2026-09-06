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
          "Which type of work would you enjoy spending most of your time doing?",
        options: [
          {
            text: "Analyzing information and discovering patterns",
            tags: ["data", "analytics", "logical"],
          },
          {
            text: "Building software, websites or applications",
            tags: ["software", "development", "technical"],
          },
          {
            text: "Planning products and working with people",
            tags: ["product", "planning", "people"],
          },
          {
            text: "Creating designs and improving user experiences",
            tags: ["design", "creative", "people"],
          },
        ],
      },
      {
        id: "interest2",
        question:
          "Which area would you be most interested in exploring further?",
        options: [
          {
            text: "Data and analytics",
            tags: ["data", "analytics", "logical"],
          },
          {
            text: "Artificial intelligence and machine learning",
            tags: ["ai", "machine learning", "data"],
          },
          {
            text: "Web and software development",
            tags: ["web", "software", "development"],
          },
          {
            text: "Cybersecurity and cloud technologies",
            tags: ["security", "cybersecurity", "cloud", "infrastructure"],
          },
        ],
      },
      {
        id: "interest3",
        question: "What kind of problem would you enjoy solving?",
        options: [
          {
            text: "Understanding why something is happening using data",
            tags: ["data", "analytics", "logical"],
          },
          {
            text: "Creating a technical solution to a problem",
            tags: ["software", "technical", "building"],
          },
          {
            text: "Finding ways to improve a product or process",
            tags: ["product", "strategy", "planning"],
          },
          {
            text: "Designing a solution that is simple and useful for people",
            tags: ["design", "user experience", "people"],
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
            text: "Analyze the information before deciding what to do",
            tags: ["logical", "analytics", "structured"],
          },
          {
            text: "Experiment and learn by trying different solutions",
            tags: ["experimentation", "ai", "machine learning"],
          },
          {
            text: "Discuss the problem with others",
            tags: ["people", "collaborative"],
          },
          {
            text: "Break the problem into smaller steps",
            tags: ["structured", "systems", "technical"],
          },
        ],
      },
      {
        id: "aptitude2",
        question: "How do you prefer to learn something new?",
        options: [
          {
            text: "Through practical projects",
            tags: ["building", "software", "development"],
          },
          {
            text: "Through structured courses and tutorials",
            tags: ["structured", "systems"],
          },
          {
            text: "Through experimentation and exploration",
            tags: ["experimentation", "ai", "machine learning"],
          },
          {
            text: "Through discussions and explanations",
            tags: ["people", "collaborative"],
          },
        ],
      },
      {
        id: "aptitude3",
        question: "Which work environment would suit you best?",
        options: [
          {
            text: "Independent work with time to focus deeply",
            tags: ["independent", "data", "technical"],
          },
          {
            text: "A collaborative team environment",
            tags: ["people", "collaborative", "product"],
          },
          {
            text: "A fast-paced environment with changing challenges",
            tags: ["experimentation", "strategy"],
          },
          {
            text: "A structured environment with clear goals",
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
        question: "How comfortable are you with programming and writing code?",
        skillName: "Programming",
        options: [
          { text: "Very comfortable", level: 4 },
          { text: "Somewhat comfortable", level: 3 },
          { text: "I have basic knowledge", level: 2 },
          { text: "I am still learning", level: 1 },
        ],
      },
      {
        id: "skill2",
        question:
          "How comfortable are you working with data, numbers or analytical information?",
        skillName: "Data Analysis",
        options: [
          { text: "Very comfortable", level: 4 },
          { text: "Somewhat comfortable", level: 3 },
          { text: "I have basic knowledge", level: 2 },
          { text: "I am still developing this skill", level: 1 },
        ],
      },
      {
        id: "skill3",
        question: "How confident are you when communicating ideas to others?",
        skillName: "Communication",
        options: [
          { text: "Very confident", level: 4 },
          { text: "Mostly confident", level: 3 },
          { text: "I am improving", level: 2 },
          { text: "I would like to develop this skill", level: 1 },
        ],
      },
    ],
  },
];

const StudentAssessment = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState({});

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
    setAnswers({
      ...answers,
      [question.id]: answer,
    });
  };

  /* =====================================================
     NEXT QUESTION / SECTION
  ===================================================== */

  const handleNext = () => {
    if (!selectedAnswer) return;

    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setCurrentQuestion(0);

    setCurrentSection(currentSection + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     PREVIOUS
  ===================================================== */

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (currentSection > 0) {
      const previousSection = assessmentSections[currentSection - 1];

      setCurrentSection(currentSection - 1);

      setCurrentQuestion(previousSection.questions.length - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =====================================================
     ACADEMIC INFO
  ===================================================== */

  const handleAcademicChange = (e) => {
    setAcademicInfo({
      ...academicInfo,
      [e.target.name]: e.target.value,
    });
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

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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

    setAcademicInfo({
      degree: "",
      branch: "",
      semester: "",
      cgpa: "",
      interests: "",
    });

    setCurrentSection(0);

    setCurrentQuestion(0);

    setSubmitted(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
            Help us understand your interests, strengths, skills and academic
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
            <div
              style={{
                width: `${progress}%`,
              }}
            ></div>
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

            <div className="assessment-navigation">
              <button
                type="button"
                className="assessment-secondary-btn"
                onClick={handlePrevious}
              >
                <i className="bi bi-arrow-left"></i>
                Previous
              </button>

              <button type="submit" className="student-primary-btn">
                Complete Assessment
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
                    className={`assessment-option ${
                      isSelected ? "selected" : ""
                    }`}
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
