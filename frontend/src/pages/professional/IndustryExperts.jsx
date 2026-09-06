import { useState } from "react";
import "./IndustryExperts.css";

const expertsData = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Google",
    domain: "AI / Machine Learning",
    experience: "6+ Years Experience",
    initials: "PS",
    bio: "Software engineer specializing in machine learning and scalable AI applications."
  },
  {
    id: 2,
    name: "Rahul Mehta",
    role: "Data Scientist",
    company: "Microsoft",
    domain: "Data Science",
    experience: "8+ Years Experience",
    initials: "RM",
    bio: "Data scientist working on analytics, predictive modelling and data-driven products."
  },
  {
    id: 3,
    name: "Neha Shah",
    role: "Product Manager",
    company: "Adobe",
    domain: "Product Management",
    experience: "7+ Years Experience",
    initials: "NS",
    bio: "Product professional focused on building user-centric digital products and strategies."
  },
  {
    id: 4,
    name: "Arjun Kapoor",
    role: "Cybersecurity Engineer",
    company: "Cisco",
    domain: "Cybersecurity",
    experience: "5+ Years Experience",
    initials: "AK",
    bio: "Cybersecurity professional working on application security and threat detection."
  },
  {
    id: 5,
    name: "Aisha Khan",
    role: "Cloud Engineer",
    company: "Amazon Web Services",
    domain: "Cloud Computing",
    experience: "6+ Years Experience",
    initials: "AK",
    bio: "Cloud engineer specializing in cloud architecture, deployment and scalable systems."
  },
  {
    id: 6,
    name: "Rohan Desai",
    role: "Full Stack Developer",
    company: "Infosys",
    domain: "Web Development",
    experience: "5+ Years Experience",
    initials: "RD",
    bio: "Full stack developer experienced in building modern web applications and APIs."
  }
];

function IndustryExperts() {
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Guest";
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "?";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] =
    useState("All Domains");

  const domains = [
    "All Domains",
    "AI / Machine Learning",
    "Data Science",
    "Product Management",
    "Cybersecurity",
    "Cloud Computing",
    "Web Development"
  ];

  const filteredExperts = expertsData.filter((expert) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      expert.name.toLowerCase().includes(search) ||
      expert.role.toLowerCase().includes(search) ||
      expert.company.toLowerCase().includes(search) ||
      expert.domain.toLowerCase().includes(search);

    const matchesDomain =
      selectedDomain === "All Domains" ||
      expert.domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  const handleViewProfile = (expertId) => {
    window.location.href = `/industry-experts/${expertId}`;
  };

  return (
    <div className="experts-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="experts-header">

        <div className="experts-brand">
          <h1>CareerCompass</h1>
        </div>

        <div className="experts-header-actions">

          <button
            className="notification-button"
            type="button"
          >
            🔔
          </button>

          <div className="profile-mini">

            <div className="profile-avatar">
              {initial}
            </div>

            <span>
              {fullName}
            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="experts-content">


        {/* =================================================
            HERO
        ================================================= */}

        <section className="experts-hero">

          <div>

            <p className="section-label">
              INDUSTRY CONNECTIONS
            </p>

            <h2>
              Learn From Industry Experts
            </h2>

            <p className="hero-description">
              Connect with verified professionals and learn from
              their real-world career experiences, insights and
              practical guidance.
            </p>

          </div>

        </section>


        {/* =================================================
            SEARCH & FILTER
        ================================================= */}

        <section className="experts-controls">

          <div className="search-box">

            <span className="search-icon">
              🔍
            </span>

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
            value={selectedDomain}
            onChange={(e) =>
              setSelectedDomain(e.target.value)
            }
            className="domain-filter"
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

        </section>


        {/* =================================================
            EXPERTS SECTION
        ================================================= */}

        <section className="experts-section">

          <div className="section-heading">

            <div>

              <h3>
                Featured Industry Experts
              </h3>

              <p>
                Explore professionals who can help you understand
                real-world career paths.
              </p>

            </div>

            <span className="expert-count">
              {filteredExperts.length} Experts
            </span>

          </div>


          {/* =================================================
              EXPERT GRID
          ================================================= */}

          <div className="experts-grid">

            {filteredExperts.length > 0 ? (

              filteredExperts.map((expert) => (

                <div
                  className="expert-card"
                  key={expert.id}
                >

                  {/* Avatar */}

                  <div className="expert-avatar">
                    {expert.initials}
                  </div>


                  {/* Information */}

                  <div className="expert-info">

                    <div className="expert-name-row">

                      <h4>
                        {expert.name}
                      </h4>

                      <span
                        className="verified-badge"
                        title="Verified Industry Professional"
                      >
                        ✓
                      </span>

                    </div>


                    <p className="expert-role">
                      {expert.role}
                    </p>


                    <p className="expert-company">
                      {expert.company}
                    </p>


                    <div className="expert-meta">

                      <span className="domain-badge">
                        {expert.domain}
                      </span>

                      <span className="experience">
                        {expert.experience}
                      </span>

                    </div>


                    <p className="expert-bio">
                      {expert.bio}
                    </p>


                    {/* View Profile */}

                    <button
  className="view-profile-button"
  type="button"
  onClick={() => {
    window.location.href = `/industry-experts/${expert.id}`;
  }}
>
  View Profile
  <span>→</span>
</button>

                  </div>

                </div>

              ))

            ) : (

              <div className="no-results">

                <div className="no-results-icon">
                  🔍
                </div>

                <h3>
                  No experts found
                </h3>

                <p>
                  Try changing your search or selecting
                  another domain.
                </p>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default IndustryExperts;