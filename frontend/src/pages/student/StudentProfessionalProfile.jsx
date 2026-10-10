import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentDashboard.css";
import "./StudentIndustryProfessionals.css";

const StudentProfessionalProfile = () => {
  const pathParts = window.location.pathname.split("/");
  const profId = pathParts[pathParts.length - 1] || "1";

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Mentorship request modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestGoals, setRequestGoals] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState("");
  const [myRequests, setMyRequests] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const loadExpert = async () => {
    setLoading(true);
    try {
      const res = await api.get(`mentorship/experts/${profId}/`);
      setExpert(res.data);
    } catch (err) {
      console.error("Failed to load expert details:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    if (!user) return;
    try {
      const res = await api.get(`mentorship/requests/list/?user_id=${user.user_id}&role=student`);
      setMyRequests(res.data);
    } catch (err) {
      console.error("Failed to load previous requests:", err);
    }
  };

  useEffect(() => {
    loadExpert();
    loadMyRequests();
  }, [profId]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestTopic.trim() || !requestMessage.trim()) {
      alert("Please fill in the topic and message.");
      return;
    }

    setSubmittingRequest(true);
    try {
      await api.post("mentorship/requests/", {
        student_id: user?.user_id,
        mentor_id: expert?.id,
        topic: requestTopic.trim(),
        message: requestMessage.trim(),
        goals: requestGoals.trim(),
      });
      setRequestSuccess("Your mentorship request was sent successfully! The mentor has been notified.");
      setRequestTopic("");
      setRequestMessage("");
      setRequestGoals("");
      loadMyRequests();
      setTimeout(() => {
        setShowConnectModal(false);
        setRequestSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Failed to send mentorship request:", err);
      alert("Failed to send request. Please try again.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Professional Profile">
        <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: "2rem" }}></i>
          <p>Loading professional profile...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!expert) {
    return (
      <StudentLayout pageTitle="Professional Profile">
        <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
          <p>Professional profile not found.</p>
          <a href="/student/industry-professionals" className="student-primary-btn">
            Back to Professionals
          </a>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle={`${expert.name} — Profile`}>
      <div style={{ marginBottom: "1.5rem" }}>
        <a
          href="/student/industry-professionals"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#6366f1",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "0.9rem",
          }}
        >
          <i className="bi bi-arrow-left"></i> Back to Industry Professionals
        </a>
      </div>

      {/* Header Card */}
      <div className="professional-profile-header student-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div className="large-professional-avatar">
            {expert.initials || expert.name.charAt(0)}
          </div>

          <div className="professional-header-info">
            <span className="student-section-label">VERIFIED INDUSTRY EXPERT</span>
            <h1>{expert.name}</h1>
            <h3 style={{ margin: "0.25rem 0", color: "#475569" }}>
              {expert.role} at <strong style={{ color: "#1e293b" }}>{expert.company}</strong>
            </h3>
            <p style={{ color: "#64748b", margin: "0.25rem 0" }}>
              <i className="bi bi-briefcase" style={{ marginRight: "0.4rem" }}></i>
              {expert.experience} • {expert.domain}
            </p>
          </div>
        </div>

        <div>
          <button
            className="student-primary-btn"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.95rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
            onClick={() => setShowConnectModal(true)}
          >
            <i className="bi bi-person-plus-fill"></i>
            Connect & Request Mentorship
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="professional-tabs" style={{ margin: "1.5rem 0", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {[
          { key: "overview", label: "Overview & Experience" },
          { key: "journey", label: "Career Journey Timeline" },
          { key: "expectations", label: "Workplace Expectations" },
          { key: "interview", label: "Interview Preparation Tips" },
          { key: "guidance", label: "My Guidance Requests" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="professional-content-area">
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            <div className="student-card">
              <span className="student-section-label">ABOUT THE MENTOR</span>
              <h2>Professional Background</h2>
              <p style={{ lineHeight: "1.7", color: "#475569", margin: "1rem 0" }}>
                {expert.bio || "Industry professional dedicated to providing actionable career guidance and sharing real-world engineering experiences."}
              </p>

              <h4 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>Key Technical & Domain Skills</h4>
              <div className="skill-tags">
                {expert.skills?.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="student-card">
              <span className="student-section-label">AREAS OF GUIDANCE</span>
              <h2>What You Can Ask Me About</h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>
                This mentor specializes in advising students on the following topics:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {expert.guidance?.map((topic, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#334155" }}>
                    <i className="bi bi-check-circle-fill" style={{ color: "#10b981" }}></i>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "2rem", padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <strong style={{ display: "block", color: "#1e293b", marginBottom: "0.3rem" }}>Ready to connect?</strong>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                  Send a personalized message outlining your background and questions. The mentor will review and guide you.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "journey" && (
          <div className="student-card">
            <span className="student-section-label">CAREER JOURNEY</span>
            <h2>Real-World Career Path</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              See how {expert.name} progressed from their early learning days to their current role at {expert.company}.
            </p>

            <div className="career-timeline">
              {expert.journey && expert.journey.length > 0 ? (
                expert.journey.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: "1.5rem", borderLeft: "2px solid #6366f1", paddingLeft: "1.25rem", position: "relative" }}>
                    <div style={{ position: "absolute", left: "-6px", top: "0", width: "10px", height: "10px", borderRadius: "50%", background: "#6366f1" }}></div>
                    <strong style={{ fontSize: "1.05rem", color: "#1e293b", display: "block" }}>
                      {item.title}
                    </strong>
                    <span style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: "600", display: "block", margin: "0.2rem 0" }}>
                      {item.year}
                    </span>
                    <small style={{ color: "#475569", fontSize: "0.9rem", lineHeight: "1.5" }}>
                      {item.description}
                    </small>
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b" }}>Career timeline details will appear here.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "expectations" && (
          <div className="student-card">
            <span className="student-section-label">INDUSTRY EXPECTATIONS</span>
            <h2>What Workplace Environments Expect</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              Direct insights on standards, communication, problem solving, and day-to-day corporate workflow expectations.
            </p>

            <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: "12px", borderLeft: "4px solid #6366f1" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>Workplace Standards & Insights:</h4>
              <p style={{ color: "#334155", lineHeight: "1.8", margin: 0, fontSize: "0.95rem" }}>
                {expert.workplaceExpectations || "High ownership of assigned tasks, proactive and respectful communication across teams, and continuous dedication to refining your core fundamentals."}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
              <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <strong style={{ display: "block", color: "#1e293b", marginBottom: "0.3rem" }}>
                  <i className="bi bi-lightning-charge" style={{ color: "#f59e0b", marginRight: "0.4rem" }}></i>
                  Ownership & Independence
                </strong>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                  Take initiative on tasks, research documentation before escalating, and deliver on agreed deadlines.
                </p>
              </div>

              <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <strong style={{ display: "block", color: "#1e293b", marginBottom: "0.3rem" }}>
                  <i className="bi bi-chat-dots" style={{ color: "#3b82f6", marginRight: "0.4rem" }}></i>
                  Proactive Communication
                </strong>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                  Communicate early when encountering blockers and summarize technical decisions transparently.
                </p>
              </div>

              <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <strong style={{ display: "block", color: "#1e293b", marginBottom: "0.3rem" }}>
                  <i className="bi bi-code-slash" style={{ color: "#10b981", marginRight: "0.4rem" }}></i>
                  Clean Code & Standards
                </strong>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                  Follow repository guidelines, write tested components, and participate thoroughly in peer reviews.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "interview" && (
          <div className="student-card">
            <span className="student-section-label">INTERVIEW PREPARATION</span>
            <h2>Interview Preparation Guidance</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              Practical tips that helped this mentor and their peers succeed in competitive technical and behavioral interviews.
            </p>

            <ul className="professional-tips" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {expert.interviewTips && expert.interviewTips.length > 0 ? (
                expert.interviewTips.map((tip, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <i className="bi bi-award-fill" style={{ color: "#6366f1", fontSize: "1.2rem", marginTop: "0.1rem" }}></i>
                    <div>
                      <strong style={{ color: "#1e293b", display: "block", marginBottom: "0.2rem" }}>Tip #{idx + 1}</strong>
                      <span style={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}>{tip}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li style={{ color: "#64748b" }}>Master core fundamentals, prepare practical projects, and practice mock behavioral scenarios.</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === "guidance" && (
          <div className="student-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <span className="student-section-label">CONVERSATION & MENTORSHIP</span>
                <h2>My Guidance Requests</h2>
                <p style={{ color: "#64748b", margin: 0 }}>
                  Track your questions, requests, and direct mentor feedback.
                </p>
              </div>
              <button
                className="student-primary-btn"
                onClick={() => setShowConnectModal(true)}
              >
                + New Request
              </button>
            </div>

            {myRequests.filter((r) => r.otherName.includes(expert.name.split(" ")[0])).length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                <i className="bi bi-chat-square-text" style={{ fontSize: "2rem" }}></i>
                <p style={{ margin: "0.75rem 0" }}>You haven't sent any guidance requests to {expert.name} yet.</p>
                <button
                  className="student-primary-btn"
                  onClick={() => setShowConnectModal(true)}
                >
                  Send First Request
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {myRequests
                  .filter((r) => r.otherName.includes(expert.name.split(" ")[0]))
                  .map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: "1.25rem",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <strong style={{ fontSize: "1rem", color: "#1e293b" }}>{req.topic}</strong>
                        <span
                          style={{
                            padding: "0.25rem 0.6rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            background:
                              req.status === "approved"
                                ? "#dcfce7"
                                : req.status === "rejected"
                                ? "#fee2e2"
                                : "#e0e7ff",
                            color:
                              req.status === "approved"
                                ? "#15803d"
                                : req.status === "rejected"
                                ? "#b91c1c"
                                : "#4338ca",
                          }}
                        >
                          {req.status?.toUpperCase()}
                        </span>
                      </div>

                      <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0.5rem 0" }}>
                        <strong>Your question:</strong> {req.message}
                      </p>

                      {req.goals && (
                        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.25rem 0" }}>
                          <strong>Your goals:</strong> {req.goals}
                        </p>
                      )}

                      {req.reply ? (
                        <div
                          style={{
                            marginTop: "0.75rem",
                            padding: "0.85rem",
                            background: "#f0fdf4",
                            borderLeft: "3px solid #22c55e",
                            borderRadius: "6px",
                          }}
                        >
                          <strong style={{ display: "block", color: "#166534", fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                            Mentor Reply:
                          </strong>
                          <p style={{ fontSize: "0.9rem", color: "#14532d", margin: 0 }}>{req.reply}</p>
                        </div>
                      ) : (
                        <small style={{ color: "#94a3b8", display: "block", marginTop: "0.5rem" }}>
                          Pending mentor response • Sent {req.createdAt}
                        </small>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "560px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "#1e293b" }}>Connect with {expert.name}</h3>
              <button
                onClick={() => setShowConnectModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 1.25rem 0" }}>
              Submit your guidance request or question. The mentor will be notified immediately to review and reply.
            </p>

            {requestSuccess ? (
              <div style={{ padding: "1rem", background: "#dcfce7", color: "#166534", borderRadius: "8px", fontWeight: "600", textAlign: "center" }}>
                {requestSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendRequest} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.3rem" }}>
                    Guidance Topic / Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Transitioning to Data Science / Resume Review"
                    value={requestTopic}
                    onChange={(e) => setRequestTopic(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.3rem" }}>
                    Your Message / Specific Questions *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your current stage, questions you have, or challenges you're facing..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.3rem" }}>
                    Your Learning Goals (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Crack a software engineering internship by end of year"
                    value={requestGoals}
                    onChange={(e) => setRequestGoals(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    style={{
                      padding: "0.7rem 1.25rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="student-primary-btn"
                    style={{ padding: "0.7rem 1.5rem", cursor: "pointer" }}
                  >
                    {submittingRequest ? "Sending..." : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentProfessionalProfile;