import React, { useEffect, useState, useRef } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import CareerPathSelector from "../../components/student/CareerPathSelector";
import "./StudentQuizzes.css";

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(""); // "career" | "aptitude"
  const [generateMessage, setGenerateMessage] = useState("");
  const [generateSection, setGenerateSection] = useState("");
  const [hasAssessment, setHasAssessment] = useState(false);

  const [activeFilter, setActiveFilter] = useState("All");

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState(null);

  // Time-Bound vs Self-Paced
  const [isTimeBound, setIsTimeBound] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 mins = 900s
  const [quizStartTime, setQuizStartTime] = useState(null);
  const timerRef = useRef(null);

  // Mode Selection Modal
  const [quizToStart, setQuizToStart] = useState(null);

  // Create Quiz Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createSkill, setCreateSkill] = useState("");
  const [createDifficulty, setCreateDifficulty] = useState("Beginner");
  const [createDesc, setCreateDesc] = useState("");
  const [createQuestions, setCreateQuestions] = useState([
    { question: "", options: ["", "", "", ""], correct_index: 0 },
  ]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myMentors, setMyMentors] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const loadData = async (careerOverride = null) => {
    setLoading(true);
    setError("");
    try {
      const selectedCareer = careerOverride || JSON.parse(localStorage.getItem("selectedCareer") || "null");
      const quizParams = { user_id: user?.user_id };
      if (selectedCareer?.career_name) quizParams.career_name = selectedCareer.career_name;

      const [quizRes, attemptsRes, submissionsRes, mentorsRes] = await Promise.all([
        api.get("quizzes/", { params: quizParams }),
        api.get("quizzes/my-attempts/", { params: { user_id: user?.user_id } }),
        api.get("quizzes/my-submissions/", { params: { user_id: user?.user_id } }).catch(() => ({ data: [] })),
        api.get("mentorship/my-mentors/", { params: { user_id: user?.user_id } }).catch(() => ({ data: [] })),
      ]);
      setQuizzes(quizRes.data);
      setAttempts(attemptsRes.data);
      setMySubmissions(submissionsRes.data);
      setMyMentors(mentorsRes.data);

      // Detect if the student has taken the career assessment
      // (careers endpoint returns data only after assessment)
      try {
        const careerRes = await api.get("careers/", { params: { user_id: user?.user_id } });
        setHasAssessment(careerRes.data && careerRes.data.length > 0);
      } catch {
        setHasAssessment(false);
      }
    } catch (err) {
      console.error("Failed to load quizzes:", err);
      setError("Could not load your quizzes right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Opens the quiz for a skill when arriving from the roadmap (?skill=SQL)
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (autoOpenedRef.current || quizzes.length === 0) return;

    const skillParam = new URLSearchParams(window.location.search).get("skill");
    if (!skillParam) return;

    const doneIds = new Set(attempts.map((a) => a.quiz));
    const match =
      quizzes.find((q) => q.skill === skillParam && !doneIds.has(q.id)) ||
      quizzes.find((q) => q.skill === skillParam);

    if (match) {
      autoOpenedRef.current = true;
      initiateQuiz(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizzes, attempts]);

  // Timer effect
  useEffect(() => {
    if (selectedQuiz && !quizFinished && isTimeBound) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedQuiz, quizFinished, isTimeBound]);

  const completedQuizIds = new Set(attempts.map((a) => a.quiz));

  const averageScore = attempts.length
    ? Math.round(
        (attempts.reduce((sum, a) => sum + a.score / a.total_questions, 0) /
          attempts.length) *
          100,
      )
    : 0;

  const aiRecommendedCount = quizzes.filter((q) => q.ai_recommended).length;

  // ── Quiz categorization ────────────────────────────────────────────────────
  // Career quizzes: tagged as career/skill-based (ai_recommended or skill-matched)
  // General aptitude: everything else (logical, verbal, quantitative, etc.)
  const selectedCareerName = (
    JSON.parse(localStorage.getItem("selectedCareer") || "null")
  )?.career_name?.toLowerCase() || "";

  const APTITUDE_KEYWORDS = [
    "aptitude", "logical", "verbal", "quantitative", "general",
    "reasoning", "numerical", "abstract", "critical", "psychometric",
  ];

  const isAptitudeQuiz = (q) => {
    const text = ((q.skill || "") + " " + (q.title || "") + " " + (q.description || "")).toLowerCase();
    return APTITUDE_KEYWORDS.some((kw) => text.includes(kw)) ||
      (!q.ai_recommended && !selectedCareerName && q.source === "ai");
  };

  const allCareerQuizzes = quizzes.filter((q) => !isAptitudeQuiz(q) && q.source !== "student");
  const allAptitudeQuizzes = quizzes.filter((q) => isAptitudeQuiz(q));
  const studentQuizzes = quizzes.filter((q) => q.source === "student");

  // Show only 5 general aptitude quizzes
  const aptitudeQuizzes = allAptitudeQuizzes.slice(0, 5);

  // Sections visible: if assessment taken → career quizzes first, then aptitude
  //                   if not taken → only aptitude quizzes
  const careerSection = hasAssessment ? allCareerQuizzes : [];
  const aptitudeSection = aptitudeQuizzes;

  // Check if all career quizzes are completed (for generate unlock)
  const careerAiQuizzes = careerSection.filter((q) => q.source === "ai");
  const remainingCareerQuizzes = careerAiQuizzes.filter((q) => !completedQuizIds.has(q.id));
  const allCareerCompleted = careerAiQuizzes.length > 0 && remainingCareerQuizzes.length === 0;

  const aptitudeAiQuizzes = aptitudeSection.filter((q) => q.source === "ai");
  const remainingAptitudeQuizzes = aptitudeAiQuizzes.filter((q) => !completedQuizIds.has(q.id));
  const allAptitudeCompleted = aptitudeAiQuizzes.length === 0 || remainingAptitudeQuizzes.length === 0;

  const initiateQuiz = (quiz) => {
    setQuizToStart(quiz);
  };

  const startQuiz = async (quiz, timeBound = true) => {
    try {
      const response = await api.get(`quizzes/${quiz.id}/`);
      setSelectedQuiz(response.data);
      setQuizToStart(null);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers({});
      setQuizFinished(false);
      setResult(null);
      setIsTimeBound(timeBound);
      setTimeRemaining((response.data.duration_minutes || 15) * 60);
      setQuizStartTime(Date.now());
    } catch (err) {
      console.error("Failed to load quiz:", err);
      alert("Could not load this quiz right now. Please try again.");
    }
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const questionId = selectedQuiz.questions[currentQuestion].id;
    setAnswers((previous) => ({ ...previous, [questionId]: answerIndex }));
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) return;

    if (currentQuestion < selectedQuiz.questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      const nextQuestionId = selectedQuiz.questions[nextIndex].id;
      setSelectedAnswer(answers[nextQuestionId] ?? null);
    } else {
      finishQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion === 0) return;
    const previousIndex = currentQuestion - 1;
    setCurrentQuestion(previousIndex);
    const prevQuestionId = selectedQuiz.questions[previousIndex].id;
    setSelectedAnswer(answers[prevQuestionId] ?? null);
  };

  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = quizStartTime
      ? Math.round((Date.now() - quizStartTime) / 1000)
      : 0;

    try {
      const response = await api.post(`quizzes/${selectedQuiz.id}/submit/`, {
        user_id: user?.user_id,
        answers,
        is_time_bound: isTimeBound,
        time_taken_seconds: timeTaken,
      });
      setResult(response.data);
      setQuizFinished(true);
      loadData();
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      alert("Could not submit your quiz. Please try again.");
    }
  };

  const closeQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizFinished(false);
    setResult(null);
  };

  const retakeQuiz = () => {
    if (!selectedQuiz) return;
    initiateQuiz(selectedQuiz);
  };

  const handleGenerateNew = async (section = "career") => {
    setGenerating(true);
    setGeneratingSection(section);
    setGenerateMessage("");
    setGenerateSection(section);
    try {
      const selectedCareer = JSON.parse(localStorage.getItem("selectedCareer") || "null");
      const payload = {
        user_id: user?.user_id,
        section,
        ...(section === "career" && selectedCareer?.career_name
          ? { career_name: selectedCareer.career_name }
          : {}),
      };
      const res = await api.post("quizzes/generate-new/", payload);
      setGenerateMessage(`New quiz ready: ${res.data?.title || "check your quiz list"}`);
      await loadData();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "Could not generate a new quiz right now.";
      setGenerateMessage(detail);
    } finally {
      setGenerating(false);
      setGeneratingSection("");
    }
  };

  const handleAddQuestionToCreate = () => {
    setCreateQuestions([
      ...createQuestions,
      { question: "", options: ["", "", "", ""], correct_index: 0 },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...createQuestions];
    updated[index][field] = value;
    setCreateQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...createQuestions];
    updated[qIndex].options[optIndex] = value;
    setCreateQuestions(updated);
  };

  const handleCreateQuizSubmit = async (e) => {
    e.preventDefault();
    if (!createTitle.trim() || !createSkill.trim()) {
      setCreateMessage("Title and skill are required.");
      return;
    }
    for (let i = 0; i < createQuestions.length; i++) {
      const q = createQuestions[i];
      if (!q.question.trim() || q.options.some((opt) => !opt.trim())) {
        setCreateMessage(`Please fill in all options for question #${i + 1}.`);
        return;
      }
    }

    setCreateSubmitting(true);
    setCreateMessage("");

    try {
      const createRes = await api.post("quizzes/create/", {
        user_id: user?.user_id,
        title: createTitle,
        skill: createSkill,
        description: createDesc,
        difficulty: createDifficulty,
        duration_minutes: 15,
        questions: createQuestions,
      });

      setCreateMessage(
        createRes.data.mentors_notified > 0
          ? "Quiz submitted successfully! Your mentor has been notified and will review it."
          : "Quiz saved successfully! You are not connected with a mentor yet. It will be reviewed once a mentor accepts your guidance request.",
      );
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateTitle("");
        setCreateSkill("");
        setCreateDesc("");
        setCreateQuestions([
          { question: "", options: ["", "", "", ""], correct_index: 0 },
        ]);
        setCreateMessage("");
        loadData();
      }, 2500);
    } catch (err) {
      console.error("Failed to create quiz:", err);
      setCreateMessage(err.response?.data?.detail || "Failed to submit quiz. Please try again.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Quizzes">
        <div className="quiz-page">
          <p>Loading your quizzes...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout pageTitle="Quizzes">
        <div className="quiz-page">
          <p>{error}</p>
        </div>
      </StudentLayout>
    );
  }

  // ===================================================
  // QUIZ RESULT SCREEN
  // ===================================================
  if (selectedQuiz && quizFinished && result) {
    const percentage = Math.round(
      (result.score / result.total_questions) * 100,
    );

    let resultMessage = "Keep practicing and continue building your skills.";
    if (percentage >= 80) {
      resultMessage =
        "Excellent work! You have a strong understanding of this topic.";
    } else if (percentage >= 60) {
      resultMessage =
        "Good progress! A little more practice can strengthen your understanding.";
    }

    return (
      <StudentLayout pageTitle="Quiz Result">
        <div className="quiz-page">
          <section className="quiz-result-card">
            <div className="quiz-result-icon">
              <i className="bi bi-trophy"></i>
            </div>

            <span className="student-section-label">QUIZ COMPLETED</span>
            <h1>{selectedQuiz.title}</h1>

            <div className="quiz-result-score">
              <strong>{percentage}%</strong>
              <span>
                {result.score} of {result.total_questions} correct
                {isTimeBound ? " (Time-Bound)" : " (Self-Paced)"}
              </span>
            </div>

            <p>{resultMessage}</p>

            <div className="quiz-result-breakdown">
              <div>
                <span>Correct</span>
                <strong className="correct">{result.score}</strong>
              </div>
              <div>
                <span>Incorrect</span>
                <strong className="incorrect">
                  {result.total_questions - result.score}
                </strong>
              </div>
              <div>
                <span>Accuracy</span>
                <strong>{percentage}%</strong>
              </div>
            </div>

            <div className="quiz-result-actions">
              <button className="student-primary-btn" onClick={retakeQuiz}>
                <i className="bi bi-arrow-clockwise"></i>
                Retake Quiz
              </button>

              <button className="quiz-secondary-button" onClick={closeQuiz}>
                Back to Quizzes
              </button>
            </div>
          </section>
        </div>
      </StudentLayout>
    );
  }

  // ===================================================
  // ACTIVE QUIZ SCREEN
  // ===================================================
  if (selectedQuiz && !quizFinished) {
    const question = selectedQuiz.questions[currentQuestion];
    const questionNumber = currentQuestion + 1;
    const totalQuestions = selectedQuiz.questions.length;
    const quizProgress = (questionNumber / totalQuestions) * 100;

    return (
      <StudentLayout pageTitle="Quiz">
        <div className="quiz-page">
          <section className="quiz-player-header">
            <div>
              <span className="student-section-label">
                {selectedQuiz.skill}
              </span>
              <h1>{selectedQuiz.title}</h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "0.4rem",
                }}
              >
                <span className="quiz-question-counter">
                  Question {questionNumber} of {totalQuestions}
                </span>

                {isTimeBound && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "20px",
                      background: timeRemaining < 120 ? "#fee2e2" : "#e0e7ff",
                      color: timeRemaining < 120 ? "#ef4444" : "#4338ca",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bi bi-clock"></i>
                    {formatTimer(timeRemaining)}
                  </span>
                )}
                {!isTimeBound && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "20px",
                      background: "#f1f5f9",
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    <i className="bi bi-play"></i> Self-Paced
                  </span>
                )}
              </div>
            </div>

            <button className="quiz-exit-button" onClick={closeQuiz}>
              <i className="bi bi-x-lg"></i>
              Exit Quiz
            </button>
          </section>

          <div className="quiz-player-progress">
            <div style={{ width: `${quizProgress}%` }}></div>
          </div>

          <section className="quiz-question-card">
            <div className="quiz-question-number">
              Question {questionNumber}
            </div>
            <h2>{question.question}</h2>

            <div className="quiz-options">
              {question.options.map((option, index) => (
                <button
                  key={option}
                  className={`quiz-option ${selectedAnswer === index ? "selected" : ""}`}
                  onClick={() => handleAnswer(index)}
                >
                  <span className="quiz-option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {selectedAnswer === index && (
                    <i className="bi bi-check-circle-fill"></i>
                  )}
                </button>
              ))}
            </div>

            <div className="quiz-navigation">
              <button
                className="quiz-secondary-button"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                <i className="bi bi-arrow-left"></i>
                Previous
              </button>

              <span>
                {questionNumber} / {totalQuestions}
              </span>

              <button
                className="student-primary-btn"
                onClick={nextQuestion}
                disabled={selectedAnswer === null}
              >
                {questionNumber === totalQuestions
                  ? "Submit Quiz"
                  : "Next Question"}
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </section>
        </div>
      </StudentLayout>
    );
  }

  // ===================================================
  // MAIN QUIZ LIST
  // ===================================================
  return (
    <StudentLayout pageTitle="Quizzes">
      <div className="quiz-page">
        <CareerPathSelector onCareerChange={(career) => loadData(career)} selectedCareerName={selectedCareerName} />

        <section className="quiz-introduction">
          <span className="student-section-label">KNOWLEDGE CHECK</span>
          <h1>Career Quizzes</h1>
          <p>
            Test your knowledge with 10-question AI & domain quizzes, choose
            between time-bound or self-paced modes, and create peer quizzes
            evaluated by industry experts.
          </p>
        </section>

        <section className="quiz-stats-grid">
          <div className="quiz-stat-card">
            <div className="quiz-stat-icon blue">
              <i className="bi bi-question-circle"></i>
            </div>
            <div>
              <span>Available</span>
              <strong>{quizzes.length}</strong>
              <small>Knowledge checks</small>
            </div>
          </div>

          <div className="quiz-stat-card">
            <div className="quiz-stat-icon green">
              <i className="bi bi-check-circle"></i>
            </div>
            <div>
              <span>Completed</span>
              <strong>{attempts.length}</strong>
              <small>Quizzes completed</small>
            </div>
          </div>

          <div className="quiz-stat-card">
            <div className="quiz-stat-icon orange">
              <i className="bi bi-bar-chart"></i>
            </div>
            <div>
              <span>Average Score</span>
              <strong>{averageScore}%</strong>
              <small>Current performance</small>
            </div>
          </div>

          <div className="quiz-stat-card">
            <div className="quiz-stat-icon purple">
              <i className="bi bi-stars"></i>
            </div>
            <div>
              <span>AI Recommended</span>
              <strong>{aiRecommendedCount}</strong>
              <small>Based on your roadmap</small>
            </div>
          </div>
        </section>

        {/* ── CAREER QUIZZES SECTION (only when assessment taken) ──────── */}
        {hasAssessment && (
          <section className="quiz-section">
            <div className="quiz-section-header">
              <div>
                <span className="student-section-label">CAREER SPECIFIC</span>
                <h2>Career Quizzes</h2>
                <p>Quizzes tailored to your selected career path and roadmap skills.</p>
              </div>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <button
                  className="ai-quiz-action"
                  style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}
                  onClick={() => handleGenerateNew("career")}
                  disabled={generating && generatingSection === "career"}
                >
                  {generating && generatingSection === "career" ? "Generating..." : <><i className="bi bi-stars"></i> Generate New Quiz</>}
                </button>
                <button
                  className="quiz-secondary-button"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="bi bi-pencil-square"></i> Create Your Own
                </button>
              </div>
            </div>
            {generateMessage && generateSection === "career" && (
              <div className="ai-quiz-reason" style={{ margin: "0 0 1rem" }}>
                <i className="bi bi-lightbulb"></i>
                <span>{generateMessage}</span>
              </div>
            )}
            <div className="quiz-grid">
              {careerSection.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", gridColumn: "1/-1" }}>
                  <i className="bi bi-stars" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                  <p>No career quizzes yet. Click <strong>Generate New Quiz</strong> to create one for your selected career.</p>
                </div>
              ) : careerSection.map((quiz) => {
                const isCompleted = completedQuizIds.has(quiz.id);
                return (
                  <article className="quiz-card" key={quiz.id}>
                    <div className="quiz-card-top">
                      <div className="quiz-card-icon"><i className="bi bi-patch-question"></i></div>
                      {quiz.ai_recommended && (
                        <span className="quiz-ai-badge"><i className="bi bi-stars"></i> AI Generated</span>
                      )}
                      {quiz.source === "student" && (
                        <span className="quiz-ai-badge" style={{ background: quiz.status === "approved" ? "#ecfdf5" : "#fef3c7", color: quiz.status === "approved" ? "#047857" : "#b45309" }}>
                          {quiz.status === "approved" ? "Expert Approved" : "Pending Evaluation"}
                        </span>
                      )}
                    </div>
                    <div className="quiz-card-content">
                      <span className="quiz-skill">{quiz.skill}</span>
                      <h3>{quiz.title}</h3>
                      <p>{quiz.description}</p>
                      <div className="quiz-meta">
                        <span><i className="bi bi-question-circle"></i> {quiz.question_count || 10} Questions</span>
                        <span><i className="bi bi-clock"></i> {quiz.duration_minutes || 15} min</span>
                        <span><i className="bi bi-bar-chart"></i> {quiz.difficulty}</span>
                      </div>
                      <div className="quiz-card-footer">
                        <span className="quiz-status">{isCompleted ? "Completed" : "Available"}</span>
                        <button className="quiz-start-button" onClick={() => initiateQuiz(quiz)}>
                          {isCompleted ? "Retake Quiz" : "Start Quiz"}
                          <i className="bi bi-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ── GENERAL APTITUDE QUIZZES SECTION ─────────────────────────── */}
        <section className="quiz-section">
          <div className="quiz-section-header">
            <div>
              <span className="student-section-label">GENERAL APTITUDE</span>
              <h2>General Aptitude Quizzes</h2>
              <p>
                {hasAssessment
                  ? "Build core reasoning and problem-solving skills alongside your career path."
                  : "Take the career assessment to unlock career-specific quizzes. Complete these to get started."}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button
                className="ai-quiz-action"
                style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}
                onClick={() => handleGenerateNew("aptitude")}
                disabled={generating && generatingSection === "aptitude"}
              >
                {generating && generatingSection === "aptitude" ? "Generating..." : <><i className="bi bi-stars"></i> Generate New Quiz</>}
              </button>
              <button
                className="quiz-secondary-button"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-pencil-square"></i> Create Your Own
              </button>
            </div>
          </div>
          {generateMessage && generateSection === "aptitude" && (
            <div className="ai-quiz-reason" style={{ margin: "0 0 1rem" }}>
              <i className="bi bi-lightbulb"></i>
              <span>{generateMessage}</span>
            </div>
          )}
          {!hasAssessment && (
            <div style={{ padding: "0.75rem 1rem", background: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <i className="bi bi-info-circle" style={{ color: "#2563eb", fontSize: "1.1rem" }}></i>
              <span style={{ fontSize: "0.87rem", color: "#1e40af" }}>
                Take the <a href="/student/assessment" style={{ fontWeight: 700, color: "#1d4ed8" }}>Career Assessment</a> to unlock career-specific quizzes personalised to your goals.
              </span>
            </div>
          )}
          <div className="quiz-grid">
            {aptitudeSection.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", gridColumn: "1/-1" }}>
                <i className="bi bi-journal-check" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                <p>No aptitude quizzes yet. Click <strong>Generate New Quiz</strong> to create one.</p>
              </div>
            ) : aptitudeSection.map((quiz) => {
              const isCompleted = completedQuizIds.has(quiz.id);
              return (
                <article className="quiz-card" key={quiz.id}>
                  <div className="quiz-card-top">
                    <div className="quiz-card-icon"><i className="bi bi-patch-question"></i></div>
                    {quiz.ai_recommended && (
                      <span className="quiz-ai-badge"><i className="bi bi-stars"></i> AI Generated</span>
                    )}
                    {quiz.source === "student" && (
                      <span className="quiz-ai-badge" style={{ background: quiz.status === "approved" ? "#ecfdf5" : "#fef3c7", color: quiz.status === "approved" ? "#047857" : "#b45309" }}>
                        {quiz.status === "approved" ? "Expert Approved" : "Pending Evaluation"}
                      </span>
                    )}
                  </div>
                  <div className="quiz-card-content">
                    <span className="quiz-skill">{quiz.skill}</span>
                    <h3>{quiz.title}</h3>
                    <p>{quiz.description}</p>
                    <div className="quiz-meta">
                      <span><i className="bi bi-question-circle"></i> {quiz.question_count || 10} Questions</span>
                      <span><i className="bi bi-clock"></i> {quiz.duration_minutes || 15} min</span>
                      <span><i className="bi bi-bar-chart"></i> {quiz.difficulty}</span>
                    </div>
                    <div className="quiz-card-footer">
                      <span className="quiz-status">{isCompleted ? "Completed" : "Available"}</span>
                      <button className="quiz-start-button" onClick={() => initiateQuiz(quiz)}>
                        {isCompleted ? "Retake Quiz" : "Start Quiz"}
                        <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── STUDENT-CREATED QUIZZES ───────────────────────────────────── */}
        {studentQuizzes.length > 0 && (
          <section className="quiz-section">
            <div className="quiz-section-header">
              <div>
                <span className="student-section-label">CREATED BY YOU</span>
                <h2>My Quizzes</h2>
                <p>Quizzes you created and sent to your mentor for review.</p>
              </div>
            </div>
            <div className="quiz-grid">
              {studentQuizzes.map((quiz) => {
                const isCompleted = completedQuizIds.has(quiz.id);
                return (
                  <article className="quiz-card" key={quiz.id}>
                    <div className="quiz-card-top">
                      <div className="quiz-card-icon"><i className="bi bi-patch-question"></i></div>
                      <span className="quiz-ai-badge" style={{ background: quiz.status === "approved" ? "#ecfdf5" : "#fef3c7", color: quiz.status === "approved" ? "#047857" : "#b45309" }}>
                        {quiz.status === "approved" ? "Expert Approved" : "Pending Evaluation"}
                      </span>
                    </div>
                    <div className="quiz-card-content">
                      <span className="quiz-skill">{quiz.skill}</span>
                      <h3>{quiz.title}</h3>
                      <p>{quiz.description}</p>
                      <div className="quiz-meta">
                        <span><i className="bi bi-question-circle"></i> {quiz.question_count || 10} Questions</span>
                        <span><i className="bi bi-clock"></i> {quiz.duration_minutes || 15} min</span>
                        <span><i className="bi bi-bar-chart"></i> {quiz.difficulty}</span>
                      </div>
                      <div className="quiz-card-footer">
                        <span className="quiz-status">{isCompleted ? "Completed" : quiz.status === "approved" ? "Available" : "Pending Review"}</span>
                        {quiz.status === "approved" && (
                          <button className="quiz-start-button" onClick={() => initiateQuiz(quiz)}>
                            {isCompleted ? "Retake" : "Start Quiz"} <i className="bi bi-arrow-right"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* MODE SELECTION MODAL */}
        {quizToStart && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "1rem",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "480px",
                padding: "2rem",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  fontSize: "1.5rem",
                }}
              >
                <i className="bi bi-stopwatch"></i>
              </div>

              <h2 style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>
                Start {quizToStart.title}
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                }}
              >
                Choose your preferred test mode before answering:
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <button
                  className="student-primary-btn"
                  onClick={() => startQuiz(quizToStart, true)}
                  style={{ justifyContent: "center", padding: "0.8rem 1rem" }}
                >
                  <i
                    className="bi bi-alarm"
                    style={{ marginRight: "0.4rem" }}
                  ></i>
                  Time-Bound Mode (15-min countdown)
                </button>

                <button
                  className="quiz-secondary-button"
                  onClick={() => startQuiz(quizToStart, false)}
                  style={{ justifyContent: "center", padding: "0.8rem 1rem" }}
                >
                  <i
                    className="bi bi-hourglass"
                    style={{ marginRight: "0.4rem" }}
                  ></i>
                  Self-Paced Mode (Take your time)
                </button>
              </div>

              <button
                onClick={() => setQuizToStart(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* CREATE QUIZ MODAL */}
        <section className="quiz-section">
          <div className="quiz-section-header">
            <div>
              <span className="student-section-label">MENTOR REVIEW</span>
              <h2>My Quiz Submissions</h2>
              <p>Quizzes you created and sent to your mentor, with their review status.</p>
            </div>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="my-sub-empty">
              <i className="bi bi-send"></i>
              <p>
                You haven't sent any quizzes yet. Use <strong>Create Quiz &amp; Send to Mentor</strong> above
                to write your own questions for your mentor to review.
              </p>
            </div>
          ) : (
            <div className="my-sub-list">
              {mySubmissions.map((sub) => (
                <article className="my-sub-row" key={sub.id}>
                  <div className="my-sub-main">
                    <strong>{sub.title}</strong>
                    <span>
                      {sub.skill} • {sub.difficulty} • {sub.question_count} question
                      {sub.question_count === 1 ? "" : "s"}
                    </span>
                    {sub.review_notes && sub.status !== "pending" && (
                      <p className="my-sub-notes">
                        <i className="bi bi-chat-left-text"></i> Mentor: {sub.review_notes}
                      </p>
                    )}
                  </div>
                  <span className={`my-sub-status ${sub.status}`}>
                    {sub.status === "approved"
                      ? "Approved"
                      : sub.status === "rejected"
                        ? "Needs changes"
                        : "Waiting for mentor"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        {showCreateModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "1rem",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "650px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "2rem",
                position: "relative",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
            >
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>

              <span className="student-section-label">STUDENT COMMUNITY</span>
              <h2 style={{ margin: "0.3rem 0 0.5rem", fontSize: "1.3rem" }}>
                Create a Quiz for Mentor Review
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                }}
              >
                Write your questions and send the quiz to your mentor. They check
                the questions and answer key, and once approved the quiz is added
                to your quiz list.
              </p>

              {myMentors.length > 0 ? (
                <div className="quiz-mentor-banner ok">
                  <i className="bi bi-person-check-fill"></i>
                  <span>
                    Will be sent to:{" "}
                    <strong>
                      {myMentors.map((m) => `${m.name}${m.company ? ` (${m.company})` : ""}`).join(", ")}
                    </strong>
                  </span>
                </div>
              ) : (
                <div className="quiz-mentor-banner warn">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>
                    You are not connected with a mentor yet. Your quiz will be saved and reviewed once a
                    mentor accepts your{" "}
                    <a href="/student/industry-professionals">guidance request</a>.
                  </span>
                </div>
              )}

              {createMessage && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: createMessage.includes("successfully")
                      ? "#ecfdf5"
                      : "#fee2e2",
                    color: createMessage.includes("successfully")
                      ? "#047857"
                      : "#b91c1c",
                    marginBottom: "1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  {createMessage}
                </div>
              )}

              <form onSubmit={handleCreateQuizSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced SQL Joins"
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Domain / Skill
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SQL, Python, React"
                      value={createSkill}
                      onChange={(e) => setCreateSkill(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Difficulty Level
                    </label>
                    <select
                      value={createDifficulty}
                      onChange={(e) => setCreateDifficulty(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Short Description
                    </label>
                    <input
                      type="text"
                      placeholder="Brief overview of quiz content"
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>
                    Questions ({createQuestions.length})
                  </h4>

                  {createQuestions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      style={{
                        padding: "1rem",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        marginBottom: "1rem",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#334155",
                          marginBottom: "0.3rem",
                        }}
                      >
                        Question {qIndex + 1}
                      </label>
                      <input
                        type="text"
                        placeholder="Type question here..."
                        value={q.question}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "question",
                            e.target.value,
                          )
                        }
                        required
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          marginBottom: "0.75rem",
                        }}
                      />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.5rem",
                        }}
                      >
                        {q.options.map((opt, oIndex) => (
                          <div
                            key={oIndex}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correct_index === oIndex}
                              onChange={() =>
                                handleQuestionChange(
                                  qIndex,
                                  "correct_index",
                                  oIndex,
                                )
                              }
                            />
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(
                                  qIndex,
                                  oIndex,
                                  e.target.value,
                                )
                              }
                              required
                              style={{
                                width: "100%",
                                padding: "0.45rem 0.6rem",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                fontSize: "0.85rem",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <small
                        style={{
                          color: "#64748b",
                          display: "block",
                          marginTop: "0.4rem",
                        }}
                      >
                        Select the radio button next to the correct answer.
                      </small>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddQuestionToCreate}
                    className="quiz-secondary-button"
                    style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                  >
                    <i className="bi bi-plus-lg"></i>
                    Add Another Question
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "1rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="quiz-secondary-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="student-primary-btn"
                    disabled={createSubmitting}
                  >
                    <i className="bi bi-send"></i>
                    {createSubmitting
                      ? "Submitting..."
                      : "Send to Mentor for Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentQuizzes;
