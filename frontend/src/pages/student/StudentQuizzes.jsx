import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentQuizzes.css";

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");

  const [selectedQuiz, setSelectedQuiz] = useState(null); // full quiz detail w/ questions
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState(null); // { score, total_questions }

  const user = JSON.parse(localStorage.getItem("user"));

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        api.get("quizzes/", { params: { user_id: user?.user_id } }),
        api.get("quizzes/my-attempts/", { params: { user_id: user?.user_id } }),
      ]);
      setQuizzes(quizRes.data);
      setAttempts(attemptsRes.data);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
      setError("Could not load your quizzes right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedQuizIds = new Set(attempts.map((a) => a.quiz));
  const allCompleted = quizzes.length > 0 && quizzes.every((q) => completedQuizIds.has(q.id));

  const averageScore = attempts.length
    ? Math.round(
        (attempts.reduce((sum, a) => sum + a.score / a.total_questions, 0) / attempts.length) * 100
      )
    : 0;

  const aiRecommendedCount = quizzes.filter((q) => q.ai_recommended).length;

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (activeFilter === "All") return true;
    const status = completedQuizIds.has(quiz.id) ? "Completed" : "Available";
    return status === activeFilter;
  });

  // ===================================================
  // START QUIZ — fetch full question detail on demand
  // ===================================================
  const startQuiz = async (quiz) => {
    try {
      const response = await api.get(`quizzes/${quiz.id}/`);
      setSelectedQuiz(response.data);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers({});
      setQuizFinished(false);
      setResult(null);
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
    try {
      const response = await api.post(`quizzes/${selectedQuiz.id}/submit/`, {
        user_id: user?.user_id,
        answers,
      });
      setResult(response.data);
      setQuizFinished(true);
      // refresh stats/attempts in the background
      loadData();
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      alert("Could not submit your quiz. Please try again.");
    }
  };

  const closeQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizFinished(false);
    setResult(null);
  };

  const retakeQuiz = () => {
    if (!selectedQuiz) return;
    startQuiz(selectedQuiz);
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    setGenerateMessage("");
    try {
      await api.post("quizzes/generate-new/", { user_id: user?.user_id });
      setGenerateMessage("New quiz generated!");
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail || "Could not generate a new quiz right now.";
      setGenerateMessage(detail);
    } finally {
      setGenerating(false);
    }
  };

  // ===================================================
  // LOADING / ERROR
  // ===================================================
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
    const percentage = Math.round((result.score / result.total_questions) * 100);

    let resultMessage = "Keep practicing and continue building your skills.";
    if (percentage >= 80) {
      resultMessage = "Excellent work! You have a strong understanding of this topic.";
    } else if (percentage >= 60) {
      resultMessage = "Good progress! A little more practice can strengthen your understanding.";
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
              <span>{result.score} of {result.total_questions} correct</span>
            </div>

            <p>{resultMessage}</p>

            <div className="quiz-result-breakdown">
              <div>
                <span>Correct</span>
                <strong className="correct">{result.score}</strong>
              </div>
              <div>
                <span>Incorrect</span>
                <strong className="incorrect">{result.total_questions - result.score}</strong>
              </div>
              <div>
                <span>Accuracy</span>
                <strong>{percentage}%</strong>
              </div>
            </div>

            <div className="quiz-result-actions">
              <button className="student-primary-btn" onClick={retakeQuiz}>
                <i className="bi bi-arrow-repeat"></i>
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
  // QUIZ QUESTIONS SCREEN
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
              <span className="student-section-label">{selectedQuiz.skill}</span>
              <h1>{selectedQuiz.title}</h1>
              <span className="quiz-question-counter">
                Question {questionNumber} of {totalQuestions}
              </span>
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
            <div className="quiz-question-number">Question {questionNumber}</div>
            <h2>{question.question}</h2>

            <div className="quiz-options">
              {question.options.map((option, index) => (
                <button
                  key={option}
                  className={`quiz-option ${selectedAnswer === index ? "selected" : ""}`}
                  onClick={() => handleAnswer(index)}
                >
                  <span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                  {selectedAnswer === index && <i className="bi bi-check-circle-fill"></i>}
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

              <span>{questionNumber} / {totalQuestions}</span>

              <button
                className="student-primary-btn"
                onClick={nextQuestion}
                disabled={selectedAnswer === null}
              >
                {questionNumber === totalQuestions ? "Submit Quiz" : "Next Question"}
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </section>
        </div>
      </StudentLayout>
    );
  }

  // ===================================================
  // QUIZ LIST
  // ===================================================
  return (
    <StudentLayout pageTitle="Quizzes">
      <div className="quiz-page">

        <section className="quiz-introduction">
          <span className="student-section-label">KNOWLEDGE CHECK</span>
          <h1>Quizzes</h1>
          <p>
            Test your knowledge, identify areas for improvement and
            strengthen the skills in your career roadmap.
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

        {/* Generate New Quiz — only unlocked once everything is completed */}
        <section className="ai-quiz-card">
          <div className="ai-quiz-icon">
            <i className="bi bi-stars"></i>
          </div>

          <div className="ai-quiz-content">
            <span className="ai-label">
              {allCompleted ? "ALL QUIZZES COMPLETED" : "KEEP GOING"}
            </span>
            <h2>
              {allCompleted
                ? "Ready for a new challenge?"
                : "Finish your current quizzes to unlock a new one"}
            </h2>
            <p>
              {allCompleted
                ? "You've completed every quiz available to you. Generate a new one based on your roadmap skills."
                : `You have ${quizzes.length - attempts.length} quiz(zes) left before you can generate a new one.`}
            </p>
            {generateMessage && (
              <div className="ai-quiz-reason">
                <i className="bi bi-lightbulb"></i>
                <span>{generateMessage}</span>
              </div>
            )}
          </div>

          <button
            className="ai-quiz-action"
            onClick={handleGenerateNew}
            disabled={!allCompleted || generating}
          >
            {generating ? "Generating..." : "Generate New Quiz"}
            <i className="bi bi-arrow-right"></i>
          </button>
        </section>

        <section className="quiz-section">
          <div className="quiz-section-header">
            <div>
              <span className="student-section-label">YOUR LEARNING</span>
              <h2>Available Quizzes</h2>
              <p>Choose a quiz to test your knowledge.</p>
            </div>

            <button
              className="quiz-secondary-button"
              onClick={() => (window.location.href = "/student/quizzes/create")}
            >
              <i className="bi bi-plus-lg"></i>
              Create Your Own Quiz
            </button>
          </div>

          <div className="quiz-filters">
            {["All", "Available", "Completed"].map((filter) => (
              <button
                key={filter}
                className={`quiz-filter-button ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="quiz-grid">
            {filteredQuizzes.map((quiz) => {
              const isCompleted = completedQuizIds.has(quiz.id);
              return (
                <article className="quiz-card" key={quiz.id}>
                  <div className="quiz-card-top">
                    <div className="quiz-card-icon">
                      <i className="bi bi-patch-question"></i>
                    </div>
                    {quiz.ai_recommended && (
                      <span className="quiz-ai-badge">
                        <i className="bi bi-stars"></i>
                        AI Recommended
                      </span>
                    )}
                  </div>

                  <div className="quiz-card-content">
                    <span className="quiz-skill">{quiz.skill}</span>
                    <h3>{quiz.title}</h3>
                    <p>{quiz.description}</p>

                    <div className="quiz-meta">
                      <span>
                        <i className="bi bi-question-circle"></i>
                        {quiz.question_count} Questions
                      </span>
                      <span>
                        <i className="bi bi-clock"></i>
                        {quiz.duration_minutes} min
                      </span>
                      <span>
                        <i className="bi bi-bar-chart"></i>
                        {quiz.difficulty}
                      </span>
                    </div>

                    <div className="quiz-card-footer">
                      <span className="quiz-status">
                        {isCompleted ? "Completed" : "Available"}
                      </span>

                      <button className="quiz-start-button" onClick={() => startQuiz(quiz)}>
                        {isCompleted ? "Retake Quiz" : "Start Quiz"}
                        <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredQuizzes.length === 0 && (
              <p>No quizzes match this filter yet.</p>
            )}
          </div>
        </section>

      </div>
    </StudentLayout>
  );
};

export default StudentQuizzes;