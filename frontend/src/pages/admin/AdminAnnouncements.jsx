import React, { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";
import { Alert, Badge, Card, EmptyState, Field, PageHeader, toneForStatus } from "../../components/ui/ui";
import "./Admin.css";

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

  const pendingComplaints = complaints.filter((c) => String(c.status).toLowerCase() === "pending");

  return (
    <AdminLayout activePage="announcements" pageTitle="Announcements & Moderation">
      <main className="adm-page">
      <PageHeader
        eyebrow="Community"
        title="Announcements, Moderation & Feedback"
        subtitle="Broadcast notices to users, review reported content and track user satisfaction."
      />

      <div className="cc-grid cc-grid--2 adm-section">
        <Card title="Broadcast an announcement" subtitle="Delivered to the notification feed of the selected audience.">
          {broadcastSuccess && <Alert tone="success">{broadcastSuccess}</Alert>}
          <form onSubmit={handleCreateAnnouncement} className="cc-stack adm-form" style={{ gap: 16, marginTop: broadcastSuccess ? 16 : 0 }}>
            <Field label="Title *">
              <input className="cc-input" required placeholder="e.g., Scheduled maintenance / New career paths added" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Target audience">
              <select className="cc-select" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                <option value="ALL">All users (students & mentors)</option>
                <option value="STUDENT">Students only</option>
                <option value="PROFESSIONAL">Industry mentors only</option>
              </select>
            </Field>
            <Field label="Message *">
              <textarea className="cc-textarea" rows={4} required placeholder="Type the message to send to users..." value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <button type="submit" className="cc-btn cc-btn--primary cc-btn--lg">
              <i className="bi bi-broadcast"></i> Broadcast notification
            </button>
          </form>
        </Card>

        <Card title={`Recent announcements (${announcements.length})`} subtitle="Newest first.">
          {announcements.length === 0 ? (
            <EmptyState icon="bi-megaphone" title="Nothing sent yet">Announcements you broadcast will appear here.</EmptyState>
          ) : (
            <div className="adm-feed">
              {announcements.map((a) => (
                <div key={a.id} className="adm-feed__item">
                  <div className="cc-row cc-row--between">
                    <strong>{a.title}</strong>
                    <Badge tone="blue">{a.targetRole}</Badge>
                  </div>
                  <p>{a.message}</p>
                  <small>Sent on {a.date}</small>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        flush
        className="adm-section"
        title={`Content moderation & complaints (${complaints.length})`}
        subtitle={pendingComplaints.length ? `${pendingComplaints.length} awaiting review` : "All reports are handled"}
      >
        {complaints.length === 0 ? (
          <EmptyState icon="bi-shield-check" title="No reports flagged">There are no complaints to review right now.</EmptyState>
        ) : (
          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Reporter</th>
                  <th>Reported</th>
                  <th>Reason</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td><strong className="adm-strong">{c.reporterName}</strong></td>
                    <td>{c.reportedName} <small className="cc-muted">({c.contentType})</small></td>
                    <td><strong className="adm-bad">{c.reason}</strong></td>
                    <td className="adm-wrap">{c.description || "N/A"}</td>
                    <td><Badge tone={toneForStatus(c.status)} dot>{c.status}</Badge></td>
                    <td className="cc-muted cc-text-sm">{c.date}</td>
                    <td>
                      {String(c.status).toLowerCase() === "pending" && (
                        <div className="cc-actions">
                          <button className="cc-btn cc-btn--success-soft cc-btn--sm" onClick={() => handleResolveComplaint(c.id, "Resolved")}>Resolve</button>
                          <button className="cc-btn cc-btn--secondary cc-btn--sm" onClick={() => handleResolveComplaint(c.id, "Dismissed")}>Dismiss</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card flush title={`User feedback & ratings (${feedbackList.length})`} className="adm-section">
        {feedbackList.length === 0 ? (
          <EmptyState icon="bi-chat-heart" title="No feedback yet">Ratings and comments from users will appear here.</EmptyState>
        ) : (
          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Feedback</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((f) => (
                  <tr key={f.id}>
                    <td><strong className="adm-strong">{f.userName}</strong></td>
                    <td><Badge tone="purple">{f.role}</Badge></td>
                    <td>{f.category}</td>
                    <td>
                      <span className="adm-stars" title={`${f.rating}/5`}>
                        {"★".repeat(f.rating)}<span>{"★".repeat(Math.max(0, 5 - f.rating))}</span>
                      </span>
                    </td>
                    <td className="adm-wrap">{f.feedback}</td>
                    <td className="cc-muted cc-text-sm">{f.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </main>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
