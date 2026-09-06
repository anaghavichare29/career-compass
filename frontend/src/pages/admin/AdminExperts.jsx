import React, { useMemo, useState } from "react";
import "./AdminExperts.css";

const expertsData = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "Software Engineer",
    company: "Google",
    domain: "AI / Machine Learning",
    experience: "6+ Years",
    status: "Approved",
    verified: true,
    joined: "12 Aug 2026",
    initials: "PS",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    role: "Data Scientist",
    company: "Microsoft",
    domain: "Data Science",
    experience: "8+ Years",
    status: "Approved",
    verified: true,
    joined: "10 Aug 2026",
    initials: "RM",
  },
  {
    id: 3,
    name: "Neha Shah",
    email: "neha.shah@example.com",
    role: "Product Manager",
    company: "Adobe",
    domain: "Product Management",
    experience: "7+ Years",
    status: "Pending",
    verified: false,
    joined: "08 Aug 2026",
    initials: "NS",
  },
  {
    id: 4,
    name: "Arjun Kapoor",
    email: "arjun.kapoor@example.com",
    role: "Cybersecurity Engineer",
    company: "Cisco",
    domain: "Cybersecurity",
    experience: "5+ Years",
    status: "Approved",
    verified: true,
    joined: "05 Aug 2026",
    initials: "AK",
  },
  {
    id: 5,
    name: "Aisha Khan",
    email: "aisha.khan@example.com",
    role: "Cloud Engineer",
    company: "Amazon Web Services",
    domain: "Cloud Computing",
    experience: "6+ Years",
    status: "Pending",
    verified: false,
    joined: "02 Aug 2026",
    initials: "AK",
  },
  {
    id: 6,
    name: "Rohan Desai",
    email: "rohan.desai@example.com",
    role: "Full Stack Developer",
    company: "Infosys",
    domain: "Web Development",
    experience: "5+ Years",
    status: "Approved",
    verified: true,
    joined: "28 Jul 2026",
    initials: "RD",
  },
  {
    id: 7,
    name: "Karan Malhotra",
    email: "karan.malhotra@example.com",
    role: "ML Engineer",
    company: "Accenture",
    domain: "AI / Machine Learning",
    experience: "4+ Years",
    status: "Rejected",
    verified: false,
    joined: "24 Jul 2026",
    initials: "KM",
  },
  {
    id: 8,
    name: "Meera Joshi",
    email: "meera.joshi@example.com",
    role: "Data Analyst",
    company: "Deloitte",
    domain: "Data Science",
    experience: "5+ Years",
    status: "Pending",
    verified: false,
    joined: "21 Jul 2026",
    initials: "MJ",
  },
];

