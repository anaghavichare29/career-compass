import React, { useEffect, useMemo, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentTasks.css";


// =====================================================
// AI RECOMMENDATION
// =====================================================
// NOTE: This block is still a placeholder — it will be
// replaced once real AI integration is connected (see
// the "Coming with AI" section further down this page).
// =====================================================

const aiRecommendation = {
  title: "Continue SQL for Data Analysis",
  description:
    "Based on your current roadmap progress, SQL is the most important skill to strengthen before moving to the next stage.",
  reason:
    "Your SQL course is currently 67% complete and SQL is an important requirement for your recommended Data Analyst career.",
};


// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getProgress = (task) => {
  if (!task.totalLessons) {
    return 0;
  }

  return Math.round(
    (task.completedLessons / task.totalLessons) * 100
  );
};


const getStatus = (task) => {
  const progress = getProgress(task);

  if (progress >= 100) {
    return "Completed";
  }

  if (progress > 0) {
    return "In Progress";
  }

  return "Not Started";
};


// =====================================================
// MAP API RESPONSE -> SHAPE THIS COMPONENT EXPECTS
// =====================================================
// Your Django TaskSerializer returns snake_case fields
// (course_name, completed_lessons, total_lessons,
// ai_recommended). This converts them to the camelCase
// shape the rest of this component was already built for,
// so nothing below has to change.
// =====================================================

const mapTaskFromApi = (t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  type: "Course",
  skill: t.skill,
  courseName: t.course_name,
  courseId: t.course_name
    ? t.course_name.toLowerCase().replaceAll(" ", "-")
    : `task-${t.id}`,
  deadline: t.deadline,
  completedLessons: t.completed_lessons,
  totalLessons: t.total_lessons,
  priority: t.priority,
  aiRecommended: t.ai_recommended,
});


// =====================================================
// COMPONENT
// =====================================================

