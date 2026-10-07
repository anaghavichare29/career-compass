import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./MentorDashboard.css";

const MentorDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Industry Mentor";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "M";

  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [selectedStudentProgress, setSelectedStudentProgress] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Reply / Action Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [actionNote, setActionNote] = useState("");

  // Assign Task Form
  const [taskStudentId, setTaskStudentId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskSkill, setTaskSkill] = useState("");
  const [taskCourse, setTaskCourse] = useState("");
  const [taskPriority, setTaskPriority] = useState("High");
  const [taskLessons, setTaskLessons] = useState(5);
  const [taskSuccess, setTaskSuccess] = useState("");

  // Assign Roadmap Form
  const [roadmapStudentId, setRoadmapStudentId] = useState("");
  const [roadmapStageName, setRoadmapStageName] = useState("");
  const [roadmapDesc, setRoadmapDesc] = useState("");
  const [roadmapDuration, setRoadmapDuration] = useState("4 Weeks");
  const [roadmapSkillsStr, setRoadmapSkillsStr] = useState("");
  const [roadmapSuccess, setRoadmapSuccess] = useState("");

  // Task Feedback Modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionFeedback, setSubmissionFeedback] = useState("");
  const [submissionDecision, setSubmissionDecision] = useState("Completed");

  // Quiz Review Modal
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizReviewNotes, setQuizReviewNotes] = useState("");

  // Profile Edit Form State
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editExp, setEditExp] = useState(5);
  const [editIndustry, setEditIndustry] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editGuidance, setEditGuidance] = useState("");
  const [editExpectations, setEditExpectations] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Resource Form State
  const [newResTitle, setNewResTitle] = useState("");
  const [newResSkill, setNewResSkill] = useState("");
  const [newResType, setNewResType] = useState("Course");
  const [newResUrl, setNewResUrl] = useState("");
  const [newResProvider, setNewResProvider] = useState("Coursera");
  const [newResLevel, setNewResLevel] = useState("Beginner");
  const [newResDesc, setNewResDesc] = useState("");
  const [resSuccess, setResSuccess] = useState("");

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profRes, reqRes, stuRes, subRes, quizRes, resRes] = await Promise.all([
        api.get(`mentorship/profile/?user_id=${user.user_id}`).catch(() => ({ data: null })),
        api.get(`mentorship/requests/list/?user_id=${user.user_id}&role=mentor`).catch(() => ({ data: [] })),
        api.get(`mentorship/my-students/?mentor_user_id=${user.user_id}`).catch(() => ({ data: [] })),
        api.get(`tasks/submissions/?mentor_id=${user.user_id}`).catch(() => ({ data: [] })),
        api.get(`quizzes/pending-review/`).catch(() => ({ data: [] })),
        api.get(`mentorship/resources/`).catch(() => ({ data: [] })),
      ]);

      if (profRes.data) {
        setProfile(profRes.data);
        setEditCompany(profRes.data.company || "");
        setEditRole(profRes.data.designation || "");
        setEditExp(profRes.data.experienceYears || 5);
        setEditIndustry(profRes.data.industry || "");
        setEditBio(profRes.data.bio || "");
        setEditSkills(profRes.data.skills || "");
        setEditGuidance(profRes.data.guidanceTopics || "");
        setEditExpectations(profRes.data.workplaceExpectations || "");
      }
      setRequests(reqRes.data || []);
      setStudents(stuRes.data || []);
      setSubmissions(subRes.data || []);
      setPendingQuizzes(quizRes.data || []);
      setResources(resRes.data || []);
    } catch (err) {
      console.error("Error loading mentor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;
  const pendingQuizzesCount = pendingQuizzes.length;
  const pendingSubmissionsCount = submissions.filter((s) => s.status === "Submitted").length;

  // Actions
  const handleRequestAction = async (requestId, action) => {
    try {
      await api.post(`mentorship/requests/${requestId}/action/`, {
        action: action,
        note: actionNote,
      });
      alert(`Request has been ${action}!`);
      setActionNote("");
      setSelectedRequest(null);
      loadAllData();
    } catch (err) {
      console.error("Failed to update request:", err);
      alert("Failed to update request.");
    }
  };

  const handleRequestReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedRequest) return;
    try {
      await api.post(`mentorship/requests/${selectedRequest.id}/reply/`, {
        reply: replyText.trim(),
        status: "replied",
      });
      alert("Reply sent to student!");
      setReplyText("");
      setSelectedRequest(null);
      loadAllData();
    } catch (err) {
      console.error("Failed to reply:", err);
      alert("Failed to send reply.");
    }
  };

  const handleViewStudentProgress = async (studentId) => {
    try {
      const res = await api.get(`mentorship/student-progress/${studentId}/`);
      setSelectedStudentProgress(res.data);
      setShowProgressModal(true);
    } catch (err) {
      console.error("Failed to load student progress:", err);
      alert("Could not load student progress details.");
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskStudentId || !taskTitle.trim()) {
      alert("Please select a student and provide a task title.");
      return;
    }

    try {
      await api.post("mentorship/assign-task/", {
        student_id: Number(taskStudentId),
        mentor_user_id: user.user_id,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        skill: taskSkill.trim() || "General",
        course_name: taskCourse.trim() || "Mentor Masterclass",
        priority: taskPriority,
        total_lessons: Number(taskLessons) || 5,
      });
      setTaskSuccess("Task successfully assigned to student!");
      setTaskTitle("");
      setTaskDesc("");
      setTaskSkill("");
      setTaskCourse("");
      setTimeout(() => setTaskSuccess(""), 3000);
      loadAllData();
    } catch (err) {
      console.error("Failed to assign task:", err);
      alert("Failed to assign task.");
    }
  };

  const handleAssignRoadmap = async (e) => {
    e.preventDefault();
    if (!roadmapStudentId || !roadmapStageName.trim()) {
      alert("Please select a student and provide a milestone name.");
      return;
    }

    const skills = roadmapSkillsStr.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      await api.post("mentorship/assign-roadmap/", {
        student_id: Number(roadmapStudentId),
        mentor_user_id: user.user_id,
        stage_name: roadmapStageName.trim(),
        description: roadmapDesc.trim(),
        duration: roadmapDuration,
        skills: skills,
      });
      setRoadmapSuccess("Roadmap milestone successfully added to student's career path!");
      setRoadmapStageName("");
      setRoadmapDesc("");
      setRoadmapSkillsStr("");
      setTimeout(() => setRoadmapSuccess(""), 3000);
      loadAllData();
    } catch (err) {
      console.error("Failed to assign roadmap:", err);
      alert("Failed to assign roadmap milestone.");
    }
  };

  const handleSubmitTaskFeedback = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      await api.post(`tasks/${selectedSubmission.id}/feedback/`, {
        mentor_id: user.user_id,
        feedback: submissionFeedback.trim() || "Well done! Keep practicing.",
        status: submissionDecision,
      });
      alert(`Feedback submitted! Assignment marked as ${submissionDecision}.`);
      setSelectedSubmission(null);
      setSubmissionFeedback("");
      loadAllData();
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert("Failed to submit task feedback.");
    }
  };

  const handleReviewQuiz = async (decision) => {
    if (!selectedQuiz) return;
    try {
      await api.post(`quizzes/${selectedQuiz.id}/review/`, {
        reviewer_user_id: user.user_id,
        decision: decision,
        notes: quizReviewNotes.trim(),
      });
      alert(`Quiz has been ${decision}!`);
      setSelectedQuiz(null);
      setQuizReviewNotes("");
      loadAllData();
    } catch (err) {
      console.error("Failed to review quiz:", err);
      alert("Failed to review quiz.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("mentorship/profile/", {
        user_id: user.user_id,
        company: editCompany.trim(),
        designation: editRole.trim(),
        experienceYears: Number(editExp),
        industry: editIndustry.trim(),
        bio: editBio.trim(),
        skills: editSkills.trim(),
        guidanceTopics: editGuidance.trim(),
        workplaceExpectations: editExpectations.trim(),
      });
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
      loadAllData();
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile.");
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResSkill.trim()) {
      alert("Please provide title and skill.");
      return;
    }

    try {
      await api.post("mentorship/resources/", {
        title: newResTitle.trim(),
        skill: newResSkill.trim(),
        type: newResType,
        url: newResUrl.trim() || "#",
        provider: newResProvider.trim(),
        level: newResLevel,
        description: newResDesc.trim(),
      });
      setResSuccess("Resource recommended and added for students!");
      setNewResTitle("");
      setNewResSkill("");
      setNewResUrl("");
      setNewResDesc("");
      setTimeout(() => setResSuccess(""), 3000);
      loadAllData();
    } catch (err) {
      console.error("Failed to add resource:", err);
      alert("Failed to add resource.");
    }
  };

  return (
    <div className="mentor-page">
      {/* Header */}
      <header className="mentor-header">
        <div className="mentor-brand" onClick={() => setActiveTab("overview")}>
          <h1>Career<span>Compass</span> <span style={{ fontSize: "14px", fontWeight: "600", color: "#6366f1", background: "#eef2ff", padding: "3px 8px", borderRadius: "6px", marginLeft: "8px" }}>MENTOR WORKSPACE</span></h1>
        </div>

        <div className="mentor-header-right">
          <div className="mentor-profile-badge">
            <div className="mentor-avatar">{initial}</div>
            <div>
              <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>{fullName}</strong>
              <small style={{ color: "#64748b" }}>{profile?.designation || "Industry Expert"} • {profile?.company || "Verified"}</small>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="mentor-action-btn outline"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mentor-content">
        {/* Navigation Tabs */}
        <div className="mentor-nav-tabs">
          <button
            className={`mentor-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="bi bi-grid-1x2"></i> Overview
          </button>

          <button
            className={`mentor-tab-btn ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <i className="bi bi-inbox"></i> Mentorship Requests
            {pendingRequestsCount > 0 && <span className="mentor-badge">{pendingRequestsCount}</span>}
          </button>

          <button
            className={`mentor-tab-btn ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <i className="bi bi-people"></i> My Students ({students.length})
          </button>

          <button
            className={`mentor-tab-btn ${activeTab === "assign" ? "active" : ""}`}
            onClick={() => setActiveTab("assign")}
          >
            <i className="bi bi-plus-circle"></i> Assign Tasks & Roadmaps
          </button>

          <button
            className={`mentor-tab-btn ${activeTab === "submissions" ? "active" : ""}`}
            onClick={() => setActiveTab("submissions")}
          >
            <i className="bi bi-check2-all"></i> Review Submissions
            {pendingSubmissionsCount > 0 && <span className="mentor-badge">{pendingSubmissionsCount}</span>}
          </button>

          <button
            className={`mentor-tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveTab("quizzes")}
          >
            <i className="bi bi-question-diamond"></i> Review Student Quizzes
            {pendingQuizzesCount > 0 && <span className="mentor-badge">{pendingQuizzesCount}</span>}
          </button>

          <button
            className={`mentor-tab-btn ${activeTab === "experience" ? "active" : ""}`}
            onClick={() => setActiveTab("experience")}
          >
            <i className="bi bi-person-lines-fill"></i> Share Experience & Profile
          </button>

          <button
            className={`mentor-tab-btn ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            <i className="bi bi-bookmark-star"></i> Recommend Resources
          </button>
        </div>

        {/* =========================================================
            TAB 1: OVERVIEW
        ========================================================= */}
        {activeTab === "overview" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", margin: "0 0 6px 0", color: "#0f172a" }}>Welcome back, {fullName}! 👋</h2>
              <p style={{ margin: 0, color: "#64748b" }}>
                Guide ambitious students, review submissions, assign tailored tasks and share your industry journey.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="mentor-stats-grid">
              <div className="mentor-stat-card">
                <div className="mentor-stat-icon blue"><i className="bi bi-inbox"></i></div>
                <div>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Pending Requests</span>
                  <h3 style={{ margin: "4px 0", fontSize: "24px" }}>{pendingRequestsCount}</h3>
                  <small style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }} onClick={() => setActiveTab("requests")}>
                    View Requests →
                  </small>
                </div>
              </div>

              <div className="mentor-stat-card">
                <div className="mentor-stat-icon purple"><i className="bi bi-people"></i></div>
                <div>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Assigned Students</span>
                  <h3 style={{ margin: "4px 0", fontSize: "24px" }}>{students.length}</h3>
                  <small style={{ color: "#7c3aed", cursor: "pointer", fontWeight: "600" }} onClick={() => setActiveTab("students")}>
                    Analyze Progress →
                  </small>
                </div>
              </div>

              <div className="mentor-stat-card">
                <div className="mentor-stat-icon green"><i className="bi bi-check2-square"></i></div>
                <div>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Task Submissions</span>
                  <h3 style={{ margin: "4px 0", fontSize: "24px" }}>{submissions.length}</h3>
                  <small style={{ color: "#059669", cursor: "pointer", fontWeight: "600" }} onClick={() => setActiveTab("submissions")}>
                    Provide Feedback →
                  </small>
                </div>
              </div>

              <div className="mentor-stat-card">
                <div className="mentor-stat-icon orange"><i className="bi bi-patch-question"></i></div>
                <div>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Quizzes to Review</span>
                  <h3 style={{ margin: "4px 0", fontSize: "24px" }}>{pendingQuizzesCount}</h3>
                  <small style={{ color: "#ea580c", cursor: "pointer", fontWeight: "600" }} onClick={() => setActiveTab("quizzes")}>
                    Review & Post →
                  </small>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Requests Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
              <div className="mentor-card">
                <div className="mentor-card-header">
                  <h3>Recent Student Requests</h3>
                  <button className="mentor-action-btn outline" onClick={() => setActiveTab("requests")}>View All</button>
                </div>
                {requests.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>No mentorship requests yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {requests.slice(0, 4).map((r) => (
                      <div key={r.id} style={{ padding: "12px 16px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{r.otherName}</strong>
                          <span style={{ display: "block", fontSize: "13px", color: "#64748b" }}>{r.topic}</span>
                          <small style={{ color: "#94a3b8", fontSize: "11px" }}>{r.createdAt}</small>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {r.status === "pending" ? (
                            <>
                              <button className="mentor-action-btn success" onClick={() => handleRequestAction(r.id, "approved")}>Approve</button>
                              <button className="mentor-action-btn danger" onClick={() => handleRequestAction(r.id, "rejected")}>Reject</button>
                            </>
                          ) : (
                            <span style={{ fontSize: "12px", fontWeight: "600", color: r.status === "approved" ? "#10b981" : "#ef4444" }}>
                              {r.status?.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mentor-card">
                <div className="mentor-card-header">
                  <h3>Quick Actions</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={() => setActiveTab("assign")}
                    className="mentor-action-btn outline"
                    style={{ padding: "14px", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}
                  >
                    <i className="bi bi-pencil-square" style={{ fontSize: "20px", color: "#2f5bea" }}></i>
                    <div>
                      <strong>Assign Tasks & Roadmaps to Students</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Create assignments or roadmap stages for active students</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("submissions")}
                    className="mentor-action-btn outline"
                    style={{ padding: "14px", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}
                  >
                    <i className="bi bi-chat-left-dots" style={{ fontSize: "20px", color: "#10b981" }}></i>
                    <div>
                      <strong>Review Student Submissions ({submissions.length})</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Provide constructive feedback on assignments</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className="mentor-action-btn outline"
                    style={{ padding: "14px", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}
                  >
                    <i className="bi bi-award" style={{ fontSize: "20px", color: "#f59e0b" }}></i>
                    <div>
                      <strong>Review Student Created Quizzes ({pendingQuizzes.length})</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Approve community quizzes to be posted</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: MENTORSHIP REQUESTS
        ========================================================= */}
        {activeTab === "requests" && (
          <div className="mentor-card">
            <div className="mentor-card-header">
              <div>
                <h3>Student Mentorship Requests</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Students select you as their mentor. You can review their topic, goals, and approve or reject the request.
                </p>
              </div>
              <span className="mentor-badge" style={{ background: "#2f5bea" }}>{requests.length} Total</span>
            </div>

            {requests.length === 0 ? (
              <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No requests received yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="mentor-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Topic</th>
                      <th>Message & Goals</th>
                      <th>Status</th>
                      <th>Received</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.otherName}</strong>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>ID #{r.otherId}</div>
                        </td>
                        <td><strong style={{ color: "#2f5bea" }}>{r.topic}</strong></td>
                        <td style={{ maxWidth: "280px" }}>
                          <p style={{ margin: "0 0 4px 0", fontSize: "13px" }}>{r.message}</p>
                          {r.goals && <small style={{ color: "#64748b" }}><strong>Goals:</strong> {r.goals}</small>}
                          {r.reply && (
                            <div style={{ marginTop: "6px", padding: "6px 8px", background: "#f0fdf4", borderRadius: "6px", fontSize: "12px", color: "#166534" }}>
                              <strong>Your Reply:</strong> {r.reply}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: r.status === "approved" ? "#dcfce7" : r.status === "rejected" ? "#fee2e2" : "#fef3c7",
                              color: r.status === "approved" ? "#15803d" : r.status === "rejected" ? "#b91c1c" : "#b45309",
                            }}
                          >
                            {r.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "#64748b" }}>{r.createdAt}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {r.status === "pending" && (
                              <>
                                <button className="mentor-action-btn success" onClick={() => handleRequestAction(r.id, "approved")}>Approve</button>
                                <button className="mentor-action-btn danger" onClick={() => handleRequestAction(r.id, "rejected")}>Reject</button>
                              </>
                            )}
                            <button
                              className="mentor-action-btn primary"
                              onClick={() => {
                                setSelectedRequest(r);
                                setReplyText(r.reply || "");
                              }}
                            >
                              {r.reply ? "Update Reply" : "Reply"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 3: MY STUDENTS & PROGRESS ANALYSIS
        ========================================================= */}
        {activeTab === "students" && (
          <div className="mentor-card">
            <div className="mentor-card-header">
              <div>
                <h3>Assigned Students & Progress Monitoring</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Analyze student learning curves, test performances, and career-readiness levels.
                </p>
              </div>
              <span className="mentor-badge" style={{ background: "#2f5bea" }}>{students.length} Students</span>
            </div>

            {students.length === 0 ? (
              <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                No active students yet. Once you approve student mentorship requests, they will appear here.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="mentor-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>College & Course</th>
                      <th>Career Goal</th>
                      <th>Tasks Done</th>
                      <th>Quiz Avg</th>
                      <th>Career Readiness</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st) => (
                      <tr key={st.studentId}>
                        <td>
                          <strong>{st.name}</strong>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{st.email}</div>
                        </td>
                        <td>
                          <div>{st.college}</div>
                          <small style={{ color: "#64748b" }}>{st.course} • {st.year}</small>
                        </td>
                        <td>
                          <span style={{ fontWeight: "600", color: "#2f5bea" }}>{st.careerGoal}</span>
                        </td>
                        <td>{st.tasksCount}</td>
                        <td>
                          <strong>{st.quizProgress}%</strong>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "80px", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${st.readinessScore}%`, height: "100%", background: "#10b981" }}></div>
                            </div>
                            <strong style={{ fontSize: "13px" }}>{st.readinessScore}%</strong>
                          </div>
                        </td>
                        <td>
                          <button
                            className="mentor-action-btn primary"
                            onClick={() => handleViewStudentProgress(st.studentId)}
                          >
                            <i className="bi bi-bar-chart"></i> Analyze Progress
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 4: ASSIGN TASKS & ROADMAPS
        ========================================================= */}
        {activeTab === "assign" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
            {/* Assign Task Card */}
            <div className="mentor-card">
              <div className="mentor-card-header">
                <div>
                  <h3>Assign Practical Task to Student</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Create structured coursework or project tasks with deadlines.
                  </p>
                </div>
              </div>

              {taskSuccess && (
                <div style={{ padding: "12px", background: "#dcfce7", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontWeight: "600" }}>
                  {taskSuccess}
                </div>
              )}

              <form onSubmit={handleAssignTask} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Select Student *</label>
                  <select
                    required
                    value={taskStudentId}
                    onChange={(e) => setTaskStudentId(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((st) => (
                      <option key={st.studentId} value={st.studentId}>
                        {st.name} ({st.careerGoal} - {st.college})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Build a REST API with Authentication in Django"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Skill Focus</label>
                    <input
                      type="text"
                      placeholder="e.g., Python / SQL"
                      value={taskSkill}
                      onChange={(e) => setTaskSkill(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Course / Project Module Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Backend Engineering Masterclass"
                    value={taskCourse}
                    onChange={(e) => setTaskCourse(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Description & Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific guidelines, repos to clone, or requirements to build..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <button type="submit" className="mentor-action-btn primary" style={{ padding: "12px", marginTop: "4px" }}>
                  <i className="bi bi-send"></i> Assign Task to Student
                </button>
              </form>
            </div>

            {/* Assign Roadmap Milestone Card */}
            <div className="mentor-card">
              <div className="mentor-card-header">
                <div>
                  <h3>Add Roadmap Milestone to Student Path</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Tailor the student's career roadmap with specialized milestones.
                  </p>
                </div>
              </div>

              {roadmapSuccess && (
                <div style={{ padding: "12px", background: "#dcfce7", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontWeight: "600" }}>
                  {roadmapSuccess}
                </div>
              )}

              <form onSubmit={handleAssignRoadmap} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Select Student *</label>
                  <select
                    required
                    value={roadmapStudentId}
                    onChange={(e) => setRoadmapStudentId(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((st) => (
                      <option key={st.studentId} value={st.studentId}>
                        {st.name} ({st.careerGoal})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Roadmap Stage Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Advanced Microservices & Docker Architecture"
                    value={roadmapStageName}
                    onChange={(e) => setRoadmapStageName(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 4 Weeks"
                    value={roadmapDuration}
                    onChange={(e) => setRoadmapDuration(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Skills Included (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Docker, Kubernetes, CI/CD, Terraform"
                    value={roadmapSkillsStr}
                    onChange={(e) => setRoadmapSkillsStr(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Milestone Description</label>
                  <textarea
                    rows={3}
                    placeholder="Explain what the student must master in this roadmap milestone..."
                    value={roadmapDesc}
                    onChange={(e) => setRoadmapDesc(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <button type="submit" className="mentor-action-btn primary" style={{ padding: "12px", marginTop: "4px" }}>
                  <i className="bi bi-map"></i> Assign Roadmap Milestone
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: TASK SUBMISSIONS & FEEDBACK
        ========================================================= */}
        {activeTab === "submissions" && (
          <div className="mentor-card">
            <div className="mentor-card-header">
              <div>
                <h3>Student Task Submissions & Feedback</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Review work submitted by students, assess their approach, and deliver mentor feedback.
                </p>
              </div>
              <span className="mentor-badge" style={{ background: "#2f5bea" }}>{submissions.length} Submissions</span>
            </div>

            {submissions.length === 0 ? (
              <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No task submissions awaiting review.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="mentor-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Task Title</th>
                      <th>Skill</th>
                      <th>Submission Notes & File</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          <strong>{sub.studentName}</strong>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{sub.studentEmail}</div>
                        </td>
                        <td>
                          <strong>{sub.title}</strong>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{sub.courseName}</div>
                        </td>
                        <td><span style={{ fontWeight: "600", color: "#2f5bea" }}>{sub.skill}</span></td>
                        <td style={{ maxWidth: "260px" }}>
                          <p style={{ margin: "0 0 4px", fontSize: "13px" }}>{sub.submissionNotes || "No notes provided."}</p>
                          {sub.submissionFile && (
                            <a href={sub.submissionFile} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "underline" }}>
                              <i className="bi bi-paperclip"></i> View Work / Link
                            </a>
                          )}
                          {sub.mentorFeedback && (
                            <div style={{ marginTop: "6px", padding: "6px 8px", background: "#f0fdf4", borderRadius: "6px", fontSize: "12px", color: "#166534" }}>
                              <strong>Given Feedback:</strong> {sub.mentorFeedback}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: sub.status === "Completed" ? "#dcfce7" : sub.status === "Needs Revision" ? "#fee2e2" : "#fef3c7",
                              color: sub.status === "Completed" ? "#15803d" : sub.status === "Needs Revision" ? "#b91c1c" : "#b45309",
                            }}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "#64748b" }}>{sub.submittedAt}</td>
                        <td>
                          <button
                            className="mentor-action-btn primary"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setSubmissionFeedback(sub.mentorFeedback || "");
                            }}
                          >
                            {sub.mentorFeedback ? "Update Feedback" : "Give Feedback"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 6: REVIEW STUDENT QUIZZES
        ========================================================= */}
        {activeTab === "quizzes" && (
          <div className="mentor-card">
            <div className="mentor-card-header">
              <div>
                <h3>Student-Created Quizzes (Pending Review)</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Students can create quizzes for platform peers. Only upon your review & approval will they be posted.
                </p>
              </div>
              <span className="mentor-badge" style={{ background: "#2f5bea" }}>{pendingQuizzes.length} Pending</span>
            </div>

            {pendingQuizzes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: "2rem", color: "#10b981", display: "block", marginBottom: "8px" }}></i>
                <p>All student quizzes have been reviewed! No pending submissions.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {pendingQuizzes.map((q) => (
                  <div key={q.id} style={{ padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "16px", color: "#0f172a" }}>{q.title}</strong>
                        <div style={{ fontSize: "13px", color: "#64748b", margin: "2px 0" }}>
                          Skill: <strong style={{ color: "#2f5bea" }}>{q.skill}</strong> • Difficulty: {q.difficulty} • Duration: {q.duration_minutes} mins
                        </div>
                        {q.description && <p style={{ fontSize: "13px", color: "#475569", margin: "6px 0 0" }}>{q.description}</p>}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="mentor-action-btn success"
                          onClick={() => {
                            setSelectedQuiz(q);
                            setQuizReviewNotes("Approved! High quality questions.");
                          }}
                        >
                          Review & Approve
                        </button>
                        <button
                          className="mentor-action-btn danger"
                          onClick={() => {
                            setSelectedQuiz(q);
                            setQuizReviewNotes("Please revise question phrasing and ensure accurate answer keys.");
                          }}
                        >
                          Review & Reject
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                      <strong style={{ fontSize: "13px", color: "#334155" }}>Questions included in this quiz:</strong>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                        {q.questions?.map((item, idx) => (
                          <div key={idx} style={{ padding: "10px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
                            <strong>Q{idx + 1}: {item.question}</strong>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
                              {item.options?.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    background: oIdx === item.correct_index ? "#dcfce7" : "#f1f5f9",
                                    color: oIdx === item.correct_index ? "#166534" : "#475569",
                                    fontWeight: oIdx === item.correct_index ? "600" : "normal",
                                    border: oIdx === item.correct_index ? "1px solid #86efac" : "none",
                                  }}
                                >
                                  {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === item.correct_index && "✓ (Correct)"}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 7: SHARE EXPERIENCE & PROFILE
        ========================================================= */}
        {activeTab === "experience" && (
          <div className="mentor-card">
            <div className="mentor-card-header">
              <div>
                <h3>Mentor Profile, Journey & Workplace Expectations</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  This information is visible to students seeking guidance, roadmap advice, and real-world workplace insights.
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div style={{ padding: "12px", background: "#dcfce7", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontWeight: "600" }}>
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Current Company *</label>
                  <input
                    type="text"
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Years of Experience</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editExp}
                    onChange={(e) => setEditExp(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Industry Domain</label>
                  <input
                    type="text"
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Professional Bio & Introduction</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Areas of Expertise / Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Guidance Topics (comma-separated)</label>
                  <input
                    type="text"
                    value={editGuidance}
                    onChange={(e) => setEditGuidance(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Real-World Workplace Expectations</label>
                <textarea
                  rows={3}
                  placeholder="Share what real engineering and product teams expect regarding autonomy, code quality, communication..."
                  value={editExpectations}
                  onChange={(e) => setEditExpectations(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <button type="submit" className="mentor-action-btn primary" style={{ padding: "12px", width: "200px" }}>
                <i className="bi bi-save"></i> Save Profile
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            TAB 8: RECOMMEND RESOURCES
        ========================================================= */}
        {activeTab === "resources" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
            <div className="mentor-card">
              <div className="mentor-card-header">
                <div>
                  <h3>Recommend New Learning Resource</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Suggest curated courses, certifications, or documentation to help students close skill gaps.
                  </p>
                </div>
              </div>

              {resSuccess && (
                <div style={{ padding: "12px", background: "#dcfce7", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontWeight: "600" }}>
                  {resSuccess}
                </div>
              )}

              <form onSubmit={handleAddResource} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Resource Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Deep Learning Specialization"
                    value={newResTitle}
                    onChange={(e) => setNewResTitle(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Skill *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Machine Learning"
                      value={newResSkill}
                      onChange={(e) => setNewResSkill(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Type</label>
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="Course">Course</option>
                      <option value="Certification">Certification</option>
                      <option value="Book">Book / Guide</option>
                      <option value="Tutorial">Hands-on Tutorial</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Provider</label>
                    <input
                      type="text"
                      placeholder="e.g., Coursera, Udemy, AWS"
                      value={newResProvider}
                      onChange={(e) => setNewResProvider(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Level</label>
                    <select
                      value={newResLevel}
                      onChange={(e) => setNewResLevel(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Resource Link / URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newResUrl}
                    onChange={(e) => setNewResUrl(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of why this resource is valuable..."
                    value={newResDesc}
                    onChange={(e) => setNewResDesc(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <button type="submit" className="mentor-action-btn primary" style={{ padding: "12px" }}>
                  <i className="bi bi-plus-circle"></i> Add Resource
                </button>
              </form>
            </div>

            <div className="mentor-card">
              <div className="mentor-card-header">
                <h3>Recommended Resources ({resources.length})</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "600px", overflowY: "auto" }}>
                {resources.map((r) => (
                  <div key={r.id} style={{ padding: "14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{r.title}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b", margin: "2px 0" }}>
                          <span style={{ color: "#2f5bea", fontWeight: "600" }}>{r.skill}</span> • {r.type} • {r.provider} • {r.level}
                        </div>
                      </div>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noreferrer" className="mentor-action-btn outline" style={{ fontSize: "12px" }}>
                          Open <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                      )}
                    </div>
                    {r.description && <p style={{ fontSize: "12px", color: "#475569", margin: "6px 0 0" }}>{r.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL: STUDENT PROGRESS ANALYZER
      ========================================================= */}
      {showProgressModal && selectedStudentProgress && (
        <div className="mentor-modal-overlay">
          <div className="mentor-modal" style={{ maxWidth: "720px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>Progress Analysis: {selectedStudentProgress.name}</h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>{selectedStudentProgress.college} • {selectedStudentProgress.course}</span>
              </div>
              <button onClick={() => setShowProgressModal(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            {/* Score Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
              <div style={{ padding: "14px", background: "#f0fdf4", borderRadius: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "#166534" }}>Career Readiness</span>
                <h2 style={{ margin: "4px 0", color: "#15803d" }}>{selectedStudentProgress.readinessScore}%</h2>
              </div>
              <div style={{ padding: "14px", background: "#eff6ff", borderRadius: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "#1e40af" }}>Tasks Completed</span>
                <h2 style={{ margin: "4px 0", color: "#1d4ed8" }}>{selectedStudentProgress.skillProgress}%</h2>
              </div>
              <div style={{ padding: "14px", background: "#faf5ff", borderRadius: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "#6b21a8" }}>Quiz Average</span>
                <h2 style={{ margin: "4px 0", color: "#7e22ce" }}>{selectedStudentProgress.quizAverage}%</h2>
              </div>
            </div>

            {/* Career Recommendations */}
            <div style={{ marginBottom: "20px" }}>
              <strong style={{ fontSize: "14px", color: "#1e293b", display: "block", marginBottom: "8px" }}>Target Career & Matches</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedStudentProgress.careerRecommendations?.map((cr, idx) => (
                  <div key={idx} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{cr.career}</strong>
                      <span style={{ fontWeight: "700", color: "#10b981" }}>{cr.match}% Match</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      <div>✓ Matched: <span style={{ color: "#166534" }}>{cr.matchedSkills}</span></div>
                      <div>✗ Missing/Gaps: <span style={{ color: "#b91c1c" }}>{cr.missingSkills}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Summary */}
            <div style={{ marginBottom: "20px" }}>
              <strong style={{ fontSize: "14px", color: "#1e293b", display: "block", marginBottom: "8px" }}>Assigned & Active Tasks ({selectedStudentProgress.tasks?.length})</strong>
              <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedStudentProgress.tasks?.map((t) => (
                  <div key={t.id} style={{ padding: "8px 12px", borderRadius: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <div>
                      <strong>{t.title}</strong>
                      <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>({t.skill})</span>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: t.status === "Completed" ? "#10b981" : "#f59e0b" }}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="mentor-action-btn primary" onClick={() => setShowProgressModal(false)}>Close Analysis</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: REPLY / ACTION REQUEST
      ========================================================= */}
      {selectedRequest && (
        <div className="mentor-modal-overlay">
          <div className="mentor-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Mentorship: {selectedRequest.topic}</h3>
              <button onClick={() => setSelectedRequest(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px", fontSize: "13px" }}>
              <strong style={{ display: "block", color: "#0f172a" }}>Student: {selectedRequest.otherName}</strong>
              <p style={{ margin: "4px 0", color: "#475569" }}>{selectedRequest.message}</p>
              {selectedRequest.goals && <small style={{ color: "#64748b" }}>Goals: {selectedRequest.goals}</small>}
            </div>

            <form onSubmit={handleRequestReply} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Your Guidance / Advice *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your guidance advice, answer to their question, or recommended steps..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="mentor-action-btn outline" onClick={() => setSelectedRequest(null)}>Cancel</button>
                <button type="submit" className="mentor-action-btn primary">Send Reply to Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: TASK FEEDBACK
      ========================================================= */}
      {selectedSubmission && (
        <div className="mentor-modal-overlay">
          <div className="mentor-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Provide Feedback: {selectedSubmission.title}</h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px", fontSize: "13px" }}>
              <strong style={{ display: "block", color: "#0f172a" }}>Submitted by: {selectedSubmission.studentName}</strong>
              <p style={{ margin: "4px 0", color: "#475569" }}>{selectedSubmission.submissionNotes}</p>
              {selectedSubmission.submissionFile && (
                <a href={selectedSubmission.submissionFile} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                  View Work Link / File
                </a>
              )}
            </div>

            <form onSubmit={handleSubmitTaskFeedback} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Decision Status</label>
                <select
                  value={submissionDecision}
                  onChange={(e) => setSubmissionDecision(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  <option value="Completed">Approve (Completed)</option>
                  <option value="Needs Revision">Needs Revision</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Mentor Feedback Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide feedback on their code, architecture, or solutions..."
                  value={submissionFeedback}
                  onChange={(e) => setSubmissionFeedback(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="mentor-action-btn outline" onClick={() => setSelectedSubmission(null)}>Cancel</button>
                <button type="submit" className="mentor-action-btn success">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: QUIZ REVIEW
      ========================================================= */}
      {selectedQuiz && (
        <div className="mentor-modal-overlay">
          <div className="mentor-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Review Quiz: {selectedQuiz.title}</h3>
              <button onClick={() => setSelectedQuiz(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "14px", fontSize: "13px" }}>
              <strong>Skill: {selectedQuiz.skill}</strong> • Difficulty: {selectedQuiz.difficulty} • Questions: {selectedQuiz.questions?.length}
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Review Notes for Student</label>
              <textarea
                rows={3}
                placeholder="Explain why this quiz is approved or changes needed if rejected..."
                value={quizReviewNotes}
                onChange={(e) => setQuizReviewNotes(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" className="mentor-action-btn outline" onClick={() => setSelectedQuiz(null)}>Cancel</button>
              <button type="button" className="mentor-action-btn danger" onClick={() => handleReviewQuiz("rejected")}>Reject Quiz</button>
              <button type="button" className="mentor-action-btn success" onClick={() => handleReviewQuiz("approved")}>Approve & Post Quiz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
