import React, { useEffect, useMemo, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentTasks.css";

const aiRecommendation = {
  title: "Continue SQL & Technical Course Modules",
  description:
    "Based on your current roadmap progress, mastering your current stage skills is the most important step before advancing to the next roadmap milestone.",
  reason:
    "Strengthening your foundation helps you pass domain quizzes and accelerates your career readiness score.",
};

const getProgress = (task) => {
  if (!task.totalLessons) return 0;
  return Math.round((task.completedLessons / task.totalLessons) * 100);
};

const getStatus = (task) => {
  if (task.backendStatus === "Completed" || task.backendStatus === "Submitted") {
    return task.backendStatus;
  }
  const progress = getProgress(task);
  if (progress >= 100) return "Completed";
  if (progress > 0) return "In Progress";
  return "Not Started";
};

const mapTaskFromApi = (t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  type: t.assigned_by_mentor ? "Mentor Assignment" : "Course",
  skill: t.skill,
  courseName: t.course_name || t.title,
  courseId: t.course_name ? t.course_name.toLowerCase().replaceAll(" ", "-") : `task-${t.id}`,
  deadline: t.deadline || "Ongoing",
  completedLessons: t.completed_lessons,
  totalLessons: t.total_lessons,
  priority: t.priority,
  aiRecommended: t.ai_recommended,
  backendStatus: t.status,
  mentorFeedback: t.mentor_feedback,
  submissionNotes: t.submission_notes,
});

const StudentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Interactive Task Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [assignmentFile, setAssignmentFile] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState("");
  const [assignmentError, setAssignmentError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const loadTasks = () => {
    if (!user) {
      setError("You must be logged in to view tasks.");
      setLoading(false);
      return;
    }

    api
      .get(`tasks/?user_id=${user.user_id}`)
      .then((res) => {
        setTasks(res.data.map(mapTaskFromApi));
      })
      .catch((err) => {
        console.error("Failed to load tasks:", err);
        setError("Failed to load your tasks. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const tasksWithProgress = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      progress: getProgress(task),
      status: getStatus(task),
    }));
  }, [tasks]);

  const filteredTasks = tasksWithProgress.filter((task) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Mentor Assigned") return task.type === "Mentor Assignment";
    if (activeFilter === "Pending") {
      return task.status === "Not Started" || task.status === "In Progress";
    }
    return task.status === activeFilter;
  });

  const totalTasks = tasksWithProgress.length;
  const completedTasks = tasksWithProgress.filter(
    (task) => task.status === "Completed" || task.status === "Submitted"
  ).length;
  const inProgressTasks = tasksWithProgress.filter((task) => task.status === "In Progress").length;
  const pendingTasks = tasksWithProgress.filter((task) => task.status === "Not Started").length;

  const continueCourse = (task) => {
    setSelectedTask(task);
    setAssignmentNotes(task.submissionNotes || "");
    setAssignmentFile("");
    setAssignmentSuccess("");
    setAssignmentError("");
  };

  const handleAdvanceLesson = async () => {
    if (!selectedTask || !user) return;
    try {
      const res = await api.post(`tasks/${selectedTask.id}/progress/`, {
        user_id: user.user_id,
        increment: 1,
      });
      const updated = mapTaskFromApi(res.data);
      setSelectedTask({
        ...updated,
        progress: getProgress(updated),
        status: getStatus(updated),
      });
      loadTasks();
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedTask || !user) return;

    if (!assignmentNotes.trim() && !assignmentFile.trim()) {
      setAssignmentError("Add a project link or a few notes so your mentor has something to review.");
      return;
    }

    setSubmittingAssignment(true);
    setAssignmentSuccess("");
    setAssignmentError("");

    try {
      const res = await api.post(`tasks/${selectedTask.id}/submit-assignment/`, {
        user_id: user.user_id,
        submission_notes: assignmentNotes,
        submission_file: assignmentFile,
      });
      const updated = mapTaskFromApi(res.data);
      setSelectedTask({
        ...updated,
        progress: getProgress(updated),
        status: getStatus(updated),
      });
      setAssignmentSuccess(
        res.data.mentors_notified > 0
          ? "Submitted! Your mentor has been notified and will review it soon."
          : "Saved. You are not connected with a mentor yet. Your mentor will see this once they accept your guidance request.",
      );
      loadTasks();
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      setAssignmentError(err.response?.data?.detail || "Could not submit assignment. Please try again.");
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const recommendedTask = tasksWithProgress.find((task) => task.aiRecommended && task.status !== "Completed");

  return (
    <StudentLayout pageTitle="Tasks">
      <div className="student-tasks-page">
        {/* =================================================
            HEADER
        ================================================= */}
        <section className="tasks-introduction">
          <div>
            <span className="student-section-label">LEARNING PATH</span>
            <h1>Learning Tasks & Courses</h1>
            <p>
              Complete structured course lessons, submit assignments for mentor feedback,
              and build practical expertise toward your career roadmap.
            </p>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}
        <section className="student-stats-grid">
          <div className="student-stat-card">
            <div className="student-stat-icon blue">
              <i className="bi bi-collection"></i>
            </div>
            <div>
              <span>Total Courses</span>
              <h2>{totalTasks}</h2>
              <small>Assigned to your roadmap</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon orange">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div>
              <span>In Progress</span>
              <h2>{inProgressTasks}</h2>
              <small>Currently active</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon green">
              <i className="bi bi-check2-circle"></i>
            </div>
            <div>
              <span>Completed</span>
              <h2>{completedTasks}</h2>
              <small>Courses & assignments</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon purple">
              <i className="bi bi-circle"></i>
            </div>
            <div>
              <span>Not Started</span>
              <h2>{pendingTasks}</h2>
              <small>Ready to begin</small>
            </div>
          </div>
        </section>

        {/* =================================================
            AI RECOMMENDATION
        ================================================= */}
        <section className="ai-task-card">
          <div className="ai-task-icon">
            <i className="bi bi-stars"></i>
          </div>

          <div className="ai-task-content">
            <span className="ai-label">PERSONALIZED RECOMMENDATION</span>
            <h2>{recommendedTask ? `Focus on: ${recommendedTask.courseName}` : aiRecommendation.title}</h2>
            <p>{recommendedTask ? recommendedTask.description : aiRecommendation.description}</p>

            <div className="ai-task-reason">
              <i className="bi bi-lightbulb"></i>
              <span>{aiRecommendation.reason}</span>
            </div>
          </div>

          {recommendedTask && (
            <button
              className="ai-task-action"
              onClick={() => continueCourse(recommendedTask)}
            >
              Continue Learning
              <i className="bi bi-arrow-right"></i>
            </button>
          )}
        </section>

        {/* =================================================
            TASK SECTION
        ================================================= */}
        <section className="tasks-section">
          <div className="tasks-section-header">
            <div>
              <span className="student-section-label">YOUR LEARNING</span>
              <h2>Learning Courses</h2>
              <p>Your task progress is automatically calculated from your course completion.</p>
            </div>
          </div>

          {/* FILTERS */}
          <div className="task-filters">
            {["All", "Pending", "In Progress", "Completed", "Mentor Assigned"].map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* TASK LIST */}
          <div className="tasks-list">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <article className="task-card" key={task.id}>
                  {/* TYPE ICON */}
                  <div className={`task-type-icon ${task.skill.toLowerCase().replaceAll(" ", "-")}`}>
                    <i className="bi bi-book"></i>
                  </div>

                  {/* MAIN CONTENT */}
                  <div className="task-card-main">
                    <div className="task-card-title-row">
                      <div>
                        <div className="task-title-line">
                          <h3>{task.title}</h3>
                          {task.aiRecommended && (
                            <span className="ai-task-badge">
                              <i className="bi bi-stars"></i>
                              AI Recommended
                            </span>
                          )}
                        </div>
                        <span className="task-type">{task.type}</span>
                      </div>

                      <span className={`task-priority ${task.priority.toLowerCase()}`}>
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className="task-description">{task.description}</p>

                    {/* MENTOR FEEDBACK CALLOUT */}
                    {task.mentorFeedback && (
                      <div
                        style={{
                          margin: "0.5rem 0",
                          padding: "0.6rem 0.85rem",
                          borderRadius: "8px",
                          background: "rgba(16, 185, 129, 0.1)",
                          borderLeft: "3px solid #10b981",
                        }}
                      >
                        <strong style={{ fontSize: "0.85rem", color: "#065f46", display: "block" }}>
                          <i className="bi bi-chat-square-quote" style={{ marginRight: "0.3rem" }}></i>
                          Mentor Feedback
                        </strong>
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "#047857" }}>
                          {task.mentorFeedback}
                        </p>
                      </div>
                    )}

                    {/* COURSE */}
                    <div className="task-course">
                      <i className="bi bi-book-half"></i>
                      <div>
                        <span>Linked Course</span>
                        <strong>{task.courseName}</strong>
                      </div>
                    </div>

                    {/* META */}
                    <div className="task-meta">
                      <span>
                        <i className="bi bi-lightning-charge"></i>
                        {task.skill}
                      </span>
                      <span>
                        <i className="bi bi-calendar3"></i>
                        Due {task.deadline}
                      </span>
                      <span>
                        <i className="bi bi-play-circle"></i>
                        {task.completedLessons} / {task.totalLessons} lessons
                      </span>
                    </div>

                    {/* PROGRESS */}
                    <div className="task-progress-section">
                      <div className="task-progress-label">
                        <span>Course Progress</span>
                        <strong>{task.progress}%</strong>
                      </div>
                      <div className="task-progress-track">
                        <div style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="task-card-action">
                    {task.status === "Completed" ? (
                      <span className="task-completed">
                        <i className="bi bi-check-circle-fill"></i>
                        Completed
                      </span>
                    ) : task.status === "Submitted" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "20px",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#d97706",
                          }}
                        >
                          <i className="bi bi-clock-history"></i>
                          Submitted
                        </span>
                        <button
                          className="task-action-button"
                          onClick={() => continueCourse(task)}
                          style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                        >
                          View Work
                        </button>
                      </div>
                    ) : (
                      <button
                        className="task-action-button"
                        onClick={() => continueCourse(task)}
                      >
                        {task.status === "Not Started" ? "Start Learning" : "Continue Learning"}
                        <i className="bi bi-arrow-right"></i>
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="tasks-empty">
                <div className="tasks-empty-icon">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <h3>No courses found</h3>
                <p>There are no courses matching your selected filter.</p>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            INTERACTIVE COURSE / ASSIGNMENT MODAL
        ================================================= */}
        {selectedTask && (
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
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                padding: "2rem",
                position: "relative",
              }}
            >
              <button
                onClick={() => setSelectedTask(null)}
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

              <span className="student-section-label">{selectedTask.skill}</span>
              <h2 style={{ margin: "0.3rem 0 0.5rem", fontSize: "1.4rem" }}>
                {selectedTask.courseName}
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                {selectedTask.description}
              </p>

              {/* Progress Bar */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Progress</span>
                  <strong style={{ fontSize: "0.85rem", color: "#6366f1" }}>
                    {selectedTask.completedLessons} / {selectedTask.totalLessons} lessons ({selectedTask.progress}%)
                  </strong>
                </div>
                <div className="task-progress-track">
                  <div style={{ width: `${selectedTask.progress}%` }}></div>
                </div>
              </div>

              {/* Advance Lesson Button */}
              {selectedTask.completedLessons < selectedTask.totalLessons && (
                <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ fontSize: "0.9rem", display: "block" }}>
                        Lesson {selectedTask.completedLessons + 1}
                      </strong>
                      <small style={{ color: "#64748b" }}>Mark this lesson complete as you study</small>
                    </div>
                    <button
                      className="student-primary-btn"
                      onClick={handleAdvanceLesson}
                      style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
                    >
                      <i className="bi bi-check2"></i>
                      Complete Lesson
                    </button>
                  </div>
                </div>
              )}

              {/* Mentor Feedback if present */}
              {selectedTask.mentorFeedback && (
                <div
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid #10b981",
                  }}
                >
                  <strong style={{ color: "#065f46", display: "block", marginBottom: "0.25rem" }}>
                    <i className="bi bi-chat-quote" style={{ marginRight: "0.3rem" }}></i>
                    Mentor Feedback Received
                  </strong>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#047857" }}>
                    {selectedTask.mentorFeedback}
                  </p>
                </div>
              )}

              {/* Submit Assignment Form */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.25rem" }}>
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>
                  Submit Assignment / Project Work
                </h4>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  Share your project repository, notes, or deliverable for this course to receive mentor evaluation.
                </p>

                {assignmentError && (
                  <div style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", background: "#fef2f2", color: "#b91c1c", marginBottom: "1rem", fontSize: "0.85rem" }}>
                    <i className="bi bi-exclamation-circle-fill" style={{ marginRight: "0.4rem" }}></i>
                    {assignmentError}
                  </div>
                )}

                {assignmentSuccess && (
                  <div style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", background: "#ecfdf5", color: "#047857", marginBottom: "1rem", fontSize: "0.85rem" }}>
                    <i className="bi bi-check-circle-fill" style={{ marginRight: "0.4rem" }}></i>
                    {assignmentSuccess}
                  </div>
                )}

                <form onSubmit={handleSubmitAssignment}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
                      Project / Repository URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://github.com/my-project or file link"
                      value={assignmentFile}
                      onChange={(e) => setAssignmentFile(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
                      Submission Notes & Learnings
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Describe what you built or learned in this task..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedTask(null)}
                      className="quiz-secondary-button"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAssignment}
                      className="student-primary-btn"
                      style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}
                    >
                      <i className="bi bi-send"></i>
                      {submittingAssignment ? "Submitting..." : "Submit to Mentor"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentTasks;