import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminStudents.css";

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New announcement form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, cRes, fRes] = await Promise.all([
        api.get("admin-portal/announcements/"),
        api.get("admin-portal/complaints/"),
        api.get("admin-portal/feedback/"),
      ]);
      setAnnouncements(aRes.data);
      setComplaints(cRes.data);
      setFeedbackList(fRes.data);
    } catch (err) {
      console.error("Failed to load admin moderation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      await api.post("admin-portal/announcements/", {
        admin_id: user?.user_id || 1,
        title: title.trim(),
        message: message.trim(),
        target_role: targetRole,
      });
      setBroadcastSuccess(`Announcement broadcasted to ${targetRole} users!`);
      setTitle("");
      setMessage("");
      setTimeout(() => setBroadcastSuccess(""), 3000);
      loadData();
    } catch (err) {
      console.error("Failed to broadcast announcement:", err);
      alert("Failed to send announcement.");
    }
  };

  const handleResolveComplaint = async (id, action) => {
    try {
      await api.post(`admin-portal/complaints/${id}/resolve/`, {
        action: action,
        note: `Handled by Administrator ${user?.first_name || ""}`,
      });
      alert(`Report ${action}!`);
      loadData();
    } catch (err) {
      console.error("Failed to resolve complaint:", err);
    }
  };

  return (
    <div className="admin-students-page">
      <header className="admin-header">
        <div className="admin-brand">
          <h1 onClick={() => (window.location.href = "/admin/dashboard")} style={{ cursor: "pointer" }}>
            CareerCompass <span style={{ fontSize: "14px", fontWeight: "600", color: "#2f5bea", background: "#eff6ff", padding: "3px 8px", borderRadius: "6px" }}>ADMIN</span>
          </h1>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button onClick={() => (window.location.href = "/admin/dashboard")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Dashboard
          </button>
          <button onClick={() => (window.location.href = "/admin/students")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Students
          </button>
          <button onClick={() => (window.location.href = "/admin/experts")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Experts
          </button>
          <button onClick={() => (window.location.href = "/admin/careers")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Careers & Skills
          </button>
          <button onClick={() => (window.location.href = "/admin/quizzes")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Quizzes & Tests
          </button>
          <button onClick={() => (window.location.href = "/admin/announcements")} style={{ background: "none", border: "none", fontWeight: "700", color: "#2f5bea", cursor: "pointer", fontSize: "14px" }}>
            Announcements & Moderation
          </button>
          <button onClick={() => (window.location.href = "/admin/reports")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Reports & Analytics
          </button>
        </div>
      </header>

      <main className="admin-students-content">
        <button className="admin-back-button" onClick={() => (window.location.href = "/admin/dashboard")}>
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>

        <section className="admin-page-heading">
          <div>
            <span className="admin-section-label">COMMUNICATION & PLATFORM INTEGRITY</span>
            <h2>Announcements, Moderation & User Feedback</h2>
            <p>Broadcast alerts to users, review reported content or inappropriate behavior, and track user satisfaction.</p>
          </div>
        </section>

        {/* Create Announcement & Recent Broadcasts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          {/* Create Form */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "18px" }}>Broadcast Platform Announcement</h3>

            {broadcastSuccess && (
              <div style={{ padding: "12px", background: "#dcfce7", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontWeight: "600" }}>
                {broadcastSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Scheduled Maintenance / New AI Career Paths Added"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  <option value="ALL">All Users (Students & Mentors)</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="PROFESSIONAL">Industry Mentors Only</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Announcement Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the message to send to user notification feeds..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <button type="submit" className="admin-primary-button" style={{ padding: "12px" }}>
                <i className="bi bi-broadcast"></i> Broadcast Notification
              </button>
            </form>
          </div>

          {/* Past Announcements */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "18px" }}>Recent Announcements ({announcements.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
              {announcements.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>No announcements sent yet.</p>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} style={{ padding: "14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>{a.title}</strong>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", background: "#e0e7ff", color: "#4338ca" }}>
                        {a.targetRole}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#475569", margin: "6px 0" }}>{a.message}</p>
                    <small style={{ color: "#94a3b8", fontSize: "11px" }}>Sent on {a.date}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Complaints & Reported Content */}
        <section className="admin-table-card" style={{ marginBottom: "32px" }}>
          <div className="admin-table-header">
            <h3>Content Moderation & User Complaints ({complaints.length})</h3>
          </div>

          {complaints.length === 0 ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>No complaints or reports flagged.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reporter</th>
                    <th>Reported Entity</th>
                    <th>Reason</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.reporterName}</strong></td>
                      <td>{c.reportedName} ({c.contentType})</td>
                      <td><span style={{ color: "#b91c1c", fontWeight: "600" }}>{c.reason}</span></td>
                      <td style={{ maxWidth: "200px" }}>{c.description || "N/A"}</td>
                      <td>
                        <span className={`admin-status-pill ${c.status === "Resolved" ? "success" : "pending"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>{c.date}</td>
                      <td>
                        {c.status === "pending" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => handleResolveComplaint(c.id, "Resolved")}
                              style={{ padding: "4px 8px", background: "#10b981", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleResolveComplaint(c.id, "Dismissed")}
                              style={{ padding: "4px 8px", background: "#94a3b8", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Student & Mentor Feedback */}
        <section className="admin-table-card">
          <div className="admin-table-header">
            <h3>User Feedback & Ratings ({feedbackList.length})</h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Feedback Text</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((f) => (
                  <tr key={f.id}>
                    <td><strong>{f.userName}</strong></td>
                    <td><span style={{ fontSize: "12px", fontWeight: "600", color: "#6366f1" }}>{f.role}</span></td>
                    <td>{f.category}</td>
                    <td>
                      <span style={{ color: "#f59e0b", fontWeight: "700" }}>
                        {"★".repeat(f.rating)} ({f.rating}/5)
                      </span>
                    </td>
                    <td>{f.feedback}</td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>{f.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminAnnouncements;
