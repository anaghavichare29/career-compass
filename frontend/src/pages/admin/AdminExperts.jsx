import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./AdminExperts.css";

const AdminExperts = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [domainFilter, setDomainFilter] = useState("All Domains");
  const [selectedExpert, setSelectedExpert] = useState(null);

  const domains = [
    "All Domains",
    "Technology",
    "AI / Machine Learning",
    "Data Science",
    "Product Management",
    "Cybersecurity",
    "Cloud Computing",
    "Web Development",
  ];

  const loadExperts = async () => {
    setLoading(true);
    try {
      const res = await api.get("admin-portal/experts/");
      setExperts(res.data);
    } catch (err) {
      console.error("Failed to load experts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperts();
  }, []);

  const filteredExperts = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return experts.filter((expert) => {
      const matchesSearch =
        expert.name.toLowerCase().includes(search) ||
        expert.email.toLowerCase().includes(search) ||
        expert.role.toLowerCase().includes(search) ||
        expert.company.toLowerCase().includes(search) ||
        expert.domain.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All Status" || expert.status === statusFilter;

      const matchesDomain =
        domainFilter === "All Domains" || expert.domain === domainFilter;

      return matchesSearch && matchesStatus && matchesDomain;
    });
  }, [experts, searchTerm, statusFilter, domainFilter]);

  const approvedCount = experts.filter((expert) => expert.status === "Approved").length;
  const pendingCount = experts.filter((expert) => expert.status === "Pending").length;
  const rejectedCount = experts.filter((expert) => expert.status === "Rejected").length;
  const verifiedCount = experts.filter((expert) => expert.verified).length;

  const updateExpertStatus = async (expertId, newStatus) => {
    try {
      await api.post(`admin-portal/experts/${expertId}/verify/`, { decision: newStatus });
      setExperts((current) =>
        current.map((e) =>
          e.id === expertId
            ? { ...e, status: newStatus, verified: newStatus === "Approved" }
            : e
        )
      );
      if (selectedExpert && selectedExpert.id === expertId) {
        setSelectedExpert((prev) => ({
          ...prev,
          status: newStatus,
          verified: newStatus === "Approved",
        }));
      }
      alert(`Mentor verification updated to ${newStatus}. Notification sent.`);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update verification status.");
    }
  };

  const handleToggleAccountStatus = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.post(`admin-portal/users/${userId}/toggle-status/`);
      setExperts((current) =>
        current.map((e) => (e.userId === userId ? { ...e, accountStatus: res.data.status } : e))
      );
      if (selectedExpert && selectedExpert.userId === userId) {
        setSelectedExpert((prev) => ({ ...prev, accountStatus: res.data.status }));
      }
    } catch (err) {
      console.error("Failed to toggle mentor account:", err);
      alert("Failed to update account status.");
    }
  };

  const handleViewExpert = (expert) => {
    setSelectedExpert(expert);
  };

  return (
    <div className="admin-experts-page">
      {/* HEADER */}
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
          <button onClick={() => (window.location.href = "/admin/experts")} style={{ background: "none", border: "none", fontWeight: "700", color: "#2f5bea", cursor: "pointer", fontSize: "14px" }}>
            Experts
          </button>
          <button onClick={() => (window.location.href = "/admin/careers")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Careers & Skills
          </button>
          <button onClick={() => (window.location.href = "/admin/quizzes")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Quizzes & Tests
          </button>
          <button onClick={() => (window.location.href = "/admin/announcements")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Announcements & Moderation
          </button>
          <button onClick={() => (window.location.href = "/admin/reports")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Reports & Analytics
          </button>
        </div>

        <div className="admin-header-right">
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div className="admin-profile-info">
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="admin-experts-content">
        <button className="admin-back-button" type="button" onClick={() => (window.location.href = "/admin/dashboard")}>
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>

        {/* PAGE HEADING */}
        <section className="admin-page-heading">
          <div>
            <span className="admin-section-label">INDUSTRY EXPERT MANAGEMENT</span>
            <h2>Manage Industry Mentors</h2>
            <p>Verify professional accounts, review credentials, approve mentorship requests, and manage mentor status.</p>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="expert-admin-stats">
          <div className="expert-admin-stat">
            <div className="expert-admin-stat-icon purple"><i className="bi bi-person-badge"></i></div>
            <div>
              <span>Total Mentors</span>
              <h3>{experts.length}</h3>
              <small>Registered Experts</small>
            </div>
          </div>

          <div className="expert-admin-stat">
            <div className="expert-admin-stat-icon green"><i className="bi bi-check-circle"></i></div>
            <div>
              <span>Verified & Approved</span>
              <h3>{approvedCount}</h3>
              <small>Actively Guiding</small>
            </div>
          </div>

          <div className="expert-admin-stat">
            <div className="expert-admin-stat-icon orange"><i className="bi bi-clock-history"></i></div>
            <div>
              <span>Pending Verification</span>
              <h3>{pendingCount}</h3>
              <small>Requires Admin Review</small>
            </div>
          </div>

          <div className="expert-admin-stat">
            <div className="expert-admin-stat-icon red"><i className="bi bi-x-circle"></i></div>
            <div>
              <span>Rejected / Need Edit</span>
              <h3>{rejectedCount}</h3>
              <small>Unapproved Requests</small>
            </div>
          </div>
        </section>

        {/* CONTROLS */}
        <section className="admin-controls">
          <div className="admin-search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search by mentor name, company, role, or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>

            <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
              {domains.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </section>

        {/* TABLE */}
        <section className="admin-table-card">
          <div className="admin-table-header">
            <h3>Industry Experts ({filteredExperts.length})</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <i className="bi bi-arrow-repeat" style={{ fontSize: "24px" }}></i>
              <p>Loading mentors...</p>
            </div>
          ) : filteredExperts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <p>No mentors found matching your filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Expert</th>
                    <th>Designation & Company</th>
                    <th>Industry Domain</th>
                    <th>Experience</th>
                    <th>Verification</th>
                    <th>Account Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExperts.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-table-avatar">{exp.initials || exp.name.charAt(0)}</div>
                          <div>
                            <strong>{exp.name}</strong>
                            <small>{exp.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{exp.role}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{exp.company}</div>
                      </td>
                      <td><span style={{ fontWeight: "600", color: "#2f5bea" }}>{exp.domain}</span></td>
                      <td>{exp.experience}</td>
                      <td>
                        <span className={`admin-status-pill ${exp.status === "Approved" ? "approved" : exp.status === "Rejected" ? "rejected" : "pending"}`}>
                          {exp.status}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-pill ${exp.accountStatus === "Active" ? "active" : "inactive"}`}>
                          {exp.accountStatus || "Active"}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>{exp.joined}</td>
                      <td>
                        <div className="table-actions">
                          <button className="table-icon-btn view" title="View Details" onClick={() => handleViewExpert(exp)}>
                            <i className="bi bi-eye"></i>
                          </button>
                          {exp.status !== "Approved" && (
                            <button className="table-icon-btn approve" title="Approve Mentor" onClick={() => updateExpertStatus(exp.id, "Approved")}>
                              <i className="bi bi-check-lg"></i>
                            </button>
                          )}
                          {exp.status !== "Rejected" && (
                            <button className="table-icon-btn reject" title="Reject Mentor" onClick={() => updateExpertStatus(exp.id, "Rejected")}>
                              <i className="bi bi-x-lg"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* DETAIL MODAL */}
      {selectedExpert && (
        <div className="expert-modal-overlay">
          <div className="expert-modal">
            <div className="expert-modal-header">
              <div className="modal-profile">
                <div className="modal-avatar">{selectedExpert.initials || selectedExpert.name.charAt(0)}</div>
                <div>
                  <h3>{selectedExpert.name}</h3>
                  <span>{selectedExpert.email} • ID #{selectedExpert.id}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedExpert(null)}>✕</button>
            </div>

            <div className="expert-modal-grid">
              <div>
                <span>Role / Designation</span>
                <strong>{selectedExpert.role}</strong>
              </div>
              <div>
                <span>Company</span>
                <strong>{selectedExpert.company}</strong>
              </div>
              <div>
                <span>Domain</span>
                <strong>{selectedExpert.domain}</strong>
              </div>
              <div>
                <span>Experience</span>
                <strong>{selectedExpert.experience}</strong>
              </div>
              <div>
                <span>Verification Status</span>
                <strong>{selectedExpert.status}</strong>
              </div>
              <div>
                <span>Account Status</span>
                <strong>{selectedExpert.accountStatus || "Active"}</strong>
              </div>
            </div>

            <div className="expert-modal-actions" style={{ marginTop: "24px" }}>
              <button className="expert-modal-secondary" type="button" onClick={() => setSelectedExpert(null)}>
                Close
              </button>
              <button
                className="expert-modal-danger"
                type="button"
                onClick={() => updateExpertStatus(selectedExpert.id, selectedExpert.status === "Approved" ? "Rejected" : "Approved")}
              >
                {selectedExpert.status === "Approved" ? "Revoke / Reject" : "Approve & Verify"}
              </button>
              <button
                className="expert-modal-primary"
                type="button"
                onClick={() => handleToggleAccountStatus(selectedExpert.userId)}
              >
                {selectedExpert.accountStatus === "Active" ? "Deactivate Account" : "Activate Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExperts;