import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Alert, Avatar, Badge, Card, EmptyState, Field, Loading, Modal, PageHeader, Progress, SearchInput, StatCard, toneForStatus,
} from "../../components/ui/ui";
import "./Admin.css";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [domainFilter, setDomainFilter] = useState("All Domains");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  // Add Student Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const domains = [
    "All Domains",
    "Technology",
    "Data Science",
    "Software Development",
    "Product Management",
    "Cybersecurity",
    "Cloud Computing",
    "Web Development",
  ];

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("admin-portal/students/");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.career.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All Status" || student.status === statusFilter;

      const matchesDomain =
        domainFilter === "All Domains" || student.domain === domainFilter;

      return matchesSearch && matchesStatus && matchesDomain;
    });
  }, [students, searchTerm, statusFilter, domainFilter]);

  const activeStudents = students.filter(
    (student) => student.status === "Active",
  ).length;
  const completedAssessments = students.filter(
    (student) => student.assessment === "Completed",
  ).length;
  const averageProgress =
    students.length > 0
      ? Math.round(
          students.reduce((total, s) => total + s.progress, 0) /
            students.length,
        )
      : 0;

  const handleToggleStatus = async (student) => {
    const userId =
      typeof student === "object"
        ? (student.userId ?? student.user_id ?? student.id)
        : student;
    if (!userId) {
      alert("Unable to update this account because its user ID is missing.");
      return;
    }

    try {
      const res = await api.post(`admin-portal/users/${userId}/toggle-status/`);
      const rawStatus = res.data?.status ?? res.data?.account_status;
      const isActive =
        typeof res.data?.is_active === "boolean" ? res.data.is_active : null;
      const nextStatus = rawStatus
        ? String(rawStatus).toLowerCase() === "active"
          ? "Active"
          : "Inactive"
        : isActive !== null
          ? isActive
            ? "Active"
            : "Inactive"
          : (typeof student === "object" ? student.status : "Active") ===
              "Active"
            ? "Inactive"
            : "Active";

      setStudents((current) =>
        current.map((s) =>
          String(s.userId ?? s.user_id ?? s.id) === String(userId) ||
          (typeof student === "object" && s.id === student.id)
            ? { ...s, status: nextStatus }
            : s,
        ),
      );
      setSelectedStudent((prev) =>
        prev &&
        String(prev.userId ?? prev.user_id ?? prev.id) === String(userId)
          ? { ...prev, status: nextStatus }
          : prev,
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to update student status. Please try again.",
      );
    }
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setStudentDetails(null);
    try {
      const res = await api.get(`admin-portal/students/${student.id}/`);
      setStudentDetails(res.data);
    } catch (err) {
      console.warn("Could not load deep details:", err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      await api.post("auth/register/", {
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: "STUDENT",
      });
      alert("Student account created successfully!");
      setShowAddModal(false);
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPassword("");
      loadStudents();
    } catch (err) {
      console.error("Failed to register student:", err);
      setAddError(
        err.response?.data?.email?.[0] || "Failed to create student account.",
      );
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <AdminLayout activePage="students" pageTitle="Students">
      <main className="adm-page">
      <PageHeader
        eyebrow="People"
        title="Student Management"
        subtitle="View registered students, track their progress and manage account access."
        actions={
          <button className="cc-btn cc-btn--primary" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-person-plus"></i> Add Student
          </button>
        }
      />

      <div className="cc-grid cc-grid--4 adm-section">
        <StatCard icon="bi-people" tone="blue" label="Total Students" value={students.length} hint="Registered accounts" />
        <StatCard icon="bi-person-check" tone="green" label="Active Students" value={activeStudents} hint="Currently active" />
        <StatCard icon="bi-clipboard-check" tone="orange" label="Assessments Done" value={completedAssessments} hint="Completed assessments" />
        <StatCard icon="bi-graph-up" tone="purple" label="Avg. Progress" value={`${averageProgress}%`} hint="Across all students" />
      </div>

      <Card
        flush
        title={`Registered Students (${filteredStudents.length})`}
        action={
          <div className="cc-toolbar">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search name, email or career..." />
            <select className="cc-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
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
          <Loading label="Loading registered students..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState icon="bi-people" title="No students found">
            No students match your search or filters.
          </EmptyState>
        ) : (
          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>College / Course</th>
                  <th>Target Career</th>
                  <th>Assessment</th>
                  <th style={{ minWidth: 150 }}>Progress</th>
                  <th>Readiness</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <div className="cc-user-cell">
                        <Avatar name={st.name} />
                        <div>
                          <strong>{st.name}</strong>
                          <small>{st.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{st.college}</div>
                      <small className="cc-muted">{st.course} • {st.year}</small>
                    </td>
                    <td><span className="adm-career">{st.career}</span></td>
                    <td>
                      <Badge tone={st.assessment === "Completed" ? "green" : "orange"} dot>{st.assessment}</Badge>
                    </td>
                    <td>
                      <div className="adm-progress-cell">
                        <Progress value={st.progress} />
                        <span>{st.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <strong className={st.readiness >= 70 ? "adm-good" : "adm-warn"}>{st.readiness}%</strong>
                    </td>
                    <td><Badge tone={toneForStatus(st.status)} dot>{st.status}</Badge></td>
                    <td>
                      <div className="cc-actions">
                        <button className="cc-btn cc-btn--secondary cc-btn--icon" title="View details" onClick={() => handleViewStudent(st)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className={`cc-btn cc-btn--icon ${st.status === "Active" ? "cc-btn--danger-soft" : "cc-btn--success-soft"}`}
                          title={st.status === "Active" ? "Deactivate account" : "Activate account"}
                          onClick={() => handleToggleStatus(st)}
                        >
                          <i className={`bi ${st.status === "Active" ? "bi-person-x" : "bi-person-check"}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedStudent && (
        <Modal
          size="lg"
          title={selectedStudent.name}
          subtitle={`${selectedStudent.email} • ID #${selectedStudent.id}`}
          onClose={() => setSelectedStudent(null)}
          footer={
            <>
              <button className="cc-btn cc-btn--secondary" onClick={() => setSelectedStudent(null)}>Close</button>
              <button
                className={`cc-btn ${selectedStudent.status === "Active" ? "cc-btn--danger" : "cc-btn--success"}`}
                onClick={() => handleToggleStatus(selectedStudent)}
              >
                {selectedStudent.status === "Active" ? "Deactivate Account" : "Activate Account"}
              </button>
            </>
          }
        >
          <div className="adm-detail-grid">
            <div><span>College / University</span><strong>{selectedStudent.college}</strong></div>
            <div><span>Degree & Year</span><strong>{selectedStudent.course} ({selectedStudent.year})</strong></div>
            <div><span>Academic Score / GPA</span><strong>{selectedStudent.academicScore || "8.5"}</strong></div>
            <div><span>Career Target</span><strong className="adm-career">{selectedStudent.career}</strong></div>
            <div><span>Assessment Status</span><strong>{selectedStudent.assessment}</strong></div>
            <div><span>Career Readiness</span><strong className="adm-good">{selectedStudent.readiness}%</strong></div>
          </div>

          {studentDetails && (
            <div className="adm-tasklist">
              <h4>Milestones & Tasks ({studentDetails.tasks?.length || 0})</h4>
              {studentDetails.tasks?.length ? (
                studentDetails.tasks.map((t) => (
                  <div key={t.id} className="adm-taskrow">
                    <span>{t.title}</span>
                    <Badge tone={toneForStatus(t.status)}>{t.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="cc-muted cc-text-sm">No tasks assigned yet.</p>
              )}
            </div>
          )}
        </Modal>
      )}

      {showAddModal && (
        <Modal
          title="Create Student Account"
          subtitle="The student can sign in immediately with these credentials."
          onClose={() => setShowAddModal(false)}
          footer={
            <>
              <button type="button" className="cc-btn cc-btn--secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" form="add-student-form" className="cc-btn cc-btn--primary" disabled={addLoading}>
                {addLoading ? "Creating..." : "Create Student"}
              </button>
            </>
          }
        >
          {addError && <Alert tone="error">{addError}</Alert>}
          <form id="add-student-form" onSubmit={handleAddStudent} className="cc-form-grid adm-form">
            <Field label="First name *">
              <input className="cc-input" required value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
            </Field>
            <Field label="Last name">
              <input className="cc-input" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
            </Field>
            <Field label="Email *" span2>
              <input className="cc-input" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </Field>
            <Field label="Password *" span2>
              <input className="cc-input" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
          </form>
        </Modal>
      )}
      </main>
    </AdminLayout>
  );
};

export default AdminStudents;