const StudentTasks = () => {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] =
    useState("All");


  // ===================================================
  // FETCH TASKS FROM API
  // ===================================================

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

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
  }, []);


  // ===================================================
  // ADD CALCULATED STATUS + PROGRESS
  // ===================================================

  const tasksWithProgress = useMemo(() => {

    return tasks.map((task) => ({
      ...task,
      progress: getProgress(task),
      status: getStatus(task),
    }));

  }, [tasks]);


  // ===================================================
  // FILTER TASKS
  // ===================================================

  const filteredTasks = tasksWithProgress.filter(
    (task) => {

      if (activeFilter === "All") {
        return true;
      }

      if (activeFilter === "Pending") {
        return (
          task.status === "Not Started" ||
          task.status === "In Progress"
        );
      }

      return task.status === activeFilter;

    }
  );


  // ===================================================
  // STATISTICS
  // ===================================================

  const totalTasks = tasksWithProgress.length;

  const completedTasks =
    tasksWithProgress.filter(
      (task) => task.status === "Completed"
    ).length;

  const inProgressTasks =
    tasksWithProgress.filter(
      (task) => task.status === "In Progress"
    ).length;

  const pendingTasks =
    tasksWithProgress.filter(
      (task) => task.status === "Not Started"
    ).length;


  // ===================================================
  // CONTINUE COURSE
  // ===================================================
  // For now this is a frontend placeholder.
  //
  // Later:
  // navigate to the actual course page.
  //
  // Example future route:
  // /student/courses/:courseId
  // ===================================================

  const continueCourse = (task) => {

    console.log(
      `Opening course: ${task.courseName}`
    );

    alert(
      `${task.courseName}\n\nCourse learning page will be connected here.`
    );

  };


  // ===================================================
  // AI RECOMMENDED COURSE
  // ===================================================
  // Matches on the ai_recommended flag from the API
  // instead of a hardcoded courseId.
  // ===================================================

  const recommendedTask =
    tasksWithProgress.find(
      (task) => task.aiRecommended
    );


  // ===================================================
  // LOADING / ERROR STATES
  // ===================================================

  if (loading) {
    return (
      <StudentLayout pageTitle="Tasks">
        <div className="tasks-page">
          <p>Loading your tasks...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout pageTitle="Tasks">
        <div className="tasks-page">
          <p>{error}</p>
        </div>
      </StudentLayout>
    );
  }


  return (
    <StudentLayout pageTitle="Tasks">

      <div className="tasks-page">


        {/* =================================================
            INTRODUCTION
        ================================================= */}

        <section className="tasks-introduction">

          <div>

            <span className="student-section-label">
              LEARNING ACTIVITIES
            </span>

            <h1>
              My Tasks
            </h1>

            <p>
              Your learning activities are connected to
              your career roadmap. Course progress is
              automatically reflected here.
            </p>

          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="tasks-stats-grid">

          <div className="task-stat-card">

            <div className="task-stat-icon blue">
              <i className="bi bi-clipboard"></i>
            </div>

            <div>

              <span>
                Total Courses
              </span>

              <strong>
                {totalTasks}
              </strong>

              <small>
                In your learning path
              </small>

            </div>

          </div>


          <div className="task-stat-card">

            <div className="task-stat-icon orange">
              <i className="bi bi-hourglass-split"></i>
            </div>

            <div>

              <span>
                In Progress
              </span>

              <strong>
                {inProgressTasks}
              </strong>

              <small>
                Currently learning
              </small>

            </div>

          </div>


          <div className="task-stat-card">

            <div className="task-stat-icon green">
              <i className="bi bi-check-circle"></i>
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {completedTasks}
              </strong>

              <small>
                Courses completed
              </small>

            </div>

          </div>


          <div className="task-stat-card">

            <div className="task-stat-icon purple">
              <i className="bi bi-list-task"></i>
            </div>

            <div>

              <span>
                Not Started
              </span>

              <strong>
                {pendingTasks}
              </strong>

              <small>
                Upcoming learning
              </small>

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

            <span className="ai-label">
              PERSONALIZED RECOMMENDATION
            </span>

            <h2>
              {aiRecommendation.title}
            </h2>

            <p>
              {aiRecommendation.description}
            </p>

            <div className="ai-task-reason">

              <i className="bi bi-lightbulb"></i>

              <span>
                {aiRecommendation.reason}
              </span>

            </div>

          </div>


          {recommendedTask && (
            <button
              className="ai-task-action"
              onClick={() =>
                continueCourse(
                  recommendedTask
                )
              }
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

              <span className="student-section-label">
                YOUR LEARNING
              </span>

              <h2>
                Learning Courses
              </h2>

              <p>
                Your task progress is automatically
                calculated from your course completion.
              </p>

            </div>

          </div>


          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="task-filters">

            {[
              "All",
              "Pending",
              "In Progress",
              "Completed",
            ].map((filter) => (

              <button
                key={filter}
                className={
                  activeFilter === filter
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >

                {filter}

              </button>

            ))}

          </div>


          {/* =================================================
              TASK LIST
          ================================================= */}

          <div className="tasks-list">

            {filteredTasks.length > 0 ? (

              filteredTasks.map((task) => (

                <article
                  className="task-card"
                  key={task.id}
                >


                  {/* TYPE ICON */}

                  <div
                    className={`task-type-icon ${task.skill
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >

                    <i className="bi bi-book"></i>

                  </div>


                  {/* MAIN CONTENT */}

                  <div className="task-card-main">

                    <div className="task-card-title-row">

                      <div>

                        <div className="task-title-line">

                          <h3>
                            {task.title}
                          </h3>

                          {task.aiRecommended && (
                            <span className="ai-task-badge">

                              <i className="bi bi-stars"></i>

                              AI Recommended

                            </span>
                          )}

                        </div>

                        <span className="task-type">
                          {task.type}
                        </span>

                      </div>


                      <span
                        className={`task-priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority} Priority
                      </span>

                    </div>


                    <p className="task-description">
                      {task.description}
                    </p>


                    {/* COURSE */}

                    <div className="task-course">

                      <i className="bi bi-book-half"></i>

                      <div>

                        <span>
                          Linked Course
                        </span>

                        <strong>
                          {task.courseName}
                        </strong>

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

                        {task.completedLessons}
                        /
                        {task.totalLessons}
                        {" "}
                        lessons
                      </span>

                    </div>


                    {/* PROGRESS */}

                    <div className="task-progress-section">

                      <div className="task-progress-label">

                        <span>
                          Course Progress
                        </span>

                        <strong>
                          {task.progress}%
                        </strong>

                      </div>


                      <div className="task-progress-track">

                        <div
                          style={{
                            width:
                              `${task.progress}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                  </div>


                  {/* ACTION */}

                  <div className="task-card-action">


                    {task.status ===
                    "Completed" ? (

                      <span className="task-completed">

                        <i className="bi bi-check-circle-fill"></i>

                        Completed

                      </span>

                    ) : (

                      <button
                        className="task-action-button"
                        onClick={() =>
                          continueCourse(task)
                        }
                      >

                        {task.status ===
                        "Not Started"
                          ? "Start Learning"
                          : "Continue Learning"}

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

                <h3>
                  No courses found
                </h3>

                <p>
                  There are no courses matching
                  the selected filter.
                </p>

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            AI FEEDBACK
        ================================================= */}

        <section className="ai-feedback-card">

          <div className="ai-feedback-icon">

            <i className="bi bi-stars"></i>

          </div>


          <div>

            <span className="student-section-label">
              AI LEARNING FEEDBACK
            </span>

            <h2>
              Personalized learning insights
            </h2>

            <p>
              Once AI integration is connected, your
              course progress and quiz performance can
              be analyzed to identify weak areas,
              recommend learning resources and suggest
              your next best course.
            </p>

          </div>


          <span className="coming-soon-badge">
            Coming with AI
          </span>

        </section>


        {/* =================================================
            PROGRESS INFORMATION
        ================================================= */}

        <section className="tasks-bottom-cta">

          <div className="tasks-bottom-icon">

            <i className="bi bi-diagram-3"></i>

          </div>


          <div>

            <span className="student-section-label">
              CONNECTED LEARNING
            </span>

            <h2>
              Your course progress drives your roadmap
            </h2>

            <p>
              Completing lessons automatically updates
              your task progress. When a course reaches
              100%, the corresponding task is marked
              completed and your overall career progress
              can be updated.
            </p>

          </div>

        </section>


      </div>

    </StudentLayout>
  );
};


export default StudentTasks;