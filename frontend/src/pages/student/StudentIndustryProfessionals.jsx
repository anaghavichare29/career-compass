import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";

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
      <div className="page-introduction">
        <span className="student-section-label">INDUSTRY CONNECT</span>
        <h1>Industry Professionals</h1>
        <p>
          Learn from verified professionals, explore their real career journeys,
          understand workplace expectations, and request 1-on-1 mentorship.
        </p>
      </div>

      <div className="industry-search">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            placeholder="Search by name, role, company or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: "1.5rem" }}></i>
          <p>Loading industry experts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          <p>No industry professionals found matching your search.</p>
        </div>
      ) : (
        <div className="professional-grid">
          {filtered.map((prof) => (
            <div className="student-card professional-card" key={prof.id}>
              <div className="professional-avatar">
                {prof.initials || prof.name.charAt(0)}
              </div>

              <h2>{prof.name}</h2>
              <h4>{prof.role}</h4>
              <p>{prof.company}</p>

              <span className="professional-experience">
                <i className="bi bi-briefcase"></i>
                {prof.experience}
              </span>

              <div className="skill-tags">
                {prof.skills?.slice(0, 4).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <a
                href={`/student/industry-professionals/${prof.id}`}
                className="student-primary-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                }}
              >
                View Profile & Guidance
                <i className="bi bi-arrow-right"></i>
              </a>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentIndustryProfessionals;