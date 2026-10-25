import React, { useEffect, useState, useRef } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentLearningWorkspace.css";

// ─── Helper: check if all 3 criteria met for a skill ─────────────────────────
const isCriteriaComplete = (skillKey, verifiedLessons, practiceSubmissions, quizResults) => {
  const learned = verifiedLessons[skillKey] === true;
  const practiced = !!practiceSubmissions[skillKey];
  const passed = (quizResults[skillKey]?.percent ?? 0) >= 70;
  return learned && practiced && passed;
};

// ─── Mini Quiz Component ──────────────────────────────────────────────────────
// ─── Mini Quiz Component ──────────────────────────────────────────────────────
const MiniQuiz = ({ skillName, onPass, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchOrGenerate = async () => {
      try {
        const res = await api.get("quizzes/mini-quiz/", {
          params: { skill: skillName, user_id: user?.user_id, count: 8 },
        });
        if (res.data?.questions && res.data.questions.length >= 4) {
          setQuestions(res.data.questions);
        } else {
          setQuestions(getSkillFallbackQuestions(skillName));
        }
      } catch (err) {
        console.warn("Could not load backend mini quiz, using skill questions:", err);
        setQuestions(getSkillFallbackQuestions(skillName));
      } finally {
        setLoading(false);
      }
    };
    fetchOrGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillName]);

  const getSkillFallbackQuestions = (skill) => {
    const sLower = skill.toLowerCase();
    if (sLower.includes("react")) {
      return [
        { id: 1, question: "Which React hook is used to manage local component state?", options: ["useEffect", "useState", "useContext", "useReducer"], correct_index: 1 },
        { id: 2, question: "What is JSX in React?", options: ["A syntax extension for JavaScript that resembles HTML", "A CSS preprocessor", "A relational database query language", "A browser engine"], correct_index: 0 },
        { id: 3, question: "When does the effect callback in `useEffect(() => {}, [])` execute?", options: ["On every render", "Only once after initial mount", "Before every state update", "Only when unmounting"], correct_index: 1 },
        { id: 4, question: "Why must list elements in React have unique `key` props?", options: ["To help React identify changed, added, or removed items efficiently", "To assign CSS class names", "To encrypt user data", "To sort the array"], correct_index: 0 },
        { id: 5, question: "What is the Virtual DOM in React?", options: ["An in-memory lightweight representation of the real DOM", "A browser extension", "A cloud server cache", "An SVG canvas"], correct_index: 0 },
        { id: 6, question: "How is data typically passed from parent to child components in React?", options: ["Via props", "Via global cookies", "Via URL hash only", "Via localStorage"], correct_index: 0 },
        { id: 7, question: "Which hook should you use to memoize an expensive calculation?", options: ["useMemo", "useCallback", "useRef", "useId"], correct_index: 0 },
        { id: 8, question: "What hook allows referencing a DOM node without triggering a re-render?", options: ["useRef", "useState", "useMemo", "useEffect"], correct_index: 0 },
      ];
    }
    if (sLower.includes("sql") || sLower.includes("database")) {
      return [
        { id: 1, question: "Which SQL command is used to extract data from a database?", options: ["GET", "SELECT", "FETCH", "QUERY"], correct_index: 1 },
        { id: 2, question: "Which clause filters rows in SQL based on specified conditions?", options: ["ORDER BY", "GROUP BY", "WHERE", "LIMIT"], correct_index: 2 },
        { id: 3, question: "Which JOIN returns records that have matching values in both tables?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], correct_index: 2 },
        { id: 4, question: "What is the purpose of a PRIMARY KEY in a relational database?", options: ["Speed up queries only", "Uniquely identify each record in a table", "Allow duplicate records", "Encrypt table fields"], correct_index: 1 },
        { id: 5, question: "Which aggregate function calculates the total number of rows matching a condition?", options: ["SUM()", "TOTAL()", "COUNT()", "AVG()"], correct_index: 2 },
        { id: 6, question: "Which clause is used with aggregate functions to filter grouped records?", options: ["WHERE", "HAVING", "FILTER", "ORDER"], correct_index: 1 },
        { id: 7, question: "Which command permanently deletes a table and its schema from a database?", options: ["DELETE", "REMOVE", "DROP", "TRUNCATE"], correct_index: 2 },
        { id: 8, question: "What does an INDEX on a table column primarily improve?", options: ["Data retrieval query speed", "Data encryption security", "Disk storage space", "Network bandwidth"], correct_index: 0 },
      ];
    }
    if (sLower.includes("python")) {
      return [
        { id: 1, question: "Which Python data type is immutable?", options: ["List", "Dictionary", "Tuple", "Set"], correct_index: 2 },
        { id: 2, question: "What keyword defines a function in Python?", options: ["func", "def", "function", "lambda"], correct_index: 1 },
        { id: 3, question: "Which method removes and returns the last element of a Python list?", options: ["remove()", "pop()", "delete()", "discard()"], correct_index: 1 },
        { id: 4, question: "What does the `is` keyword check in Python?", options: ["Value equality", "Memory object identity", "Type compatibility", "Subset membership"], correct_index: 1 },
        { id: 5, question: "How do you open a file safely ensuring automatic cleanup?", options: ["open('f.txt')", "with open('f.txt') as f:", "file.read('f.txt')", "try: f.open()"], correct_index: 1 },
        { id: 6, question: "What will `[x*2 for x in range(3)]` produce?", options: ["[0, 2, 4]", "[2, 4, 6]", "[0, 1, 2]", "[1, 2, 3]"], correct_index: 0 },
        { id: 7, question: "What is a Python decorator?", options: ["A GUI stylesheet", "A function that extends another function without modifying its source", "A database migration", "A compiler option"], correct_index: 1 },
        { id: 8, question: "Which module handles JSON parsing in Python?", options: ["json", "parser", "pickle", "serialize"], correct_index: 0 },
      ];
    }
    // General technical skill fallback
    return [
      { id: 1, question: `What is the primary role of ${skill} in practical development?`, options: [`To implement core functionality and workflows in ${skill}`, `To replace hardware processors`, `To bypass all security layers`, `To eliminate all testing`], correct_index: 0 },
      { id: 2, question: `Which best practice is critical when writing code or configuring ${skill}?`, options: [`Clear modular organization and error handling`, `Putting all logic in one massive file`, `Avoiding all documentation`, `Ignoring security requirements`], correct_index: 0 },
      { id: 3, question: `When debugging an issue related to ${skill}, what should be the first step?`, options: [`Review logs, inspect error messages, and isolate the reproducible cause`, `Delete the repository and start over`, `Change random lines until it runs`, `Ignore warnings`], correct_index: 0 },
      { id: 4, question: `How do teams ensure maintainability when collaborating with ${skill}?`, options: [`Using version control, peer reviews, and automated tests`, `Sharing code over personal email`, `Overwriting files directly on production`, `Skipping documentation`], correct_index: 0 },
      { id: 5, question: `What is the benefit of writing unit and integration tests for ${skill}?`, options: [`Verifying correctness and catching regressions before deployment`, `Making execution 10x slower`, `Replacing system requirements`, `Preventing future code edits`], correct_index: 0 },
      { id: 6, question: `What does scalability mean in the context of ${skill}?`, options: [`The capacity to handle increasing workload or traffic without degradation`, `Compressing files on disk`, `Limiting user access to 10 users`, `Switching programming languages`], correct_index: 0 },
      { id: 7, question: `Which documentation is most authoritative when working with ${skill}?`, options: [`Official documentation and API specifications`, `Unverified social media comments`, `Outdated blog posts from 2005`, `Random code snippets`], correct_index: 0 },
      { id: 8, question: `How is proficiency in ${skill} best demonstrated to mentors and employers?`, options: [`Building practical, well-architected projects with clean code`, `Only memorizing keyword definitions`, `Copying code without understanding`, `Claiming skills without evidence`], correct_index: 0 },
    ];
  };

  const handleAnswer = (idx) => {
    setSelected(idx);
    setAnswers((prev) => ({ ...prev, [currentQ]: idx }));
  };

  const next = () => {
    if (selected === null) return;
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(answers[currentQ + 1] ?? null);
    } else {
      let correct = 0;
      questions.forEach((q, idx) => {
        if (Number(answers[idx]) === Number(q.correct_index)) correct++;
      });
      setScore(correct);
      setFinished(true);
    }
  };

  const prev = () => {
    if (currentQ === 0) return;
    setCurrentQ(currentQ - 1);
    setSelected(answers[currentQ - 1] ?? null);
  };

  if (loading) {
    return (
      <div className="lw-quiz-overlay">
        <div className="lw-quiz-modal">
          <div className="lw-quiz-loading">
            <i className="bi bi-arrow-repeat lw-spin"></i>
            <p>Preparing quiz for {skillName}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    const passed = percent >= 70;
    return (
      <div className="lw-quiz-overlay">
        <div className="lw-quiz-modal" style={{ maxWidth: "620px" }}>
          <button className="lw-quiz-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
          <div className={`lw-quiz-result ${passed ? "passed" : "failed"}`}>
            <div className="lw-quiz-result-icon">
              <i className={`bi ${passed ? "bi-trophy-fill" : "bi-x-circle-fill"}`}></i>
            </div>
            <h2>{passed ? "Quiz Passed! 🎉" : "Not quite there yet"}</h2>
            <div className="lw-quiz-score">
              <strong>{percent}%</strong>
              <span>{score} of {questions.length} correct (Passing threshold: 70%)</span>
            </div>
            <p>{passed ? "Congratulations! You've demonstrated a solid understanding of this skill." : "You need at least 70% to pass this skill challenge. Review the answers below and try again."}</p>

            {/* Detailed Question Review */}
            <div className="lw-quiz-review">
              <strong style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#334155" }}>
                Answers Review ({score}/{questions.length} Correct):
              </strong>
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const isRight = Number(userAns) === Number(q.correct_index);
                return (
                  <div key={idx} className="lw-quiz-review-item">
                    <div style={{ fontWeight: "600", color: isRight ? "#15803d" : "#b91c1c", marginBottom: "3px" }}>
                      {isRight ? "✓" : "✗"} Q{idx + 1}: {q.question}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Your answer: <strong style={{ color: isRight ? "#15803d" : "#b91c1c" }}>{q.options[userAns] || "Not answered"}</strong>
                      {!isRight && (
                        <div style={{ color: "#15803d", marginTop: "2px" }}>
                          ✓ Correct answer: <strong>{q.options[q.correct_index]}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {passed ? (
              <button className="lw-btn-primary" onClick={() => onPass(percent)} style={{ marginTop: "1rem" }}>
                <i className="bi bi-check-circle-fill"></i> Confirm & Mark Skill Done
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
                <button className="lw-btn-primary" onClick={() => { setFinished(false); setCurrentQ(0); setSelected(null); setAnswers({}); }}>
                  <i className="bi bi-arrow-clockwise"></i> Retake Quiz
                </button>
                <button className="lw-btn-secondary" onClick={onClose}>Back to Skill</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="lw-quiz-overlay">
        <div className="lw-quiz-modal">
          <button className="lw-quiz-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
          <p style={{ textAlign: "center", padding: "2rem" }}>No quiz questions available for this skill yet.</p>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="lw-quiz-overlay">
      <div className="lw-quiz-modal">
        <button className="lw-quiz-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
        <div className="lw-quiz-header">
          <span className="lw-label">PROVE UNDERSTANDING</span>
          <h2>{skillName} — Mini Quiz</h2>
          <span className="lw-quiz-counter">Question {currentQ + 1} of {questions.length} &nbsp;|&nbsp; Passing score: 70%</span>
        </div>
        <div className="lw-quiz-progress-bar">
          <div style={{ width: `${progress}%` }}></div>
        </div>
        <div className="lw-quiz-question">
          <div className="lw-quiz-q-number">Q{currentQ + 1}</div>
          <h3>{q.question}</h3>
        </div>
        <div className="lw-quiz-options">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              className={`lw-quiz-option ${selected === idx ? "selected" : ""}`}
              onClick={() => handleAnswer(idx)}
            >
              <span className="lw-quiz-letter">{String.fromCharCode(65 + idx)}</span>
              <span>{opt}</span>
              {selected === idx && <i className="bi bi-check-circle-fill"></i>}
            </button>
          ))}
        </div>
        <div className="lw-quiz-nav">
          <button className="lw-btn-secondary" onClick={prev} disabled={currentQ === 0}>
            <i className="bi bi-arrow-left"></i> Previous
          </button>
          <span className="lw-quiz-nav-counter">{currentQ + 1} / {questions.length}</span>
          <button className="lw-btn-primary" onClick={next} disabled={selected === null}>
            {currentQ === questions.length - 1 ? "Submit" : "Next"}
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skill Panel Component ────────────────────────────────────────────────────
const SkillPanel = ({
  skill,
  stageLevel,
  verifiedLessons,
  onLessonVerify,
  practiceSubmissions,
  onPracticeSubmit,
  quizResults,
  onQuizPass,
  mentors,
}) => {
  const skillKey = skill.name;
  const [activeTab, setActiveTab] = useState("learn");
  const [projectLink, setProjectLink] = useState(practiceSubmissions[skillKey]?.link || "");
  const [codeSnippet, setCodeSnippet] = useState(practiceSubmissions[skillKey]?.code || "");
  const [practiceNote, setPracticeNote] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Available mentors: accepted/approved mentors, or any connected mentors
  const acceptedMentors = (mentors || []).filter(
    (m) => m.status === "approved" || m.status === "accepted"
  );
  const activeMentors = acceptedMentors.length > 0 ? acceptedMentors : (mentors || []);

  const [selectedMentorId, setSelectedMentorId] = useState(() => {
    if (practiceSubmissions[skillKey]?.mentor_id) {
      return String(practiceSubmissions[skillKey].mentor_id);
    }
    if (activeMentors.length > 0) {
      return String(activeMentors[0].userId || activeMentors[0].user_id);
    }
    return "";
  });

  useEffect(() => {
    if (activeMentors.length === 1) {
      setSelectedMentorId(String(activeMentors[0].userId || activeMentors[0].user_id));
    } else if (activeMentors.length > 1 && !selectedMentorId) {
      setSelectedMentorId(String(activeMentors[0].userId || activeMentors[0].user_id));
    }
  }, [activeMentors, selectedMentorId]);

  const learned = verifiedLessons[skillKey] === true;
  const practiced = !!practiceSubmissions[skillKey];
  const quizPercent = quizResults[skillKey]?.percent ?? null;
  const quizPassed = quizPercent !== null && quizPercent >= 70;
  const isComplete = isCriteriaComplete(skillKey, verifiedLessons, practiceSubmissions, quizResults);

  const resources = skill.resources && skill.resources.length > 0 ? skill.resources : [
    { title: `${skill.name} – Official Documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skill.name + " official documentation")}`, type: "docs" },
    { title: `${skill.name} for Beginners (YouTube)`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill.name + " tutorial")}`, type: "video" },
    { title: `${skill.name} – Free Course (Coursera)`, url: `https://www.coursera.org/search?query=${encodeURIComponent(skill.name)}`, type: "course" },
    { title: `Practice ${skill.name} Problems`, url: `https://www.google.com/search?q=${encodeURIComponent(skill.name + " practice exercises")}`, type: "practice" },
  ];

  const resourceIcons = { docs: "bi-file-text", video: "bi-play-btn", course: "bi-book", practice: "bi-code-slash" };

  const handlePracticeSubmit = async () => {
    if (!projectLink.trim() && !codeSnippet.trim()) {
      setPracticeNote("Please provide at least a project link or code snippet.");
      return;
    }
    setSubmitting(true);
    try {
      const chosenMentorId = activeMentors.length === 1
        ? (activeMentors[0].userId || activeMentors[0].user_id)
        : (activeMentors.length > 1 ? selectedMentorId : null);

      await onPracticeSubmit(skillKey, {
        link: projectLink,
        code: codeSnippet,
        mentor_id: chosenMentorId,
      });

      const chosenMentor = activeMentors.find(
        (m) => String(m.userId || m.user_id) === String(chosenMentorId)
      );
      if (chosenMentor) {
        setPracticeNote(`success:Practice project submitted directly to your mentor ${chosenMentor.name}!`);
      } else {
        setPracticeNote("success:Practice work saved to your learning workspace!");
      }
    } catch {
      setPracticeNote("error:Could not submit practice work. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: "learn", label: "1. Learn", icon: "bi-book", done: learned },
    { id: "practice", label: "2. Practice", icon: "bi-code-slash", done: practiced },
    { id: "prove", label: "3. Prove Understanding", icon: "bi-patch-question", done: quizPassed },
  ];

  const noteIsSuccess = practiceNote.startsWith("success:");
  const practiceNoteText = practiceNote.replace(/^(success|error):/, "");

  return (
    <div className={`lw-skill-panel ${isComplete ? "complete" : ""}`}>
      <div className="lw-skill-panel-header">
        <div className="lw-skill-panel-title">
          <div className={`lw-skill-icon-badge ${isComplete ? "complete" : ""}`}>
            {isComplete ? <i className="bi bi-check-lg"></i> : <i className="bi bi-lightning"></i>}
          </div>
          <div>
            <h3>{skill.name}</h3>
            <span className="lw-skill-stage">{stageLevel}</span>
          </div>
        </div>
        <div className="lw-skill-panel-status">
          <div className="lw-criteria-pills">
            <span className={`lw-pill ${learned ? "done" : ""}`} title="Learn">
              <i className="bi bi-book"></i> Learn
            </span>
            <span className={`lw-pill ${practiced ? "done" : ""}`} title="Practice">
              <i className="bi bi-code-slash"></i> Practice
            </span>
            <span className={`lw-pill ${quizPassed ? "done" : ""}`} title="Prove">
              <i className="bi bi-patch-check"></i> Prove
            </span>
          </div>
          {isComplete && (
            <span className="lw-complete-badge">
              <i className="bi bi-trophy-fill"></i> Completed
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="lw-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`lw-tab ${activeTab === tab.id ? "active" : ""} ${tab.done ? "done" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi ${tab.icon}`}></i>
            {tab.label}
            {tab.done && <i className="bi bi-check-circle-fill lw-tab-check"></i>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="lw-tab-content">

        {/* LEARN */}
        {activeTab === "learn" && (
          <div className="lw-learn-tab">
            <div className="lw-tab-intro">
              <h4><i className="bi bi-stars"></i> External Learning Resources</h4>
              <p>Explore these curated resources to build your understanding of <strong>{skill.name}</strong>. Once you've gone through them, mark as learned.</p>
            </div>
            <div className="lw-resources-list">
              {resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lw-resource-card"
                >
                  <div className="lw-resource-icon">
                    <i className={`bi ${resourceIcons[res.type] || "bi-link-45deg"}`}></i>
                  </div>
                  <div className="lw-resource-info">
                    <strong>{res.title}</strong>
                    <span>{res.type ? res.type.charAt(0).toUpperCase() + res.type.slice(1) : "Resource"}</span>
                  </div>
                  <i className="bi bi-box-arrow-up-right lw-resource-arrow"></i>
                </a>
              ))}
            </div>
            {skill.what_to_learn && (
              <div className="lw-what-to-learn">
                <h4><i className="bi bi-lightbulb"></i> What to Focus On</h4>
                <p>{skill.what_to_learn}</p>
              </div>
            )}
            {skill.why_it_matters && (
              <div className="lw-what-to-learn">
                <h4><i className="bi bi-info-circle"></i> Why It Matters</h4>
                <p>{skill.why_it_matters}</p>
              </div>
            )}
            {!learned ? (
              <button className="lw-btn-primary lw-verify-btn" onClick={() => onLessonVerify(skillKey)}>
                <i className="bi bi-check-circle"></i> Mark as Learned
              </button>
            ) : (
              <div className="lw-verified-banner">
                <i className="bi bi-check-circle-fill"></i> You've verified this lesson!
                <button className="lw-next-tab-btn" onClick={() => setActiveTab("practice")}>
                  Next: Practice <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* PRACTICE */}
        {activeTab === "practice" && (
          <div className="lw-practice-tab">
            <div className="lw-tab-intro">
              <h4><i className="bi bi-code-slash"></i> Submit Your Practice Work</h4>
              <p>Apply what you've learned by completing a project or exercise for <strong>{skill.name}</strong>. Submit your GitHub link or paste a code snippet.</p>
            </div>
            {practiced && (
              <div className="lw-verified-banner">
                <i className="bi bi-check-circle-fill"></i> Practice work already submitted. You can update it below.
              </div>
            )}
            <div className="lw-practice-form">
              {/* Mentor selection logic */}
              {activeMentors.length > 1 ? (
                <div className="lw-mentor-select-banner">
                  <label>
                    <i className="bi bi-person-badge"></i> Select Mentor for Review *
                  </label>
                  <p>
                    You have multiple mentors connected. Select who should review your {skill.name} project:
                  </p>
                  <select
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    className="lw-input"
                  >
                    {activeMentors.map((m) => {
                      const mId = m.userId || m.user_id;
                      const roleInfo = m.designation ? `${m.designation} at ${m.company}` : (m.company || "Mentor");
                      return (
                        <option key={mId} value={mId}>
                          {m.name} ({roleInfo})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : activeMentors.length === 1 ? (
                <div className="lw-single-mentor-banner">
                  <i className="bi bi-person-check-fill"></i>
                  <div>
                    <strong>Reviewer: {activeMentors[0].name}</strong>
                    <span>Your submission will be directly submitted to your mentor ({activeMentors[0].designation ? `${activeMentors[0].designation} at ` : ""}{activeMentors[0].company || "Mentor"}).</span>
                  </div>
                </div>
              ) : (
                <div className="lw-no-mentor-banner">
                  <i className="bi bi-info-circle"></i>
                  <span>You do not have an active mentor yet. Your practice project will be saved to your learning workspace.</span>
                </div>
              )}

              <div className="lw-form-group">
                <label><i className="bi bi-link-45deg"></i> Project / Repository Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/your-project"
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  className="lw-input"
                />
              </div>
              <div className="lw-form-group">
                <label><i className="bi bi-code-square"></i> Code Submission (paste your code)</label>
                <textarea
                  placeholder={`# Paste your ${skill.name} code or solution here...`}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="lw-textarea lw-code-area"
                  rows={7}
                />
              </div>
              {practiceNote && (
                <p className={`lw-practice-note ${noteIsSuccess ? "success" : "error"}`}>
                  {noteIsSuccess && <i className="bi bi-check-circle-fill"></i>}
                  {!noteIsSuccess && <i className="bi bi-exclamation-circle"></i>}
                  {practiceNoteText}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="lw-btn-primary" onClick={handlePracticeSubmit} disabled={submitting}>
                  {submitting
                    ? <><i className="bi bi-hourglass"></i> Submitting...</>
                    : <><i className="bi bi-cloud-upload"></i> Submit Practice Work</>}
                </button>
                {practiced && (
                  <button className="lw-btn-secondary" onClick={() => setActiveTab("prove")}>
                    Next: Prove Understanding <i className="bi bi-arrow-right"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}


        {/* PROVE UNDERSTANDING */}
        {activeTab === "prove" && (
          <div className="lw-prove-tab">
            <div className="lw-tab-intro">
              <h4><i className="bi bi-patch-question"></i> Prove Your Understanding</h4>
              <p>Answer 8 questions about <strong>{skill.name}</strong>. You need <strong>70% or higher</strong> to pass and automatically mark this skill as complete.</p>
            </div>

            {quizPassed ? (
              <div className="lw-verified-banner">
                <i className="bi bi-trophy-fill"></i> Quiz Passed with {quizPercent}%! Skill marked as complete.
              </div>
            ) : quizPercent !== null ? (
              <div className="lw-quiz-fail-banner">
                <i className="bi bi-x-circle"></i> Last attempt: {quizPercent}% — You need 70%. Try again!
              </div>
            ) : null}

            <div className="lw-prove-info-grid">
              <div className="lw-prove-info-card">
                <i className="bi bi-question-circle"></i>
                <strong>8 Questions</strong>
                <span>Multiple choice</span>
              </div>
              <div className="lw-prove-info-card">
                <i className="bi bi-graph-up"></i>
                <strong>70% to Pass</strong>
                <span>Minimum score</span>
              </div>
              <div className="lw-prove-info-card">
                <i className="bi bi-arrow-clockwise"></i>
                <strong>Unlimited Retakes</strong>
                <span>Practice until pass</span>
              </div>
            </div>

            <button className="lw-btn-primary" onClick={() => setShowQuiz(true)}>
              <i className="bi bi-play-fill"></i>
              {quizPercent !== null ? "Retake Quiz" : "Start Quiz"}
            </button>

            {showQuiz && (
              <MiniQuiz
                skillName={skill.name}
                onPass={(pct) => { onQuizPass(skillKey, pct); setShowQuiz(false); }}
                onClose={() => setShowQuiz(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const StudentLearningWorkspace = () => {
  const [stages, setStages] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCareerName, setSelectedCareerName] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const storageKey = (type) => `lw_${user?.user_id}_${type}`;

  const [verifiedLessons, setVerifiedLessons] = useState(() =>
    JSON.parse(localStorage.getItem(storageKey("lessons")) || "{}")
  );
  const [practiceSubmissions, setPracticeSubmissions] = useState(() =>
    JSON.parse(localStorage.getItem(storageKey("practice")) || "{}")
  );
  const [quizResults, setQuizResults] = useState(() =>
    JSON.parse(localStorage.getItem(storageKey("quizzes")) || "{}")
  );
  const [completedSkills, setCompletedSkills] = useState(() =>
    JSON.parse(localStorage.getItem(storageKey("completed")) || "[]")
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const selectedCareer = JSON.parse(localStorage.getItem("selectedCareer") || "null");
        const params = { user_id: user?.user_id };
        if (selectedCareer?.career_name) {
          params.career_name = selectedCareer.career_name;
          setSelectedCareerName(selectedCareer.career_name);
        }
        const [careersRes, roadmapRes, mentorsRes] = await Promise.all([
          api.get("careers/", { params: { user_id: user?.user_id } }),
          api.get("roadmaps/", { params }),
          api.get("mentorship/my-mentors/", { params: { user_id: user?.user_id } }).catch(() => ({ data: [] })),
        ]);
        const cList = careersRes.data || [];
        if (!selectedCareer?.career_name && cList.length > 0) {
          setSelectedCareerName(cList[0].career_name);
          localStorage.setItem("selectedCareer", JSON.stringify(cList[0]));
        }
        setStages(roadmapRes.data || []);
        setMentors(mentorsRes.data || []);
      } catch (err) {
        console.error("Failed to load workspace:", err);
        setError("Could not load your learning workspace.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newCompleted = [];
    stages.forEach((stage) => {
      stage.skills.forEach((skill) => {
        if (isCriteriaComplete(skill.name, verifiedLessons, practiceSubmissions, quizResults)) {
          newCompleted.push(skill.name);
        }
      });
    });
    setCompletedSkills(newCompleted);
    localStorage.setItem(storageKey("completed"), JSON.stringify(newCompleted));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedLessons, practiceSubmissions, quizResults, stages]);

  const handleLessonVerify = (skillKey) => {
    const updated = { ...verifiedLessons, [skillKey]: true };
    setVerifiedLessons(updated);
    localStorage.setItem(storageKey("lessons"), JSON.stringify(updated));
  };

  const handlePracticeSubmit = async (skillKey, data) => {
    try {
      await api.post("tasks/submit-practice/", {
        user_id: user?.user_id,
        skill: skillKey,
        project_link: data.link,
        code_snippet: data.code,
        mentor_id: data.mentor_id || null,
      });
    } catch (err) {
      console.warn("Backend submit practice warning:", err);
    }
    const updated = { ...practiceSubmissions, [skillKey]: data };
    setPracticeSubmissions(updated);
    localStorage.setItem(storageKey("practice"), JSON.stringify(updated));
  };

  const handleQuizPass = (skillKey, percent) => {
    const updated = { ...quizResults, [skillKey]: { percent, passed: percent >= 70 } };
    setQuizResults(updated);
    localStorage.setItem(storageKey("quizzes"), JSON.stringify(updated));
  };


  const allSkills = stages.flatMap((s) => s.skills);
  const totalSkills = allSkills.length;
  const completedCount = completedSkills.length;
  const overallProgress = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;

  if (loading) {
    return (
      <StudentLayout pageTitle="Learning Workspace">
        <div className="lw-page">
          <div className="lw-loading">
            <i className="bi bi-arrow-repeat lw-spin" style={{ fontSize: "2.5rem", color: "#2f5bea" }}></i>
            <h2>Loading your workspace...</h2>
            <p>Fetching your personalised roadmap skills</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || stages.length === 0) {
    return (
      <StudentLayout pageTitle="Learning Workspace">
        <div className="lw-page">
          <section className="lw-intro">
            <span className="student-section-label">LEARNING WORKSPACE</span>
            <h1>Your Learning Workspace</h1>
            <p>{error || "Complete the career assessment first to get your personalised roadmap and workspace."}</p>
          </section>
          <button className="lw-btn-primary" onClick={() => (window.location.href = "/student/assessment")}>
            Take Career Assessment <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Learning Workspace">
      <div className="lw-page">

        {/* Header */}
        <section className="lw-intro">
          <span className="student-section-label">LEARNING WORKSPACE</span>
          <h1>Learning Workspace</h1>
          <p>
            Your personalised learning hub for <strong>{selectedCareerName || "your target career"}</strong>.
            Complete all three steps for each skill — <strong>Learn</strong>, <strong>Practice</strong>, and <strong>Prove</strong> — to auto-mark it as done.
          </p>
        </section>

        {/* Overview Card */}
        <section className="lw-overview-card">
          <div className="lw-overview-left">
            <div className="lw-overview-career-icon">
              <i className="bi bi-mortarboard"></i>
            </div>
            <div>
              <span className="lw-small-label">TARGET CAREER</span>
              <h2>{selectedCareerName || "Your Career Path"}</h2>
              <p>{completedCount} of {totalSkills} skills completed</p>
            </div>
          </div>
          <div className="lw-overview-right">
            <div className="lw-progress-circle">
              <strong>{overallProgress}%</strong>
              <span>Done</span>
            </div>
            <div>
              <span className="lw-small-label">WORKSPACE PROGRESS</span>
              <div className="lw-overview-progress-bar">
                <div style={{ width: `${overallProgress}%` }}></div>
              </div>
              <small>{totalSkills - completedCount} skills remaining</small>
            </div>
          </div>
        </section>

        {/* Criteria Legend */}
        <div className="lw-criteria-legend">
          <span className="lw-legend-title"><i className="bi bi-info-circle"></i> How skills are completed:</span>
          <div className="lw-legend-items">
            <span className="lw-legend-item"><i className="bi bi-book"></i> <strong>Learn</strong> — Study resources &amp; verify</span>
            <i className="bi bi-chevron-right lw-legend-sep"></i>
            <span className="lw-legend-item"><i className="bi bi-code-slash"></i> <strong>Practice</strong> — Submit project or code</span>
            <i className="bi bi-chevron-right lw-legend-sep"></i>
            <span className="lw-legend-item"><i className="bi bi-patch-question"></i> <strong>Prove</strong> — Pass quiz (8 Q, 70%+)</span>
            <i className="bi bi-chevron-right lw-legend-sep"></i>
            <span className="lw-legend-item lw-legend-complete"><i className="bi bi-trophy-fill"></i> <strong>Auto-marked Complete!</strong></span>
          </div>
        </div>

        {/* Stages */}
        {stages.map((stage) => (
          <section key={stage.id} className="lw-stage-section">
            <div className="lw-stage-header">
              <div className="lw-stage-title-block">
                <div className={`lw-stage-number ${stage.status}`}>{stage.order}</div>
                <div>
                  <h2>{stage.name}</h2>
                  <span className={`lw-stage-badge ${stage.status}`}>
                    {stage.status === "completed" ? "Stage Completed" : stage.status === "current" ? "Currently Learning" : "Upcoming Stage"}
                  </span>
                </div>
              </div>
              <div className="lw-stage-meta">
                <span><i className="bi bi-clock"></i> {stage.duration}</span>
                <span><i className="bi bi-lightning"></i> {stage.skills.length} skill{stage.skills.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {stage.description && (
              <p className="lw-stage-description">{stage.description}</p>
            )}

            <div className="lw-skills-list">
              {stage.skills.map((skill) => (
                <SkillPanel
                  key={skill.id || skill.name}
                  skill={skill}
                  stageLevel={stage.name}
                  verifiedLessons={verifiedLessons}
                  onLessonVerify={handleLessonVerify}
                  practiceSubmissions={practiceSubmissions}
                  onPracticeSubmit={handlePracticeSubmit}
                  quizResults={quizResults}
                  onQuizPass={handleQuizPass}
                  mentors={mentors}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Footer Navigation */}
        <section className="lw-footer-nav">
          <button className="lw-btn-secondary" onClick={() => (window.location.href = "/student/roadmap")}>
            <i className="bi bi-arrow-left"></i> Back to Roadmap
          </button>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="lw-btn-secondary" onClick={() => (window.location.href = "/student/skill-gap")}>
              <i className="bi bi-bar-chart"></i> Skill Gap
            </button>
            <button className="lw-btn-primary" onClick={() => (window.location.href = "/student/quizzes")}>
              More Quizzes <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </section>

      </div>
    </StudentLayout>
  );
};

export default StudentLearningWorkspace;
