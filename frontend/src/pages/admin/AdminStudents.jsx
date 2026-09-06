import React, { useMemo, useState } from "react";
import "./AdminStudents.css";

const studentsData = [
  {
    id: 1,
    name: "Ankita Shanbhag",
    email: "ankita@example.com",
    career: "Data Analyst",
    domain: "Data Science",
    progress: 82,
    readiness: 76,
    assessment: "Completed",
    status: "Active",
    joined: "12 Aug 2026",
  },
  {
    id: 2,
    name: "Riya Patel",
    email: "riya@example.com",
    career: "Software Engineer",
    domain: "Software Development",
    progress: 74,
    readiness: 69,
    assessment: "Completed",
    status: "Active",
    joined: "10 Aug 2026",
  },
  {
    id: 3,
    name: "Aditya Mehta",
    email: "aditya@example.com",
    career: "Data Scientist",
    domain: "Data Science",
    progress: 68,
    readiness: 61,
    assessment: "Completed",
    status: "Active",
    joined: "08 Aug 2026",
  },
  {
    id: 4,
    name: "Sneha Kulkarni",
    email: "sneha@example.com",
    career: "Product Manager",
    domain: "Product Management",
    progress: 91,
    readiness: 88,
    assessment: "Completed",
    status: "Active",
    joined: "05 Aug 2026",
  },
  {
    id: 5,
    name: "Karan Joshi",
    email: "karan@example.com",
    career: "Cybersecurity Engineer",
    domain: "Cybersecurity",
    progress: 45,
    readiness: 42,
    assessment: "Pending",
    status: "Active",
    joined: "02 Aug 2026",
  },
  {
    id: 6,
    name: "Meera Shah",
    email: "meera@example.com",
    career: "Cloud Engineer",
    domain: "Cloud Computing",
    progress: 57,
    readiness: 54,
    assessment: "Completed",
    status: "Inactive",
    joined: "28 Jul 2026",
  },
  {
    id: 7,
    name: "Vivek Desai",
    email: "vivek@example.com",
    career: "Full Stack Developer",
    domain: "Web Development",
    progress: 79,
    readiness: 72,
    assessment: "Completed",
    status: "Active",
    joined: "25 Jul 2026",
  },
  {
    id: 8,
    name: "Aarav Nair",
    email: "aarav@example.com",
    career: "Data Analyst",
    domain: "Data Science",
    progress: 34,
    readiness: 30,
    assessment: "Pending",
    status: "Active",
    joined: "22 Jul 2026",
  },
];

const AdminStudents = () => {
  const [students, setStudents] = useState(studentsData);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [domainFilter, setDomainFilter] =
    useState("All Domains");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const domains = [
    "All Domains",
    "Data Science",
    "Software Development",
    "Product Management",
    "Cybersecurity",
    "Cloud Computing",
    "Web Development",
  ];

  const filteredStudents = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    return students.filter((student) => {
      const matchesSearch =
        student.name
          .toLowerCase()
          .includes(search) ||
        student.email
          .toLowerCase()
          .includes(search) ||
        student.career
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All Status" ||
        student.status === statusFilter;

      const matchesDomain =
        domainFilter === "All Domains" ||
        student.domain === domainFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDomain
      );
    });
  }, [
    students,
    searchTerm,
    statusFilter,
    domainFilter,
  ]);

  const activeStudents = students.filter(
    (student) => student.status === "Active"
  ).length;

  const completedAssessments =
    students.filter(
      (student) =>
        student.assessment === "Completed"
    ).length;

  const averageProgress =
    students.length > 0
      ? Math.round(
          students.reduce(
            (total, student) =>
              total + student.progress,
            0
          ) / students.length
        )
      : 0;

  const handleToggleStatus = (studentId) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status:
                student.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : student
      )
    );

    setSelectedStudent(null);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="admin-students-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-header">

        <div className="admin-brand">
          <h1>CareerCompass</h1>
        </div>

        <div className="admin-header-right">

          <button
            className="admin-notification"
            type="button"
          >
            <i className="bi bi-bell"></i>
            <span></span>
          </button>

          <div className="admin-profile">

            <div className="admin-avatar">
              A
            </div>

            <div className="admin-profile-info">
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>

            <i className="bi bi-chevron-down"></i>

          </div>

        </div>

      </header>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="admin-students-content">

        {/* BACK */}

        <button
          className="admin-back-button"
          type="button"
          onClick={() =>
            (window.location.href =
              "/admin/dashboard")
          }
        >
          <i className="bi bi-arrow-left"></i>
          Back to Dashboard
        </button>


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="admin-page-heading">

          <div>

            <span className="admin-section-label">
              STUDENT MANAGEMENT
            </span>

            <h2>
              Manage Students
            </h2>

            <p>
              View student progress, career paths,
              assessments and platform activity.
            </p>

          </div>

          <button
            className="admin-primary-button"
            type="button"
            onClick={() =>
              alert(
                "Add Student will be connected to the backend later."
              )
            }
          >
            <i className="bi bi-person-plus"></i>
            Add Student
          </button>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="student-admin-stats">

          <div className="student-admin-stat">

            <div className="student-admin-stat-icon blue">
              <i className="bi bi-people"></i>
            </div>

            <div>
              <span>Total Students</span>
              <strong>{students.length}</strong>
              <small>Registered accounts</small>
            </div>

          </div>


          <div className="student-admin-stat">

            <div className="student-admin-stat-icon green">
              <i className="bi bi-person-check"></i>
            </div>

            <div>
              <span>Active Students</span>
              <strong>{activeStudents}</strong>
              <small>Currently active</small>
            </div>

          </div>


          <div className="student-admin-stat">

            <div className="student-admin-stat-icon purple">
              <i className="bi bi-clipboard-check"></i>
            </div>

            <div>
              <span>Assessments</span>
              <strong>{completedAssessments}</strong>
              <small>Completed</small>
            </div>

          </div>


          <div className="student-admin-stat">

            <div className="student-admin-stat-icon orange">
              <i className="bi bi-graph-up"></i>
            </div>

            <div>
              <span>Avg. Progress</span>
              <strong>{averageProgress}%</strong>
              <small>Across students</small>
            </div>

          </div>

        </section>


        {/* =================================================
            AI PLACEHOLDER
        ================================================= */}

        <section className="admin-student-ai">

          <div className="admin-student-ai-icon">
            <i className="bi bi-stars"></i>
          </div>

          <div className="admin-student-ai-content">

            <span className="admin-section-label">
              AI STUDENT INSIGHTS
            </span>

            <h3>
              Personalized student analytics
            </h3>

            <p>
              Future AI integration can identify
              students who need support, detect
              skill-gap patterns and highlight
              students at risk of falling behind.
            </p>

          </div>

          <span className="ai-ready-badge">
            AI Ready
          </span>

        </section>


        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="admin-student-controls">

          <div className="admin-student-search">

            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search by name, email or career..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>


          <select
            value={domainFilter}
            onChange={(e) =>
              setDomainFilter(e.target.value)
            }
          >

            {domains.map((domain) => (
              <option
                key={domain}
                value={domain}
              >
                {domain}
              </option>
            ))}

          </select>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="All Status">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>

        </section>


        {/* =================================================
            STUDENT TABLE
        ================================================= */}

        <section className="admin-student-table-card">

          <div className="admin-table-header">

            <div>

              <span className="admin-section-label">
                STUDENTS
              </span>

              <h3>
                Student Directory
              </h3>

            </div>

            <span className="student-result-count">
              {filteredStudents.length} Students
            </span>

          </div>


          <div className="student-table-wrapper">

            <table className="student-table">

              <thead>

                <tr>

                  <th>
                    Student
                  </th>

                  <th>
                    Career Path
                  </th>

                  <th>
                    Progress
                  </th>

                  <th>
                    Readiness
                  </th>

                  <th>
                    Assessment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredStudents.length > 0 ? (

                  filteredStudents.map(
                    (student) => (

                      <tr key={student.id}>

                        {/* STUDENT */}

                        <td>

                          <div className="student-table-user">

                            <div className="student-table-avatar">
                              {student.name.charAt(0)}
                            </div>

                            <div>

                              <strong>
                                {student.name}
                              </strong>

                              <span>
                                {student.email}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* CAREER */}

                        <td>

                          <div className="student-career-cell">

                            <strong>
                              {student.career}
                            </strong>

                            <span>
                              {student.domain}
                            </span>

                          </div>

                        </td>


                        {/* PROGRESS */}

                        <td>

                          <div className="table-progress">

                            <div className="table-progress-top">

                              <span>
                                {student.progress}%
                              </span>

                            </div>

                            <div className="table-progress-track">

                              <div
                                style={{
                                  width: `${student.progress}%`,
                                }}
                              ></div>

                            </div>

                          </div>

                        </td>


                        {/* READINESS */}

                        <td>

                          <span
                            className={`readiness-badge ${
                              student.readiness >= 75
                                ? "high"
                                : student.readiness >= 50
                                ? "medium"
                                : "low"
                            }`}
                          >
                            {student.readiness}%
                          </span>

                        </td>


                        {/* ASSESSMENT */}

                        <td>

                          <span
                            className={`assessment-status ${
                              student.assessment
                                .toLowerCase()
                            }`}
                          >
                            {student.assessment}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`student-status ${
                              student.status.toLowerCase()
                            }`}
                          >
                            <span></span>
                            {student.status}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="student-view-button"
                            type="button"
                            onClick={() =>
                              handleViewStudent(
                                student
                              )
                            }
                          >
                            View
                            <i className="bi bi-arrow-right"></i>
                          </button>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="student-empty-state"
                    >

                      <i className="bi bi-search"></i>

                      <strong>
                        No students found
                      </strong>

                      <span>
                        Try changing your search
                        or filters.
                      </span>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>


      {/* =================================================
          STUDENT DETAIL MODAL
      ================================================= */}

      {selectedStudent && (

        <div
          className="student-modal-overlay"
          onClick={() =>
            setSelectedStudent(null)
          }
        >

          <div
            className="student-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="student-modal-close"
              type="button"
              onClick={() =>
                setSelectedStudent(null)
              }
            >
              <i className="bi bi-x"></i>
            </button>


            {/* MODAL HEADER */}

            <div className="student-modal-header">

              <div className="student-modal-avatar">
                {selectedStudent.name.charAt(0)}
              </div>

              <div>

                <h2>
                  {selectedStudent.name}
                </h2>

                <p>
                  {selectedStudent.email}
                </p>

              </div>

            </div>


            {/* CAREER */}

            <div className="student-modal-career">

              <span className="admin-section-label">
                RECOMMENDED CAREER
              </span>

              <strong>
                {selectedStudent.career}
              </strong>

              <small>
                {selectedStudent.domain}
              </small>

            </div>


            {/* DETAILS */}

            <div className="student-modal-details">

              <div>

                <span>
                  Learning Progress
                </span>

                <strong>
                  {selectedStudent.progress}%
                </strong>

              </div>


              <div>

                <span>
                  Career Readiness
                </span>

                <strong>
                  {selectedStudent.readiness}%
                </strong>

              </div>


              <div>

                <span>
                  Assessment
                </span>

                <strong>
                  {selectedStudent.assessment}
                </strong>

              </div>


              <div>

                <span>
                  Joined
                </span>

                <strong>
                  {selectedStudent.joined}
                </strong>

              </div>

            </div>


            {/* AI */}

            <div className="student-modal-ai">

              <i className="bi bi-stars"></i>

              <div>

                <strong>
                  AI Student Insight
                </strong>

                <span>
                  Personalized insights about this
                  student's progress and skill gaps
                  will appear here after AI integration.
                </span>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="student-modal-actions">

              <button
                className="student-modal-secondary"
                type="button"
                onClick={() =>
                  setSelectedStudent(null)
                }
              >
                Close
              </button>


              <button
                className="student-modal-danger"
                type="button"
                onClick={() =>
                  handleToggleStatus(
                    selectedStudent.id
                  )
                }
              >

                {selectedStudent.status ===
                "Active"
                  ? "Deactivate Student"
                  : "Activate Student"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminStudents;