import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [roadmap, setRoadmap] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [topCareer, setTopCareer] = useState(null);
  const [progressSummary, setProgressSummary] = useState({
    skill_progress_percent: 0,
    quiz_progress_percent: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setError("You must be logged in to view your dashboard.");
      setLoading(false);
      return;
    }

    Promise.all([
      api.get(`roadmaps/?user_id=${user.user_id}`),
      api.get(`tasks/?user_id=${user.user_id}`),
      api.get(`careers/?user_id=${user.user_id}`),
      api.get(`progress/?user_id=${user.user_id}`),
    ])
      .then(([roadmapRes, tasksRes, careersRes, progressRes]) => {
        setRoadmap(roadmapRes.data);
        setTasks(tasksRes.data);
        setTopCareer(careersRes.data[0] || null);
        setProgressSummary(progressRes.data);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <StudentLayout pageTitle="Dashboard">
        <p>Loading...</p>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout pageTitle="Dashboard">
        <p>{error}</p>
      </StudentLayout>
    );
  }

  const tasksWithStatus = tasks.map((t) => {
    const total = t.total_lessons || 1;
    const completed = t.completed_lessons || 0;
    const progress = Math.round((completed / total) * 100);
    const status =
      progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started";
    return { ...t, progress, status };
  });

  const completedTaskCount = tasksWithStatus.filter((t) => t.status === "Completed").length;
  const tasksCompletedPercent =
    tasks.length > 0 ? Math.round((completedTaskCount / tasks.length) * 100) : 0;

  const completedRoadmapCount = roadmap.filter((r) => r.status === "completed").length;
  const roadmapPercent =
    roadmap.length > 0 ? Math.round((completedRoadmapCount / roadmap.length) * 100) : 0;

  const skillPercent = progressSummary.skill_progress_percent;
  const quizPercent = progressSummary.quiz_progress_percent;

  const careerMatchPercent = topCareer ? topCareer.match_percent : 0;
  const careerReadinessPercent = Math.round(
    (skillPercent + tasksCompletedPercent + quizPercent + roadmapPercent) / 4
  );

  return (
    <StudentLayout pageTitle="Dashboard">
      <section className="student-welcome">
        <div>
          <span className="student-welcome-label">STUDENT DASHBOARD</span>
          <h1>Good morning, {user.first_name} 👋</h1>
          <p>Continue building your career journey.</p>
        </div>

        <a href="/student/assessment" className="student-primary-btn">
          <i className="bi bi-clipboard-check"></i>
          Take Assessment
        </a>
      </section>

      <section className="student-stats-grid">
        <div className="student-stat-card">
          <div className="student-stat-icon purple">
            <i className="bi bi-stars"></i>
          </div>
          <div>
            <span>Career Match</span>
            <h2>{careerMatchPercent}%</h2>
            <small>{topCareer ? topCareer.career_name : "No recommendation yet"}</small>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon blue">
            <i className="bi bi-bar-chart-line"></i>
          </div>
          <div>
            <span>Skill Progress</span>
            <h2>{skillPercent}%</h2>
            <small>Updated regularly</small>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon green">
            <i className="bi bi-check2-circle"></i>
          </div>
          <div>
            <span>Tasks Completed</span>
            <h2>{tasksCompletedPercent}%</h2>
            <small>{completedTaskCount} of {tasks.length} tasks</small>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon orange">
            <i className="bi bi-trophy"></i>
          </div>
          <div>
            <span>Career Readiness</span>
            <h2>{careerReadinessPercent}%</h2>
            <small>Keep improving</small>
          </div>
        </div>
      </section>

      <section className="student-dashboard-grid">
        <div className="student-card">
          <div className="student-card-header">
            <div>
              <span className="student-section-label">TOP CAREER MATCH</span>
              <h3>{topCareer ? topCareer.career_name : "No match yet"}</h3>
            </div>
            <div className="career-match-circle">{careerMatchPercent}%</div>
          </div>

          <p>
            {topCareer
              ? topCareer.description
              : "Take the career assessment to get your personalized recommendation."}
          </p>

          <div className="career-progress">
            <div style={{ width: `${careerMatchPercent}%` }}></div>
          </div>

          <div className="skill-tags">
            {topCareer?.matched_skills.map((skill) => (
              <span key={skill}>
                <i className="bi bi-check-circle-fill"></i>
                {skill}
              </span>
            ))}
            {topCareer?.missing_skills.map((skill) => (
              <span className="missing" key={skill}>
                <i className="bi bi-arrow-up-circle"></i>
                {skill}
              </span>
            ))}
          </div>

          <a href="/student/recommendations" className="student-primary-btn">
            Explore Career
            <i className="bi bi-arrow-right"></i>
          </a>
        </div>

        <div className="student-card">
          <div className="student-card-header">
            <div>
              <span className="student-section-label">DEVELOPMENT</span>
              <h3>Your Progress</h3>
            </div>
            <i className="bi bi-graph-up card-icon"></i>
          </div>

          <div className="dashboard-progress">
            <div><span>Skills</span><strong>{skillPercent}%</strong></div>
            <div className="progress-track"><div style={{ width: `${skillPercent}%` }}></div></div>
          </div>

          <div className="dashboard-progress">
            <div><span>Tasks</span><strong>{tasksCompletedPercent}%</strong></div>
            <div className="progress-track"><div style={{ width: `${tasksCompletedPercent}%` }}></div></div>
          </div>

          <div className="dashboard-progress">
            <div><span>Quizzes</span><strong>{quizPercent}%</strong></div>
            <div className="progress-track"><div style={{ width: `${quizPercent}%` }}></div></div>
          </div>

          <div className="dashboard-progress">
            <div><span>Roadmap</span><strong>{roadmapPercent}%</strong></div>
            <div className="progress-track"><div style={{ width: `${roadmapPercent}%` }}></div></div>
          </div>
        </div>
      </section>

      <section className="student-dashboard-grid">
        <div className="student-card">
          <div className="student-card-header">
            <div>
              <span className="student-section-label">YOUR ROADMAP</span>
              <h3>{topCareer ? topCareer.career_name : "Roadmap"}</h3>
            </div>
            <a href="/student/roadmap">View All</a>
          </div>

          <div className="roadmap-list">
            {roadmap.map((item, index) => (
              <div className={`roadmap-item ${item.status}`} key={item.id}>
                <div className="roadmap-circle">
                  {item.status === "completed" ? (
                    <i className="bi bi-check-lg"></i>
                  ) : item.status === "current" ? (
                    <i className="bi bi-arrow-right"></i>
                  ) : (
                    index + 1
                  )}
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.status === "completed"
                      ? "Completed"
                      : item.status === "current"
                      ? "Currently learning"
                      : "Upcoming"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="student-card">
          <div className="student-card-header">
            <div>
              <span className="student-section-label">LEARNING</span>
              <h3>Recent Tasks</h3>
            </div>
            <a href="/student/tasks">View All</a>
          </div>

          {tasksWithStatus.slice(0, 3).map((task) => (
            <div className="student-task" key={task.id}>
              <div className="task-icon">
                <i className="bi bi-clipboard-check"></i>
              </div>
              <div>
                <strong>{task.title}</strong>
                <small>Due: {task.deadline}</small>
              </div>
              <span className={`task-status ${task.status.toLowerCase().replaceAll(" ", "-")}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </StudentLayout>
  );
};

export default StudentDashboard;