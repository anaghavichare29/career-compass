import React, { useEffect, useRef, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentMentorChat.css";

/* -------------------------------------------------------
   Utility helpers
------------------------------------------------------- */

const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
};

const groupMessagesByDate = (messages) => {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const d = msg.created_at ? formatDate(msg.created_at) : "";
    if (d !== lastDate) {
      groups.push({ type: "date", label: d });
      lastDate = d;
    }
    groups.push({ type: "message", ...msg });
  });
  return groups;
};

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */

const StudentMentorChat = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowList, setMobileShowList] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const selectedMentorRef = useRef(null);
  selectedMentorRef.current = selectedMentor;

  /* Fetch all assigned mentors */
  const loadMentors = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await api.get("mentorship/my-mentors/", {
        params: { user_id: user?.user_id },
      });
      const list = res.data || [];
      setMentors(list);

      // Select initial mentor if none selected
      if (!selectedMentorRef.current && list.length > 0) {
        setSelectedMentor(list[0]);
        loadMessages(list[0], true);
      } else if (selectedMentorRef.current && list.length > 0) {
        const currentId = selectedMentorRef.current.mentor_id || selectedMentorRef.current.userId || selectedMentorRef.current.user_id;
        const exists = list.find((m) => (m.mentor_id || m.userId || m.user_id) === currentId);
        if (exists) {
          setSelectedMentor(exists);
        }
      }
    } catch (err) {
      console.error("Failed to load mentors:", err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  /* Fetch messages for a specific mentor */
  const loadMessages = async (targetMentor, showLoading = false) => {
    if (!targetMentor || !user?.user_id) return;
    if (showLoading) setMsgLoading(true);
    try {
      const targetMentorId = targetMentor.mentor_id || targetMentor.userId || targetMentor.user_id;
      const res = await api.get("mentorship/messages/", {
        params: {
          user_id: user.user_id,
          mentor_id: targetMentorId,
        },
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to load mentor messages:", err);
    } finally {
      if (showLoading) setMsgLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadMentors(true);

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      if (selectedMentorRef.current) {
        loadMessages(selectedMentorRef.current, false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // When selected mentor changes, load their messages
  const handleSelectMentor = (mentorItem) => {
    setSelectedMentor(mentorItem);
    setMobileShowList(false);
    loadMessages(mentorItem, true);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* -------------------------------------------------------
     Send message
  ------------------------------------------------------- */

  const handleSend = async () => {
    if (!text.trim() || !selectedMentor) return;
    const messageText = text.trim();
    setText("");
    setSending(true);

    const targetMentorId = selectedMentor.mentor_id || selectedMentor.userId || selectedMentor.user_id;

    // Optimistic UI
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: user?.user_id,
      message: messageText,
      created_at: new Date().toISOString(),
      is_read: false,
      temp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.post("mentorship/messages/send/", {
        user_id: user?.user_id,
        mentor_id: targetMentorId,
        message: messageText,
      });

      // Refresh to get server message
      await loadMessages(selectedMentor, false);
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setError("Message failed to send. Please check your connection and try again.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* -------------------------------------------------------
     Loading and Empty states
  ------------------------------------------------------- */

  if (loading) {
    return (
      <StudentLayout pageTitle="Mentor Chat">
        <div className="mentor-chat-page">
          <div className="mentor-chat-loading">
            <i className="bi bi-chat-dots"></i>
            <p>Loading your mentor chat...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!mentors || mentors.length === 0) {
    return (
      <StudentLayout pageTitle="Mentor Chat">
        <div className="mentor-chat-page">
          <div className="mentor-chat-empty-state">
            <div className="mentor-empty-icon">
              <i className="bi bi-person-badge"></i>
            </div>
            <h2>No Mentors Connected Yet</h2>
            <p>
              You haven't connected with any industry mentors yet.
              Browse verified industry experts and send a guidance request to start 1-on-1 mentorship.
            </p>
            <div className="mentor-empty-info">
              <i className="bi bi-info-circle"></i>
              <span>
                Once a mentor accepts your request, your live conversation thread will appear here.
              </span>
            </div>
            <button
              className="student-primary-btn"
              onClick={() =>
                (window.location.href = "/student/industry-professionals")
              }
            >
              Browse Industry Experts
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const filteredMentors = mentors.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.company || "").toLowerCase().includes(q) ||
      (m.designation || "").toLowerCase().includes(q) ||
      (m.topic || "").toLowerCase().includes(q)
    );
  });

  const activeMentor = selectedMentor || mentors[0];
  const grouped = groupMessagesByDate(messages);

  return (
    <StudentLayout pageTitle="Mentor Chat">
      <div className="mentor-chat-page">
        <div className="mentor-chat-container">

          {/* ------------------------------------------------
              LEFT SIDEBAR: ALL ASSIGNED MENTORS
          ------------------------------------------------ */}
          <aside className={`mentor-chat-sidebar ${mobileShowList ? "mobile-show" : ""}`}>
            <div className="mentor-sidebar-header">
              <h3>
                <span>Assigned Mentors</span>
                <span className="mentor-count-badge">{mentors.length}</span>
              </h3>
              {mentors.length > 2 && (
                <div className="mentor-search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Search mentor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="mentor-list-scroll">
              {filteredMentors.map((m) => {
                const mentorId = m.mentor_id || m.userId || m.user_id;
                const isSelected = activeMentor && (activeMentor.mentor_id || activeMentor.userId || activeMentor.user_id) === mentorId;
                const initials = m.name
                  ? m.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
                  : "M";

                return (
                  <button
                    key={`mentor-${mentorId}`}
                    type="button"
                    className={`mentor-item-card ${isSelected ? "active" : ""}`}
                    onClick={() => handleSelectMentor(m)}
                  >
                    <div className="mentor-item-avatar">
                      {initials}
                      <span className={`mentor-status-dot ${m.online ? "online" : "offline"}`}></span>
                    </div>

                    <div className="mentor-item-info">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="mentor-item-name">{m.name}</span>
                        {m.status && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              padding: "1px 6px",
                              borderRadius: "10px",
                              background: m.status === "approved" ? "#dcfce7" : "#fef3c7",
                              color: m.status === "approved" ? "#15803d" : "#b45309",
                            }}
                          >
                            {m.status}
                          </span>
                        )}
                      </div>

                      <div className="mentor-item-role">
                        {m.designation || "Mentor"}
                        {m.company ? ` · ${m.company}` : ""}
                      </div>

                      {m.topic && (
                        <span className="mentor-item-topic" title={m.topic}>
                          {m.topic}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ------------------------------------------------
              RIGHT MAIN CHAT PANE
          ------------------------------------------------ */}
          <main className="mentor-chat-main">
            {activeMentor && (
              <>
                {/* Mentor Info Header */}
                <div className="mentor-chat-header">
                  <div className="mentor-chat-header-left">
                    <button
                      type="button"
                      className="mentor-mobile-toggle-btn"
                      onClick={() => setMobileShowList(!mobileShowList)}
                      title="View all mentors"
                    >
                      <i className="bi bi-people"></i>
                    </button>

                    <div className="mentor-avatar-large">
                      {activeMentor.name
                        ? activeMentor.name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "M"}
                      <span className={`mentor-status-dot ${activeMentor.online ? "online" : "offline"}`}></span>
                    </div>

                    <div className="mentor-chat-header-info">
                      <h2>{activeMentor.name || "Your Mentor"}</h2>
                      <div className="mentor-chat-meta">
                        <span className="mentor-chat-role">
                          {activeMentor.designation || "Mentor"}
                          {activeMentor.company ? ` · ${activeMentor.company}` : ""}
                        </span>
                        <span className={`mentor-online-status ${activeMentor.online ? "online" : "offline"}`}>
                          <i className={`bi ${activeMentor.online ? "bi-circle-fill" : "bi-circle"}`}></i>
                          {activeMentor.online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mentor-chat-header-right">
                    <div className="mentor-detail-badge">
                      <i className="bi bi-mortarboard"></i>
                      <span>Assigned Mentor</span>
                    </div>
                  </div>
                </div>

                {/* Mentor Profile Strip */}
                <div className="mentor-profile-strip">
                  <div className="mentor-profile-strip-items">
                    {activeMentor.industry && (
                      <div className="mentor-strip-item">
                        <i className="bi bi-building"></i>
                        <span>{activeMentor.industry}</span>
                      </div>
                    )}
                    {activeMentor.experience_years && (
                      <div className="mentor-strip-item">
                        <i className="bi bi-briefcase"></i>
                        <span>{activeMentor.experience_years} yrs experience</span>
                      </div>
                    )}
                    {activeMentor.skills && (
                      <div className="mentor-strip-item">
                        <i className="bi bi-lightning"></i>
                        <span>{activeMentor.skills.split(",").slice(0, 3).join(" · ")}</span>
                      </div>
                    )}
                    {activeMentor.topic && (
                      <div className="mentor-strip-item" style={{ color: "#4f46e5", fontWeight: "600" }}>
                        <i className="bi bi-chat-text"></i>
                        <span>Topic: {activeMentor.topic}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------
                    CHAT MESSAGES AREA
                ------------------------------------------------ */}
                <div className="mentor-messages-area">
                  {msgLoading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      <i className="bi bi-arrow-repeat bi-spin" style={{ fontSize: "24px" }}></i>
                      <p style={{ marginTop: "8px" }}>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="mentor-chat-start">
                      <div className="chat-start-icon">
                        <i className="bi bi-chat-square-text"></i>
                      </div>
                      <h3>Start a conversation with {activeMentor.name || "your mentor"}</h3>
                      <p>
                        Ask questions, discuss your skill gap analysis, request career advice, or share your roadmap progress.
                      </p>
                      <div className="chat-starter-chips">
                        {[
                          "Hi! I'd like to discuss my career roadmap.",
                          "Can you review my skill gap analysis?",
                          "I need help preparing for technical interviews.",
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            className="chat-starter-chip"
                            onClick={() => setText(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mentor-messages-list">
                      {grouped.map((item, idx) => {
                        if (item.type === "date") {
                          return (
                            <div className="chat-date-divider" key={`date-${idx}`}>
                              <span>{item.label}</span>
                            </div>
                          );
                        }

                        const isMe = item.sender_id === user?.user_id;

                        return (
                          <div
                            key={item.id}
                            className={`chat-message-row ${isMe ? "me" : "mentor"}`}
                          >
                            {!isMe && (
                              <div className="chat-avatar-small">
                                {activeMentor.name
                                  ? activeMentor.name
                                      .split(" ")
                                      .slice(0, 2)
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                  : "M"}
                              </div>
                            )}
                            <div className={`chat-bubble ${isMe ? "me" : "mentor"} ${item.temp ? "temp" : ""}`}>
                              <p>{item.message}</p>
                              <div className="chat-bubble-meta">
                                <span className="chat-time">
                                  {formatTime(item.created_at)}
                                </span>
                                {isMe && (
                                  <span className="chat-read-status">
                                    <i
                                      className={`bi ${
                                        item.is_read ? "bi-check2-all" : "bi-check2"
                                      }`}
                                    ></i>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------
                    INPUT AREA
                ------------------------------------------------ */}
                {error && (
                  <div className="chat-error-bar">
                    <i className="bi bi-exclamation-circle"></i>
                    <span>{error}</span>
                  </div>
                )}

                <div className="mentor-chat-input-area">
                  <div className="chat-input-row">
                    <textarea
                      ref={textareaRef}
                      className="chat-input"
                      placeholder={`Message ${activeMentor.name || "your mentor"}...`}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <button
                      className="chat-send-btn"
                      onClick={handleSend}
                      disabled={!text.trim() || sending}
                      aria-label="Send message"
                    >
                      {sending ? (
                        <i className="bi bi-hourglass-split"></i>
                      ) : (
                        <i className="bi bi-send-fill"></i>
                      )}
                    </button>
                  </div>
                  <p className="chat-input-hint">
                    Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for a new line
                  </p>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentMentorChat;
