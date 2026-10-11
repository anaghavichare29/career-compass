import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Avatar, Badge, Card, EmptyState, Loading, Modal, PageHeader, SearchInput, StatCard, toneForStatus,
} from "../../components/ui/ui";
import "./Admin.css";

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

  const approvedCount = experts.filter(
    (expert) => expert.status === "Approved",
  ).length;
  const pendingCount = experts.filter(
    (expert) => expert.status === "Pending",
  ).length;
  const rejectedCount = experts.filter(
    (expert) => expert.status === "Rejected",
  ).length;
  const verifiedCount = experts.filter((expert) => expert.verified).length;

  const updateExpertStatus = async (expertId, newStatus) => {
    try {
      await api.post(`admin-portal/experts/${expertId}/verify/`, {
        decision: newStatus,
      });
      setExperts((current) =>
        current.map((e) =>
          e.id === expertId
            ? { ...e, status: newStatus, verified: newStatus === "Approved" }
            : e,
        ),
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
      const rawStatus = res.data?.status ?? res.data?.account_status;
      const isActive =
        typeof res.data?.is_active === "boolean" ? res.data.is_active : null;
      const current = experts.find(
        (e) => String(e.userId ?? e.user_id) === String(userId),
      );
      const nextStatus = rawStatus
        ? String(rawStatus).toLowerCase() === "active"
          ? "Active"
          : "Inactive"
        : isActive !== null
          ? isActive
            ? "Active"
            : "Inactive"
          : (current?.accountStatus || "Active") === "Active"
            ? "Inactive"
            : "Active";
      setExperts((items) =>
        items.map((e) =>
          String(e.userId ?? e.user_id) === String(userId)
            ? { ...e, accountStatus: nextStatus }
            : e,
        ),
      );
      setSelectedExpert((prev) =>
        prev && String(prev.userId ?? prev.user_id) === String(userId)
          ? { ...prev, accountStatus: nextStatus }
          : prev,
      );
    } catch (err) {
      console.error("Failed to toggle mentor account:", err);
      alert("Failed to update account status.");
    }
  };

  const handleViewExpert = (expert) => {
    setSelectedExpert(expert);
  };

  return (
    <AdminLayout activePage="experts" pageTitle="Industry Experts">
      <main className="adm-page">
      <PageHeader
        eyebrow="People"
        title="Manage Industry Mentors"
        subtitle="Verify professional accounts, review credentials and control mentor access to students."
      />

      <div className="cc-grid cc-grid--4 adm-section">
        <StatCard icon="bi-person-badge" tone="purple" label="Total Mentors" value={experts.length} hint="Registered experts" />
        <StatCard icon="bi-patch-check" tone="green" label="Verified & Approved" value={approvedCount} hint="Actively guiding students" />
        <StatCard icon="bi-clock-history" tone="orange" label="Pending Verification" value={pendingCount} hint="Needs admin review" />
        <StatCard icon="bi-x-circle" tone="red" label="Rejected" value={rejectedCount} hint="Unapproved requests" />
      </div>

      <Card
        flush
        title={`Industry Experts (${filteredExperts.length})`}
        action={
          <div className="cc-toolbar">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search name, company, role or domain..." />
            <select className="cc-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
            <select className="cc-select" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
              {domains.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        }
      >
        {loading ? (
          <Loading label="Loading mentors..." />
        ) : filteredExperts.length === 0 ? (
          <EmptyState icon="bi-person-badge" title="No mentors found">
            No mentors match your search or filters.
          </EmptyState>
        ) : (
          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Expert</th>
                  <th>Role & Company</th>
                  <th>Domain</th>
                  <th>Experience</th>
                  <th>Verification</th>
                  <th>Account</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredExperts.map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      <div className="cc-user-cell">
                        <Avatar name={exp.name} />
                        <div>
                          <strong>{exp.name}</strong>
                          <small>{exp.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong className="adm-strong">{exp.role}</strong>
                      <small className="cc-muted adm-block">{exp.company}</small>
                    </td>
                    <td><span className="adm-career">{exp.domain}</span></td>
                    <td>{exp.experience}</td>
                    <td><Badge tone={toneForStatus(exp.status)} dot>{exp.status}</Badge></td>
                    <td><Badge tone={toneForStatus(exp.accountStatus || "Active")} dot>{exp.accountStatus || "Active"}</Badge></td>
                    <td className="cc-muted cc-text-sm">{exp.joined}</td>
                    <td>
                      <div className="cc-actions">
                        <button className="cc-btn cc-btn--secondary cc-btn--icon" title="View details" onClick={() => handleViewExpert(exp)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        {exp.status !== "Approved" && (
                          <button className="cc-btn cc-btn--success-soft cc-btn--icon" title="Approve mentor" onClick={() => updateExpertStatus(exp.id, "Approved")}>
                            <i className="bi bi-check-lg"></i>
                          </button>
                        )}
                        {exp.status !== "Rejected" && (
                          <button className="cc-btn cc-btn--danger-soft cc-btn--icon" title="Reject mentor" onClick={() => updateExpertStatus(exp.id, "Rejected")}>
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
      </Card>

      {selectedExpert && (
        <Modal
          size="lg"
          title={selectedExpert.name}
          subtitle={`${selectedExpert.email} • ID #${selectedExpert.id}`}
          onClose={() => setSelectedExpert(null)}
          footer={
            <>
              <button className="cc-btn cc-btn--secondary" onClick={() => setSelectedExpert(null)}>Close</button>
              <button
                className={`cc-btn ${selectedExpert.status === "Approved" ? "cc-btn--danger-soft" : "cc-btn--success"}`}
                onClick={() => updateExpertStatus(selectedExpert.id, selectedExpert.status === "Approved" ? "Rejected" : "Approved")}
              >
                {selectedExpert.status === "Approved" ? "Revoke / Reject" : "Approve & Verify"}
              </button>
              <button className="cc-btn cc-btn--primary" onClick={() => handleToggleAccountStatus(selectedExpert.userId)}>
                {selectedExpert.accountStatus === "Active" ? "Deactivate Account" : "Activate Account"}
              </button>
            </>
          }
        >
          <div className="adm-detail-grid">
            <div><span>Role / Designation</span><strong>{selectedExpert.role}</strong></div>
            <div><span>Company</span><strong>{selectedExpert.company}</strong></div>
            <div><span>Domain</span><strong>{selectedExpert.domain}</strong></div>
            <div><span>Experience</span><strong>{selectedExpert.experience}</strong></div>
            <div><span>Verification</span><Badge tone={toneForStatus(selectedExpert.status)} dot>{selectedExpert.status}</Badge></div>
            <div><span>Account</span><Badge tone={toneForStatus(selectedExpert.accountStatus || "Active")} dot>{selectedExpert.accountStatus || "Active"}</Badge></div>
          </div>
        </Modal>
      )}
      </main>
    </AdminLayout>
  );
};

export default AdminExperts;