const AdminExperts = () => {
  const [experts, setExperts] = useState(expertsData);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [domainFilter, setDomainFilter] =
    useState("All Domains");

  const [selectedExpert, setSelectedExpert] =
    useState(null);

  const domains = [
    "All Domains",
    "AI / Machine Learning",
    "Data Science",
    "Product Management",
    "Cybersecurity",
    "Cloud Computing",
    "Web Development",
  ];

  const filteredExperts = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    return experts.filter((expert) => {
      const matchesSearch =
        expert.name
          .toLowerCase()
          .includes(search) ||
        expert.email
          .toLowerCase()
          .includes(search) ||
        expert.role
          .toLowerCase()
          .includes(search) ||
        expert.company
          .toLowerCase()
          .includes(search) ||
        expert.domain
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All Status" ||
        expert.status === statusFilter;

      const matchesDomain =
        domainFilter === "All Domains" ||
        expert.domain === domainFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDomain
      );
    });
  }, [
    experts,
    searchTerm,
    statusFilter,
    domainFilter,
  ]);

  const approvedCount = experts.filter(
    (expert) => expert.status === "Approved"
  ).length;

  const pendingCount = experts.filter(
    (expert) => expert.status === "Pending"
  ).length;

  const rejectedCount = experts.filter(
    (expert) => expert.status === "Rejected"
  ).length;

  const verifiedCount = experts.filter(
    (expert) => expert.verified
  ).length;

  const updateExpertStatus = (
    expertId,
    newStatus
  ) => {
    setExperts((currentExperts) =>
      currentExperts.map((expert) =>
        expert.id === expertId
          ? {
              ...expert,
              status: newStatus,
              verified:
                newStatus === "Approved",
            }
          : expert
      )
    );

    setSelectedExpert(null);
  };

  const handleViewExpert = (expert) => {
    setSelectedExpert(expert);
  };

  return (
    <div className="admin-experts-page">

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

      <main className="admin-experts-content">

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
              INDUSTRY EXPERT MANAGEMENT
            </span>

            <h2>
              Manage Industry Experts
            </h2>

            <p>
              Review, verify and manage professionals
              available to guide CareerCompass students.
            </p>

          </div>

          <button
            className="admin-primary-button"
            type="button"
            onClick={() =>
              alert(
                "Add Expert will be connected to the backend later."
              )
            }
          >
            <i className="bi bi-person-plus"></i>
            Add Expert
          </button>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="expert-admin-stats">

          <div className="expert-admin-stat">

            <div className="expert-admin-stat-icon blue">
              <i className="bi bi-people"></i>
            </div>

            <div>
              <span>Total Experts</span>
              <strong>{experts.length}</strong>
              <small>Registered professionals</small>
            </div>

          </div>


          <div className="expert-admin-stat">

            <div className="expert-admin-stat-icon green">
              <i className="bi bi-patch-check"></i>
            </div>

            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
              <small>Verified experts</small>
            </div>

          </div>


          <div className="expert-admin-stat">

            <div className="expert-admin-stat-icon orange">
              <i className="bi bi-hourglass-split"></i>
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
              <small>Awaiting review</small>
            </div>

          </div>


          <div className="expert-admin-stat">

            <div className="expert-admin-stat-icon purple">
              <i className="bi bi-shield-check"></i>
            </div>

            <div>
              <span>Verified</span>
              <strong>{verifiedCount}</strong>
              <small>Professionals verified</small>
            </div>

          </div>

        </section>


        {/* =================================================
            AI PLACEHOLDER
        ================================================= */}

        <section className="admin-expert-ai">

          <div className="admin-expert-ai-icon">
            <i className="bi bi-stars"></i>
          </div>

          <div className="admin-expert-ai-content">

            <span className="admin-section-label">
              AI EXPERT MATCHING
            </span>

            <h3>
              Intelligent expert recommendations
            </h3>

            <p>
              After AI integration, CareerCompass can
              recommend experts to students based on
              career goals, skill gaps, interests and
              learning progress.
            </p>

          </div>

          <span className="ai-ready-badge">
            AI Ready
          </span>

        </section>


        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="admin-expert-controls">

          <div className="admin-expert-search">

            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search by name, role, company or domain..."
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

            <option value="Approved">
              Approved
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Rejected">
              Rejected
            </option>

          </select>

        </section>


        {/* =================================================
            EXPERT TABLE
        ================================================= */}

        <section className="admin-expert-table-card">

          <div className="admin-table-header">

            <div>

              <span className="admin-section-label">
                INDUSTRY PROFESSIONALS
              </span>

              <h3>
                Expert Directory
              </h3>

            </div>

            <span className="expert-result-count">
              {filteredExperts.length} Experts
            </span>

          </div>


          <div className="expert-table-wrapper">

            <table className="expert-table">

              <thead>

                <tr>

                  <th>
                    Expert
                  </th>

                  <th>
                    Role & Company
                  </th>

                  <th>
                    Domain
                  </th>

                  <th>
                    Experience
                  </th>

                  <th>
                    Verification
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

                {filteredExperts.length > 0 ? (

                  filteredExperts.map(
                    (expert) => (

                      <tr key={expert.id}>

                        {/* EXPERT */}

                        <td>

                          <div className="expert-table-user">

                            <div className="expert-table-avatar">
                              {expert.initials}
                            </div>

                            <div>

                              <strong>
                                {expert.name}
                              </strong>

                              <span>
                                {expert.email}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* ROLE */}

                        <td>

                          <div className="expert-role-cell">

                            <strong>
                              {expert.role}
                            </strong>

                            <span>
                              {expert.company}
                            </span>

                          </div>

                        </td>


                        {/* DOMAIN */}

                        <td>

                          <span className="expert-domain-badge">
                            {expert.domain}
                          </span>

                        </td>


                        {/* EXPERIENCE */}

                        <td>

                          <span className="expert-experience">
                            {expert.experience}
                          </span>

                        </td>


                        {/* VERIFICATION */}

                        <td>

                          {expert.verified ? (

                            <span className="expert-verified-status">
                              <i className="bi bi-patch-check-fill"></i>
                              Verified
                            </span>

                          ) : (

                            <span className="expert-unverified-status">
                              <i className="bi bi-clock"></i>
                              Not Verified
                            </span>

                          )}

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`expert-status ${expert.status.toLowerCase()}`}
                          >

                            <span></span>

                            {expert.status}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="expert-view-button"
                            type="button"
                            onClick={() =>
                              handleViewExpert(
                                expert
                              )
                            }
                          >
                            Review
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
                      className="expert-empty-state"
                    >

                      <i className="bi bi-search"></i>

                      <strong>
                        No experts found
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


        {/* =================================================
            REJECTED INFORMATION
        ================================================= */}

        {rejectedCount > 0 && (

          <div className="rejected-info">

            <i className="bi bi-info-circle"></i>

            <span>
              {rejectedCount} expert
              {rejectedCount > 1 ? "s" : ""} currently
              {rejectedCount > 1 ? " are" : " is"} marked
              as rejected.
            </span>

          </div>

        )}

      </main>


      {/* =================================================
          EXPERT REVIEW MODAL
      ================================================= */}

      {selectedExpert && (

        <div
          className="expert-modal-overlay"
          onClick={() =>
            setSelectedExpert(null)
          }
        >

          <div
            className="expert-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="expert-modal-close"
              type="button"
              onClick={() =>
                setSelectedExpert(null)
              }
            >
              <i className="bi bi-x"></i>
            </button>


            {/* MODAL HEADER */}

            <div className="expert-modal-header">

              <div className="expert-modal-avatar">
                {selectedExpert.initials}
              </div>

              <div>

                <div className="expert-modal-name">

                  <h2>
                    {selectedExpert.name}
                  </h2>

                  {selectedExpert.verified && (
                    <i
                      className="bi bi-patch-check-fill"
                      title="Verified"
                    ></i>
                  )}

                </div>

                <p>
                  {selectedExpert.role}
                </p>

              </div>

            </div>


            {/* COMPANY */}

            <div className="expert-modal-company">

              <i className="bi bi-building"></i>

              <div>

                <span>
                  Company
                </span>

                <strong>
                  {selectedExpert.company}
                </strong>

              </div>

            </div>


            {/* DETAILS */}

            <div className="expert-modal-details">

              <div>

                <span>
                  Domain
                </span>

                <strong>
                  {selectedExpert.domain}
                </strong>

              </div>


              <div>

                <span>
                  Experience
                </span>

                <strong>
                  {selectedExpert.experience}
                </strong>

              </div>


              <div>

                <span>
                  Joined
                </span>

                <strong>
                  {selectedExpert.joined}
                </strong>

              </div>


              <div>

                <span>
                  Status
                </span>

                <strong>
                  {selectedExpert.status}
                </strong>

              </div>

            </div>


            {/* AI MATCHING */}

            <div className="expert-modal-ai">

              <i className="bi bi-stars"></i>

              <div>

                <strong>
                  AI Expert Matching
                </strong>

                <span>
                  Future AI integration will calculate
                  expert relevance for students based on
                  career goals, skills and interests.
                </span>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="expert-modal-actions">

              {selectedExpert.status !==
                "Approved" && (

                <button
                  className="expert-approve-button"
                  type="button"
                  onClick={() =>
                    updateExpertStatus(
                      selectedExpert.id,
                      "Approved"
                    )
                  }
                >
                  <i className="bi bi-check2"></i>
                  Approve Expert
                </button>

              )}


              {selectedExpert.status !==
                "Rejected" && (

                <button
                  className="expert-reject-button"
                  type="button"
                  onClick={() =>
                    updateExpertStatus(
                      selectedExpert.id,
                      "Rejected"
                    )
                  }
                >
                  <i className="bi bi-x"></i>
                  Reject
                </button>

              )}


              <button
                className="expert-modal-secondary"
                type="button"
                onClick={() =>
                  setSelectedExpert(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminExperts;