import React from "react";
import "./expert-profile.css";

const expertsData = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Google",
    domain: "AI / Machine Learning",
    experience: "6+ Years Experience",
    initials: "PS",

    bio: "Software engineer specializing in machine learning and scalable AI applications. Experienced in building production-ready systems and working with data-driven technologies.",

    skills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "System Design",
    ],

    guidance: [
      "AI / ML Career Paths",
      "Machine Learning Projects",
      "Technical Interview Preparation",
      "Industry Skills",
    ],

    journey: [
      {
        year: "2018",
        title: "Started Software Engineering",
        description:
          "Began working on software development and programming fundamentals.",
      },
      {
        year: "2020",
        title: "Moved into Machine Learning",
        description:
          "Started specializing in machine learning and data-driven applications.",
      },
      {
        year: "2022",
        title: "Machine Learning Engineer",
        description:
          "Worked on scalable machine learning systems and production applications.",
      },
      {
        year: "2024",
        title: "Software Engineer — Google",
        description:
          "Currently working on AI and machine learning solutions.",
      },
    ],
  },

  {
    id: 2,
    name: "Rahul Mehta",
    role: "Data Scientist",
    company: "Microsoft",
    domain: "Data Science",
    experience: "8+ Years Experience",
    initials: "RM",

    bio: "Data scientist working on analytics, predictive modelling and data-driven products.",

    skills: [
      "Python",
      "SQL",
      "Statistics",
      "Machine Learning",
      "Data Visualization",
    ],

    guidance: [
      "Data Science Careers",
      "Analytics Projects",
      "Statistics",
      "Data Science Interviews",
    ],

    journey: [
      {
        year: "2016",
        title: "Data Analyst",
        description:
          "Started a career in analytics and business intelligence.",
      },
      {
        year: "2019",
        title: "Data Scientist",
        description:
          "Moved into predictive modelling and machine learning.",
      },
      {
        year: "2022",
        title: "Senior Data Scientist",
        description:
          "Worked on large-scale data science products.",
      },
      {
        year: "2024",
        title: "Data Scientist — Microsoft",
        description:
          "Currently working on data-driven products and analytics.",
      },
    ],
  },

  {
    id: 3,
    name: "Neha Shah",
    role: "Product Manager",
    company: "Adobe",
    domain: "Product Management",
    experience: "7+ Years Experience",
    initials: "NS",

    bio: "Product professional focused on building user-centric digital products and strategies.",

    skills: [
      "Product Strategy",
      "Product Design",
      "User Research",
      "Analytics",
      "Leadership",
    ],

    guidance: [
      "Product Management",
      "Product Strategy",
      "Building Digital Products",
      "Product Interviews",
    ],

    journey: [
      {
        year: "2017",
        title: "Product Analyst",
        description:
          "Started working with product analytics and user research.",
      },
      {
        year: "2019",
        title: "Associate Product Manager",
        description:
          "Moved into product planning and execution.",
      },
      {
        year: "2022",
        title: "Product Manager",
        description:
          "Led product initiatives and cross-functional teams.",
      },
      {
        year: "2024",
        title: "Product Manager — Adobe",
        description:
          "Currently building user-centric digital products.",
      },
    ],
  },

  {
    id: 4,
    name: "Arjun Kapoor",
    role: "Cybersecurity Engineer",
    company: "Cisco",
    domain: "Cybersecurity",
    experience: "5+ Years Experience",
    initials: "AK",

    bio: "Cybersecurity professional working on application security and threat detection.",

    skills: [
      "Cybersecurity",
      "Network Security",
      "Threat Detection",
      "Application Security",
      "Ethical Hacking",
    ],

    guidance: [
      "Cybersecurity Careers",
      "Security Projects",
      "Cybersecurity Certifications",
      "Security Interviews",
    ],

    journey: [
      {
        year: "2019",
        title: "Security Analyst",
        description:
          "Started working in cybersecurity and security monitoring.",
      },
      {
        year: "2021",
        title: "Security Engineer",
        description:
          "Moved into application and network security.",
      },
      {
        year: "2023",
        title: "Cybersecurity Engineer",
        description:
          "Worked on threat detection and security systems.",
      },
      {
        year: "2025",
        title: "Cybersecurity Engineer — Cisco",
        description:
          "Currently working on application security and threat detection.",
      },
    ],
  },

  {
    id: 5,
    name: "Aisha Khan",
    role: "Cloud Engineer",
    company: "Amazon Web Services",
    domain: "Cloud Computing",
    experience: "6+ Years Experience",
    initials: "AK",

    bio: "Cloud engineer specializing in cloud architecture, deployment and scalable systems.",

    skills: [
      "AWS",
      "Cloud Architecture",
      "Docker",
      "Kubernetes",
      "DevOps",
    ],

    guidance: [
      "Cloud Careers",
      "AWS Learning",
      "Cloud Projects",
      "DevOps Fundamentals",
    ],

    journey: [
      {
        year: "2018",
        title: "Cloud Support Engineer",
        description:
          "Started working with cloud infrastructure and deployment.",
      },
      {
        year: "2020",
        title: "Cloud Engineer",
        description:
          "Worked on cloud architecture and scalable systems.",
      },
      {
        year: "2023",
        title: "Senior Cloud Engineer",
        description:
          "Designed and deployed cloud-based solutions.",
      },
      {
        year: "2025",
        title: "Cloud Engineer — AWS",
        description:
          "Currently working on scalable cloud infrastructure.",
      },
    ],
  },

  {
    id: 6,
    name: "Rohan Desai",
    role: "Full Stack Developer",
    company: "Infosys",
    domain: "Web Development",
    experience: "5+ Years Experience",
    initials: "RD",

    bio: "Full stack developer experienced in building modern web applications and APIs.",

    skills: [
      "React",
      "JavaScript",
      "Node.js",
      "Django",
      "REST APIs",
    ],

    guidance: [
      "Web Development Careers",
      "Full Stack Projects",
      "Frontend Development",
      "Developer Interviews",
    ],

    journey: [
      {
        year: "2019",
        title: "Frontend Developer",
        description:
          "Started building modern web interfaces and applications.",
      },
      {
        year: "2021",
        title: "Full Stack Developer",
        description:
          "Expanded into backend development and APIs.",
      },
      {
        year: "2023",
        title: "Senior Developer",
        description:
          "Worked on scalable web applications and development teams.",
      },
      {
        year: "2025",
        title: "Full Stack Developer — Infosys",
        description:
          "Currently building modern web applications and APIs.",
      },
    ],
  },
];


