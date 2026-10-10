import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentIndustryProfessionals.css";

const StudentIndustryProfessionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");

  useEffect(() => {
    setLoading(true);
    api
      .get("mentorship/experts/")
      .then((res) => {
        setProfessionals(res.data);
      })
      .catch((err) => {
        console.error("Failed to load industry professionals:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const domains = [
    "All Domains",
    "AI / Machine Learning",
    "Data Science",
    "Product Management",
    "Cybersecurity",
    "Cloud Computing",
    "Web Development",
  ];

  const filtered = professionals.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      (p.skills && p.skills.some((s) => s.toLowerCase().includes(q)));
    const matchesDomain =
      selectedDomain === "All Domains" || p.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <StudentLayout pageTitle="Industry Professionals">
      <div className="student-industry-container">
        {/* HERO BANNER */}
        <section className="industry-hero-banner">
          <span className="industry-hero-badge">
            <i className="bi bi-patch-check-fill"></i>
            VERIFIED MENTOR NETWORK
          </span>
          <h1 className="industry-hero-title">Connect with Industry Leaders</h1>
          <p className="industry-hero-desc">
            Learn from verified professionals from top companies including Google, Microsoft, AWS, Adobe, and Cisco.
            Explore career roadmaps, understand real workplace expectations, and request 1-on-1 guidance.
          </p>

          <div className="industry-hero-stats">
            <div className="hero-stat-item">
              <i className="bi bi-people-fill"></i>
              <span>{professionals.length || 6}+ Active Mentors</span>
            </div>
            <div className="hero-stat-item">
              <i className="bi bi-building-check"></i>
              <span>Top Tech Companies</span>
            </div>
            <div className="hero-stat-item">
              <i className="bi bi-chat-quote-fill"></i>
              <span>1-on-1 Guidance Available</span>
            </div>
            <div className="hero-stat-item">
              <i className="bi bi-shield-check"></i>
              <span>100% Verified Profiles</span>
            </div>
          </div>
        </section>

        {/* SEARCH & DOMAIN FILTER PILLS */}
        <section className="industry-filter-bar">
          <div className="industry-search-input-box">
            <i className="bi bi-search"></i>
            <input
              placeholder="Search mentors by name, role, company or technical skill (e.g. Python, AWS, ML)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="search-clear-btn"
                type="button"
                onClick={() => setSearch("")}
                title="Clear Search"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>

          <div className="industry-domain-pills">
            {domains.map((d) => (
              <button
                key={d}
                type="button"
                className={`domain-pill-btn ${selectedDomain === d ? "active" : ""}`}
                onClick={() => setSelectedDomain(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        {/* MENTORS GRID */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#64748b" }}>
            <div style={{ fontSize: "2.5rem", color: "#3b82f6", marginBottom: "1rem" }}>
              <i className="bi bi-arrow-repeat bi-spin"></i>
            </div>
            <h3 style={{ color: "#0f172a", margin: 0 }}>Discovering Industry Professionals...</h3>
            <p style={{ color: "#64748b", marginTop: "6px" }}>Fetching verified mentor profiles from the network</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#ffffff", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
            <i className="bi bi-search" style={{ fontSize: "2.5rem", color: "#94a3b8" }}></i>
            <h3 style={{ color: "#0f172a", margin: "14px 0 6px" }}>No Mentors Found</h3>
            <p style={{ color: "#64748b", margin: "0 0 16px" }}>
              No verified industry professionals match "{search}" in {selectedDomain}.
            </p>
            <button
              className="student-primary-btn"
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedDomain("All Domains");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="professional-card-grid">
            {filtered.map((prof) => (
              <article className="student-expert-card" key={prof.id}>
                {/* Header */}
                <div className="expert-card-header-row">
                  <div className="expert-card-avatar">
                    {prof.initials || prof.name.charAt(0)}
                    <span className="" title="Verified Active Mentor"></span>
                  </div>

                  <div className="expert-card-meta">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <h3>{prof.name}</h3>
                      {/* <span className="verified-expert-badge">
                        <i className="bi bi-patch-check-fill"></i> Verified
                      </span> */}
                    </div>

                    <div className="expert-role-title">{prof.role}</div>
                    <span className="expert-company-name">
                      <i className="bi bi-buildings"></i> {prof.company}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="expert-badges-row">
                  <span className="expert-badge-chip">
                    <i className="bi bi-briefcase"></i> {prof.experience}
                  </span>
                  <span className="expert-badge-chip domain">
                    <i className="bi bi-compass"></i> {prof.domain}
                  </span>
                </div>

                {/* Bio snippet */}
                {prof.bio && (
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px", lineHeight: "1.5", flex: 1 }}>
                    {prof.bio.length > 110 ? `${prof.bio.slice(0, 110)}...` : prof.bio}
                  </p>
                )}

                {/* Skills */}
                {prof.skills && prof.skills.length > 0 && (
                  <div className="expert-skills-block">
                    <span className="expert-skills-label">Core Competencies</span>
                    <div className="expert-skill-tags">
                      {prof.skills.slice(0, 4).map((skill) => (
                        <span className="expert-skill-chip" key={skill}>{skill}</span>
                      ))}
                      {prof.skills.length > 4 && (
                        <span className="expert-skill-chip" style={{ color: "#64748b" }}>
                          +{prof.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="expert-card-footer">
                  <a
                    href={`/student/industry-professionals/${prof.id}`}
                    className="expert-connect-button"
                  >
                    <span>View Profile & Guidance</span>
                    <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentIndustryProfessionals;