import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./AdminStudents.css";

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

  const activeStudents = students.filter((student) => student.status === "Active").length;
  const completedAssessments = students.filter((student) => student.assessment === "Completed").length;
  const averageProgress =
    students.length > 0
      ? Math.round(students.reduce((total, s) => total + s.progress, 0) / students.length)
      : 0;

  const handleToggleStatus = async (studentId) => {
    try {
      const res = await api.post(`admin-portal/users/${studentId}/toggle-status/`);
      setStudents((current) =>
        current.map((s) => (s.id === studentId ? { ...s, status: res.data.status } : s))
      );
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent((prev) => ({ ...prev, status: res.data.status }));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert("Failed to update student status.");
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
      setAddError(err.response?.data?.email?.[0] || "Failed to create student account.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="admin-students-page">
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
          <button onClick={() => (window.location.href = "/admin/students")} style={{ background: "none", border: "none", fontWeight: "700", color: "#2f5bea", cursor: "pointer", fontSize: "14px" }}>
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
      <main className="admin-students-content">
        <button className="admin-back-button" type="button" onClick={() => (window.location.href = "/admin/dashboard")}>
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>

        {/* PAGE HEADING */}
        <section className="admin-page-heading">
          <div>
            <span className="admin-section-label">STUDENT MANAGEMENT</span>
            <h2>Manage Students</h2>
            <p>View registered students, monitor learning progress, toggle account status, and oversee career readiness.</p>
          </div>

          <button className="admin-primary-button" type="button" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-person-plus"></i> Add Student
          </button>
        </section>

        {/* STATISTICS */}
        <section className="student-admin-stats">
          <div className="student-admin-stat">
            <div className="student-admin-stat-icon blue"><i className="bi bi-people"></i></div>
            <div>
              <span>Total Students</span>
              <h3>{students.length}</h3>
              <small>Registered Accounts</small>
            </div>
          </div>

          <div className="student-admin-stat">
            <div className="student-admin-stat-icon green"><i className="bi bi-person-check"></i></div>
            <div>
              <span>Active Students</span>
              <h3>{activeStudents}</h3>
              <small>Currently Active</small>
            </div>
          </div>

          <div className="student-admin-stat">
            <div className="student-admin-stat-icon orange"><i className="bi bi-clipboard-check"></i></div>
            <div>
              <span>Assessments Done</span>
              <h3>{completedAssessments}</h3>
              <small>Completed Assessments</small>
            </div>
          </div>

          <div className="student-admin-stat">
            <div className="student-admin-stat-icon purple"><i className="bi bi-graph-up"></i></div>
            <div>
              <span>Avg Progress</span>
              <h3>{averageProgress}%</h3>
              <small>Platform Learning Curve</small>
            </div>
          </div>
        </section>

        {/* CONTROLS */}
        <section className="admin-controls">
          <div className="admin-search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search by student name, email, or career goal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
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
            <h3>Registered Students ({filteredStudents.length})</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <i className="bi bi-arrow-repeat" style={{ fontSize: "24px" }}></i>
              <p>Loading registered students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <p>No students found matching your filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>College / Course</th>
                    <th>Target Career</th>
                    <th>Assessment</th>
                    <th>Progress</th>
                    <th>Readiness</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => (
                    <tr key={st.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-table-avatar">{st.name.charAt(0)}</div>
                          <div>
                            <strong>{st.name}</strong>
                            <small>{st.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "13px" }}>{st.college}</div>
                        <small style={{ color: "#64748b" }}>{st.course} • {st.year}</small>
                      </td>
                      <td><span style={{ fontWeight: "600", color: "#2f5bea" }}>{st.career}</span></td>
                      <td>
                        <span className={`admin-status-pill ${st.assessment === "Completed" ? "success" : "pending"}`}>
                          {st.assessment}
                        </span>
                      </td>
                      <td>
                        <div className="table-progress">
                          <span>{st.progress}%</span>
                          <div className="progress-track">
                            <div style={{ width: `${st.progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: "700", color: st.readiness >= 70 ? "#10b981" : "#f59e0b" }}>
                          {st.readiness}%
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-pill ${st.status === "Active" ? "active" : "inactive"}`}>
                          {st.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="table-icon-btn view" title="View Details" onClick={() => handleViewStudent(st)}>
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className={`table-icon-btn ${st.status === "Active" ? "deactivate" : "activate"}`}
                            title={st.status === "Active" ? "Deactivate Account" : "Activate Account"}
                            onClick={() => handleToggleStatus(st.id)}
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
        </section>
      </main>

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="student-modal-overlay">
          <div className="student-modal" style={{ maxWidth: "680px" }}>
            <div className="student-modal-header">
              <div className="modal-profile">
                <div className="modal-avatar">{selectedStudent.name.charAt(0)}</div>
                <div>
                  <h3>{selectedStudent.name}</h3>
                  <span>{selectedStudent.email} • ID #{selectedStudent.id}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedStudent(null)}>✕</button>
            </div>

            <div className="student-modal-grid">
              <div>
                <span>College / University</span>
                <strong>{selectedStudent.college}</strong>
              </div>
              <div>
                <span>Degree & Year</span>
                <strong>{selectedStudent.course} ({selectedStudent.year})</strong>
              </div>
              <div>
                <span>Academic Score / GPA</span>
                <strong>{selectedStudent.academicScore || "8.5"}</strong>
              </div>
              <div>
                <span>Career Target</span>
                <strong style={{ color: "#2f5bea" }}>{selectedStudent.career}</strong>
              </div>
              <div>
                <span>Assessment Status</span>
                <strong>{selectedStudent.assessment}</strong>
              </div>
              <div>
                <span>Career Readiness</span>
                <strong style={{ color: "#10b981" }}>{selectedStudent.readiness}%</strong>
              </div>
            </div>

            {studentDetails && (
              <div style={{ marginTop: "16px", padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <strong style={{ display: "block", color: "#1e293b", marginBottom: "8px", fontSize: "14px" }}>
                  Milestones & Tasks Breakdown ({studentDetails.tasks?.length} Tasks)
                </strong>
                <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {studentDetails.tasks?.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", background: "#ffffff", padding: "6px 10px", borderRadius: "6px" }}>
                      <span>{t.title}</span>
                      <strong style={{ color: t.status === "Completed" ? "#10b981" : "#f59e0b" }}>{t.status}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="student-modal-actions" style={{ marginTop: "20px" }}>
              <button className="student-modal-secondary" type="button" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
              <button
                className={`student-modal-danger ${selectedStudent.status === "Active" ? "" : "activate"}`}
                type="button"
                onClick={() => handleToggleStatus(selectedStudent.id)}
              >
                {selectedStudent.status === "Active" ? "Deactivate Account" : "Activate Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="student-modal-overlay">
          <div className="student-modal" style={{ maxWidth: "480px" }}>
            <div className="student-modal-header">
              <h3>Create Student Account</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            {addError && (
              <div style={{ padding: "10px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" }}>
                {addError}
              </div>
            )}

            <form onSubmit={handleAddStudent} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>First Name *</label>
                <input
                  type="text"
                  required
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Last Name</label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="student-modal-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={addLoading} className="admin-primary-button">
                  {addLoading ? "Creating..." : "Create Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;