const ExpertProfile = () => {

  /* =====================================================
     GET EXPERT FROM URL
     Example: /industry-experts/1
  ===================================================== */

  const pathParts = window.location.pathname.split("/");

  const expertId = Number(pathParts[2]);

  const expert =
    expertsData.find(
      (item) => item.id === expertId
    ) || expertsData[0];


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const goBack = () => {
    window.location.href = "/industry-experts";
  };


  const handleConnect = () => {

    window.location.href =
      `/industry-experts/${expert.id}/guidance`;

  };


  return (
    <div className="expert-profile-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="experts-header">

        <div className="experts-brand">

          <h1>
            CareerCompass
          </h1>

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
              A
            </div>

            <span>
              Student
            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="expert-profile-content">


        {/* BACK */}

        <button
          className="back-experts-button"
          onClick={goBack}
          type="button"
        >

          <i className="bi bi-arrow-left"></i>

          Back to Industry Experts

        </button>


        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="expert-profile-hero">


          <div className="expert-profile-avatar">
            {expert.initials}
          </div>


          <div className="expert-profile-main">

            <div className="expert-profile-name-row">

              <h1>
                {expert.name}
              </h1>

              <span
                className="expert-verified"
                title="Verified Industry Professional"
              >
                ✓
              </span>

            </div>


            <p className="expert-profile-role">
              {expert.role}
            </p>


            <p className="expert-profile-company">

              <i className="bi bi-building"></i>

              {expert.company}

            </p>


            <div className="expert-profile-meta">

              <span>
                <i className="bi bi-diagram-3"></i>
                {expert.domain}
              </span>


              <span>
                <i className="bi bi-briefcase"></i>
                {expert.experience}
              </span>


              <span>
                <i className="bi bi-patch-check"></i>
                Verified Professional
              </span>

            </div>

          </div>


          {/* REQUEST GUIDANCE */}

          <div className="expert-connect-area">

            <button
              className="expert-connect-button"
              onClick={handleConnect}
              type="button"
            >

              <i className="bi bi-person-plus"></i>

              Request Guidance

            </button>


            <span>
              Connect with this expert
            </span>

          </div>

        </section>


        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="expert-profile-grid">


          {/* =================================================
              LEFT
          ================================================= */}

          <div className="expert-profile-left">


            {/* ABOUT */}

            <section className="expert-profile-card">

              <div className="expert-card-heading">

                <div>

                  <span className="expert-section-label">
                    ABOUT THE EXPERT
                  </span>

                  <h2>
                    Professional Overview
                  </h2>

                </div>

                <i className="bi bi-person-vcard"></i>

              </div>


              <p className="expert-about">
                {expert.bio}
              </p>

            </section>


            {/* SKILLS */}

            <section className="expert-profile-card">

              <div className="expert-card-heading">

                <div>

                  <span className="expert-section-label">
                    EXPERTISE
                  </span>

                  <h2>
                    Skills & Technologies
                  </h2>

                </div>

                <i className="bi bi-lightning"></i>

              </div>


              <div className="expert-skills">

                {expert.skills.map(
                  (skill) => (

                    <span key={skill}>
                      {skill}
                    </span>

                  )
                )}

              </div>

            </section>


            {/* CAREER JOURNEY */}

            <section className="expert-profile-card">

              <div className="expert-card-heading">

                <div>

                  <span className="expert-section-label">
                    CAREER JOURNEY
                  </span>

                  <h2>
                    Professional Experience
                  </h2>

                </div>

                <i className="bi bi-signpost-2"></i>

              </div>


              <div className="expert-timeline">

                {expert.journey.map(
                  (item, index) => (

                    <div
                      className="expert-timeline-item"
                      key={`${item.year}-${index}`}
                    >

                      <div className="timeline-line"></div>


                      <div className="timeline-dot">
                        {index + 1}
                      </div>


                      <div className="timeline-content">

                        <span>
                          {item.year}
                        </span>

                        <h3>
                          {item.title}
                        </h3>

                        <p>
                          {item.description}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>

          </div>


          {/* =================================================
              RIGHT
          ================================================= */}

          <aside className="expert-profile-right">


            {/* GUIDANCE */}

            <section className="expert-profile-card">

              <div className="expert-card-heading">

                <div>

                  <span className="expert-section-label">
                    STUDENT GUIDANCE
                  </span>

                  <h2>
                    I Can Help With
                  </h2>

                </div>

              </div>


              <div className="expert-guidance-list">

                {expert.guidance.map(
                  (item, index) => (

                    <div
                      className="expert-guidance-item"
                      key={item}
                    >

                      <span>
                        0{index + 1}
                      </span>

                      <p>
                        {item}
                      </p>

                      <i className="bi bi-arrow-up-right"></i>

                    </div>

                  )
                )}

              </div>

            </section>


            {/* QUICK SNAPSHOT */}

            <section className="expert-profile-card">

              <div className="expert-card-heading">

                <div>

                  <span className="expert-section-label">
                    QUICK SNAPSHOT
                  </span>

                  <h2>
                    Professional Details
                  </h2>

                </div>

              </div>


              <div className="expert-snapshot">

                <div>

                  <span>
                    Role
                  </span>

                  <strong>
                    {expert.role}
                  </strong>

                </div>


                <div>

                  <span>
                    Company
                  </span>

                  <strong>
                    {expert.company}
                  </strong>

                </div>


                <div>

                  <span>
                    Domain
                  </span>

                  <strong>
                    {expert.domain}
                  </strong>

                </div>


                <div>

                  <span>
                    Experience
                  </span>

                  <strong>
                    {expert.experience}
                  </strong>

                </div>

              </div>

            </section>


            {/* =================================================
                AI MATCHING
            ================================================= */}

            <section className="expert-ai-card">

              <div className="expert-ai-icon">

                <i className="bi bi-stars"></i>

              </div>


              <span className="expert-section-label">
                AI EXPERT MATCHING
              </span>


              <h2>
                Is this expert right for you?
              </h2>


              <p>
                CareerCompass will later use your career
                goals, skill gaps, interests and learning
                progress to determine how relevant this
                expert is for you.
              </p>


              <div className="expert-ai-placeholder">

                <i className="bi bi-lock"></i>

                <span>
                  Personalized match score will appear
                  after AI integration.
                </span>

              </div>


              <span className="ai-ready-badge">
                AI Ready
              </span>

            </section>

          </aside>

        </div>


        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <section className="expert-bottom-cta">

          <div className="expert-bottom-icon">

            <i className="bi bi-chat-square-text"></i>

          </div>


          <div>

            <span className="expert-section-label">
              INDUSTRY CONNECTION
            </span>


            <h2>
              Want to learn from {expert.name}?
            </h2>


            <p>
              Request guidance and connect with an industry
              professional who can help you understand the
              realities of your chosen career path.
            </p>

          </div>


          <button
            onClick={handleConnect}
            className="expert-connect-button"
            type="button"
          >

            Request Guidance

            <i className="bi bi-arrow-right"></i>

          </button>

        </section>

      </main>

    </div>
  );
};

export default ExpertProfile;