import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentDashboard.css";
import "./StudentIndustryProfessionals.css";

const TABS = [
  { key: "overview", label: "Overview", icon: "bi-person-lines-fill" },
  { key: "journey", label: "Career Journey", icon: "bi-signpost-split" },
  { key: "expectations", label: "Workplace Expectations", icon: "bi-building" },
  { key: "interview", label: "Interview Tips", icon: "bi-chat-square-quote" },
  { key: "guidance", label: "My Guidance Requests", icon: "bi-chat-dots" },
];

const EXPECTATIONS = [
  {
    icon: "bi-lightning-charge",
    tone: "amber",
    title: "Ownership & Independence",
    text: "Take initiative on tasks, research documentation before escalating, and deliver on agreed deadlines.",
  },
  {
    icon: "bi-chat-dots",
    tone: "blue",
    title: "Proactive Communication",
    text: "Communicate early when you hit blockers and explain technical decisions clearly.",
  },
  {
    icon: "bi-code-slash",
    tone: "green",
    title: "Quality & Standards",
    text: "Follow team guidelines, write tested work and take part in peer reviews.",
  },
];

const StudentProfessionalProfile = () => {
  const pathParts = window.location.pathname.split("/");
  const profId = pathParts[pathParts.length - 1] || "1";

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Guidance request modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestGoals, setRequestGoals] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestError, setRequestError] = useState("");
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

  // Close the modal with Escape
  useEffect(() => {
    if (!showConnectModal) return undefined;
    const onKey = (e) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showConnectModal]);

  const closeModal = () => {
    setShowConnectModal(false);
    setRequestError("");
    setRequestSuccess("");
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setRequestError("");

    if (!requestTopic.trim() || !requestMessage.trim()) {
      setRequestError("Please fill in the topic and your message.");
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
      setRequestSuccess("Your request was sent. The mentor has been notified and will reply here.");
      setRequestTopic("");
      setRequestMessage("");
      setRequestGoals("");
      loadMyRequests();
      setActiveTab("guidance");
      setTimeout(closeModal, 2200);
    } catch (err) {
      console.error("Failed to send mentorship request:", err);
      setRequestError("Failed to send request. Please try again.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Professional Profile">
        <div className="pp-state">
          <i className="bi bi-arrow-repeat bi-spin"></i>
          <h3>Loading professional profile...</h3>
          <p>Fetching the mentor's details</p>
        </div>
      </StudentLayout>
    );
  }

  if (!expert) {
    return (
      <StudentLayout pageTitle="Professional Profile">
        <div className="pp-state">
          <i className="bi bi-person-x"></i>
          <h3>Professional profile not found</h3>
          <p>This mentor may no longer be available.</p>
          <a href="/student/industry-professionals" className="student-primary-btn">
            Back to Professionals
          </a>
        </div>
      </StudentLayout>
    );
  }

  const requestsForExpert = myRequests.filter((r) => String(r.otherId) === String(expert.id));
  const skills = expert.skills || [];
  const guidanceTopics = expert.guidance || [];

  return (
    <StudentLayout pageTitle={`${expert.name} — Profile`}>
      <div className="pp-page">
        <a href="/student/industry-professionals" className="pp-back">
          <i className="bi bi-arrow-left"></i> Back to Industry Professionals
        </a>

        {/* HERO */}
        <section className="pp-hero">
          <div className="pp-hero-main">
            <div className="pp-hero-avatar">{expert.initials || expert.name.charAt(0)}</div>

            <div className="pp-hero-info">
              <span className="industry-hero-badge">
                <i className="bi bi-patch-check-fill"></i> Verified Industry Expert
              </span>
              <h1>{expert.name}</h1>
              <p className="pp-hero-role">
                {expert.role} at <strong>{expert.company}</strong>
              </p>
              <div className="pp-hero-chips">
                <span><i className="bi bi-briefcase"></i> {expert.experience}</span>
                <span><i className="bi bi-compass"></i> {expert.domain}</span>
              </div>
            </div>
          </div>

          <div className="pp-hero-side">
            <button className="pp-cta" onClick={() => setShowConnectModal(true)}>
              <i className="bi bi-send"></i> Request Guidance
            </button>
            <div className="pp-hero-stats">
              <div><strong>{skills.length}</strong><span>Skills</span></div>
              <div><strong>{guidanceTopics.length}</strong><span>Topics</span></div>
              <div><strong>{requestsForExpert.length}</strong><span>Your requests</span></div>
            </div>
          </div>
        </section>

        {/* TABS */}
        <nav className="pp-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`pp-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`bi ${tab.icon}`}></i>
              {tab.label}
              {tab.key === "guidance" && requestsForExpert.length > 0 && (
                <em>{requestsForExpert.length}</em>
              )}
            </button>
          ))}
        </nav>

        {/* TAB CONTENT */}
        {activeTab === "overview" && (
          <div className="pp-grid">
            <section className="pp-card">
              <span className="student-section-label">ABOUT THE MENTOR</span>
              <h2>Professional Background</h2>
              <p className="pp-text">
                {expert.bio ||
                  "Industry professional dedicated to providing actionable career guidance and sharing real-world experience."}
              </p>

              <h4 className="pp-subhead">Key skills</h4>
              <div className="expert-skill-tags">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span className="expert-skill-chip" key={skill}>{skill}</span>
                  ))
                ) : (
                  <span className="pp-muted">No skills listed yet.</span>
                )}
              </div>
            </section>

            <section className="pp-card">
              <span className="student-section-label">AREAS OF GUIDANCE</span>
              <h2>What you can ask</h2>
              <p className="pp-muted pp-lead">This mentor advises students on:</p>

              {guidanceTopics.length > 0 ? (
                <ul className="pp-check-list">
                  {guidanceTopics.map((topic, idx) => (
                    <li key={idx}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pp-muted">Topics will be listed here.</p>
              )}

              <div className="pp-callout">
                <strong>Ready to connect?</strong>
                <p>
                  Share your background and questions. The mentor reviews each request and replies
                  directly in your guidance requests.
                </p>
                <button className="student-primary-btn" onClick={() => setShowConnectModal(true)}>
                  Request Guidance <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === "journey" && (
          <section className="pp-card">
            <span className="student-section-label">CAREER JOURNEY</span>
            <h2>Real-world career path</h2>
            <p className="pp-muted pp-lead">
              How {expert.name} progressed from early learning to their current role at {expert.company}.
            </p>

            {expert.journey && expert.journey.length > 0 ? (
              <ol className="pp-timeline">
                {expert.journey.map((item, idx) => (
                  <li key={idx}>
                    <span className="pp-timeline-dot"></span>
                    <span className="pp-timeline-year">{item.year}</span>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="pp-muted">Career timeline details will appear here.</p>
            )}
          </section>
        )}

        {activeTab === "expectations" && (
          <section className="pp-card">
            <span className="student-section-label">INDUSTRY EXPECTATIONS</span>
            <h2>What workplaces expect</h2>
            <p className="pp-muted pp-lead">
              Standards, communication and day-to-day workflow expectations in this field.
            </p>

            <div className="pp-quote">
              <h4>Workplace standards &amp; insights</h4>
              <p>
                {expert.workplaceExpectations ||
                  "High ownership of assigned tasks, proactive and respectful communication across teams, and continuous dedication to refining your core fundamentals."}
              </p>
            </div>

            <div className="pp-mini-grid">
              {EXPECTATIONS.map((item) => (
                <div className="pp-mini-card" key={item.title}>
                  <div className={`pp-mini-icon ${item.tone}`}>
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "interview" && (
          <section className="pp-card">
            <span className="student-section-label">INTERVIEW PREPARATION</span>
            <h2>Interview preparation guidance</h2>
            <p className="pp-muted pp-lead">
              Practical tips that helped this mentor and their peers succeed in technical and behavioral interviews.
            </p>

            {expert.interviewTips && expert.interviewTips.length > 0 ? (
              <ul className="pp-tips">
                {expert.interviewTips.map((tip, idx) => (
                  <li key={idx}>
                    <span className="pp-tip-num">{idx + 1}</span>
                    <p>{tip}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pp-muted">
                Master core fundamentals, prepare practical projects and practise mock behavioral scenarios.
              </p>
            )}
          </section>
        )}

        {activeTab === "guidance" && (
          <section className="pp-card">
            <div className="pp-card-head">
              <div>
                <span className="student-section-label">CONVERSATION &amp; MENTORSHIP</span>
                <h2>My guidance requests</h2>
                <p className="pp-muted">Track your questions to {expert.name} and their replies.</p>
              </div>
              <button className="student-primary-btn" onClick={() => setShowConnectModal(true)}>
                <i className="bi bi-plus-lg"></i> New Request
              </button>
            </div>

            {requestsForExpert.length === 0 ? (
              <div className="pp-empty">
                <i className="bi bi-chat-square-text"></i>
                <h3>No requests yet</h3>
                <p>You haven't sent any guidance requests to {expert.name}.</p>
                <button className="student-primary-btn" onClick={() => setShowConnectModal(true)}>
                  Send First Request
                </button>
              </div>
            ) : (
              <div className="pp-requests">
                {requestsForExpert.map((req) => (
                  <article className="pp-request" key={req.id}>
                    <div className="pp-request-top">
                      <strong>{req.topic}</strong>
                      <span className={`pp-status ${String(req.status).toLowerCase()}`}>
                        {String(req.status).charAt(0).toUpperCase() + String(req.status).slice(1)}
                      </span>
                    </div>

                    <p className="pp-request-line"><b>Your question:</b> {req.message}</p>
                    {req.goals && <p className="pp-request-line"><b>Your goals:</b> {req.goals}</p>}

                    {req.reply ? (
                      <div className="pp-reply">
                        <strong><i className="bi bi-reply-fill"></i> Mentor reply</strong>
                        <p>{req.reply}</p>
                      </div>
                    ) : (
                      <small className="pp-pending">
                        <i className="bi bi-clock"></i> Waiting for a reply • Sent {req.createdAt}
                      </small>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* GUIDANCE REQUEST MODAL */}
      {showConnectModal && (
        <div className="pp-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="pp-modal" role="dialog" aria-modal="true" aria-labelledby="pp-modal-title">
            <div className="pp-modal-head">
              <div>
                <h3 id="pp-modal-title">Request guidance from {expert.name}</h3>
                <p>The mentor is notified immediately and replies in your guidance requests.</p>
              </div>
              <button className="pp-modal-close" onClick={closeModal} aria-label="Close">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {requestSuccess ? (
              <div className="pp-success">
                <i className="bi bi-check-circle-fill"></i>
                <p>{requestSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="pp-form">
                {requestError && (
                  <div className="pp-form-error">
                    <i className="bi bi-exclamation-circle-fill"></i> {requestError}
                  </div>
                )}

                <label>
                  <span>Guidance topic *</span>
                  <input
                    type="text"
                    placeholder="e.g., Transitioning to Data Science / Resume review"
                    value={requestTopic}
                    onChange={(e) => setRequestTopic(e.target.value)}
                  />
                </label>

                <label>
                  <span>Your message / specific questions *</span>
                  <textarea
                    rows={4}
                    placeholder="Describe your current stage, your questions or the challenges you're facing..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />
                </label>

                <label>
                  <span>Your learning goals <em>(optional)</em></span>
                  <input
                    type="text"
                    placeholder="e.g., Crack a software engineering internship by year end"
                    value={requestGoals}
                    onChange={(e) => setRequestGoals(e.target.value)}
                  />
                </label>

                <div className="pp-form-actions">
                  <button type="button" className="pp-btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="student-primary-btn" disabled={submittingRequest}>
                    {submittingRequest ? "Sending..." : "Send Request"}
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
