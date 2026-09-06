import React, { useState } from "react";
import "./guidance-request.css";

const expertsData = {
  1: {
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Google",
    domain: "AI / Machine Learning",
    initials: "PS",
  },
  2: {
    name: "Rahul Mehta",
    role: "Data Scientist",
    company: "Microsoft",
    domain: "Data Science",
    initials: "RM",
  },
  3: {
    name: "Neha Shah",
    role: "Product Manager",
    company: "Adobe",
    domain: "Product Management",
    initials: "NS",
  },
  4: {
    name: "Arjun Kapoor",
    role: "Cybersecurity Engineer",
    company: "Cisco",
    domain: "Cybersecurity",
    initials: "AK",
  },
  5: {
    name: "Aisha Khan",
    role: "Cloud Engineer",
    company: "Amazon Web Services",
    domain: "Cloud Computing",
    initials: "AK",
  },
  6: {
    name: "Rohan Desai",
    role: "Full Stack Developer",
    company: "Infosys",
    domain: "Web Development",
    initials: "RD",
  },
};

function GuidanceRequest() {
  const pathParts = window.location.pathname.split("/");
  const expertId = Number(pathParts[2]);

  const expert =
    expertsData[expertId] || expertsData[1];

  const [formData, setFormData] = useState({
    topic: "",
    message: "",
    goals: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    /*
      FRONTEND PLACEHOLDER

      Later this will send the request to Django/backend.

      Example future flow:

      Student
        ↓
      Guidance Request
        ↓
      Django API
        ↓
      Industry Expert
        ↓
      Request Status
    */

    setSubmitted(true);
  };

  const goBack = () => {
    window.location.href =
      `/industry-experts/${expertId}`;
  };

  if (submitted) {
    return (
      <div className="guidance-page">

        <header className="guidance-header">

          <div className="guidance-brand">
            CareerCompass
          </div>

          <div className="guidance-profile">

            <div className="guidance-avatar">
              A
            </div>

            <span>
              Student
            </span>

          </div>

        </header>


        <main className="guidance-content">

          <section className="guidance-success-card">

            <div className="success-icon">
              <i className="bi bi-check-lg"></i>
            </div>

            <span className="guidance-label">
              REQUEST SUBMITTED
            </span>

            <h1>
              Your guidance request has been sent
            </h1>

            <p>
              Your request to connect with{" "}
              <strong>{expert.name}</strong> has been
              recorded successfully.
            </p>

            <p className="success-note">
              Once the industry expert responds, the
              request status will be updated here.
            </p>

            <div className="request-status">

              <div className="status-item active">
                <span>1</span>
                <div>
                  <strong>Request Submitted</strong>
                  <small>Completed</small>
                </div>
              </div>

              <div className="status-line"></div>

              <div className="status-item">
                <span>2</span>
                <div>
                  <strong>Expert Review</strong>
                  <small>Pending</small>
                </div>
              </div>

              <div className="status-line"></div>

              <div className="status-item">
                <span>3</span>
                <div>
                  <strong>Connection</strong>
                  <small>Pending</small>
                </div>
              </div>

            </div>

            <button
              className="guidance-primary-button"
              onClick={() =>
                (window.location.href =
                  `/industry-experts/${expertId}`)
              }
            >
              Back to Expert Profile
              <i className="bi bi-arrow-right"></i>
            </button>

          </section>

        </main>

      </div>
    );
  }

  return (
    <div className="guidance-page">

      {/* HEADER */}

      <header className="guidance-header">

        <div className="guidance-brand">
          CareerCompass
        </div>

        <div className="guidance-profile">

          <div className="guidance-avatar">
            A
          </div>

          <span>
            Student
          </span>

        </div>

      </header>


      {/* CONTENT */}

      <main className="guidance-content">

        <button
          className="guidance-back-button"
          onClick={goBack}
          type="button"
        >
          <i className="bi bi-arrow-left"></i>
          Back to Expert Profile
        </button>


        <section className="guidance-layout">


          {/* LEFT */}

          <div className="guidance-main">


            <div className="guidance-intro">

              <span className="guidance-label">
                INDUSTRY CONNECTION
              </span>

              <h1>
                Request Guidance
              </h1>

              <p>
                Tell the expert what you would like
                guidance with. Providing more context
                helps make the conversation more useful.
              </p>

            </div>


            {/* EXPERT */}

            <div className="selected-expert-card">

              <div className="selected-expert-avatar">
                {expert.initials}
              </div>

              <div>

                <div className="selected-name">
                  {expert.name}

                  <span>
                    ✓
                  </span>
                </div>

                <p>
                  {expert.role} · {expert.company}
                </p>

                <small>
                  {expert.domain}
                </small>

              </div>

            </div>


            {/* FORM */}

            <form
              className="guidance-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">

                <label>
                  What would you like guidance on?
                </label>

                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a topic
                  </option>

                  <option value="career">
                    Career Path
                  </option>

                  <option value="skills">
                    Skills & Technologies
                  </option>

                  <option value="projects">
                    Projects & Portfolio
                  </option>

                  <option value="interviews">
                    Interview Preparation
                  </option>

                  <option value="industry">
                    Industry Insights
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  What are your goals?
                </label>

                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  placeholder="Tell the expert what you are currently working towards..."
                  rows="4"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Message to the expert
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write a short message explaining what you would like help with..."
                  rows="5"
                  required
                />

              </div>


              <div className="form-actions">

                <button
                  type="button"
                  className="guidance-secondary-button"
                  onClick={goBack}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="guidance-primary-button"
                >
                  Send Request
                  <i className="bi bi-arrow-right"></i>
                </button>

              </div>

            </form>

          </div>


          {/* RIGHT */}

          <aside className="guidance-sidebar">


            {/* AI PLACEHOLDER */}

            <section className="guidance-ai-card">

              <div className="guidance-ai-icon">
                <i className="bi bi-stars"></i>
              </div>

              <span className="guidance-label">
                AI PERSONALIZATION
              </span>

              <h2>
                Personalized guidance
              </h2>

              <p>
                Future AI integration can analyze your
                career goals, assessment results, roadmap
                progress and skill gaps to help personalize
                this request.
              </p>

              <div className="ai-suggestion-placeholder">

                <i className="bi bi-lock"></i>

                <div>

                  <strong>
                    AI suggestion
                  </strong>

                  <span>
                    A personalized topic or question
                    suggestion will appear here.
                  </span>

                </div>

              </div>

              <span className="ai-ready-badge">
                AI Ready
              </span>

            </section>


            {/* TIPS */}

            <section className="guidance-tips-card">

              <span className="guidance-label">
                REQUEST TIPS
              </span>

              <h2>
                Make your request useful
              </h2>

              <div className="guidance-tip">

                <i className="bi bi-check-circle"></i>

                <span>
                  Be specific about what you want to learn.
                </span>

              </div>

              <div className="guidance-tip">

                <i className="bi bi-check-circle"></i>

                <span>
                  Mention your current skill level.
                </span>

              </div>

              <div className="guidance-tip">

                <i className="bi bi-check-circle"></i>

                <span>
                  Explain what outcome you are looking for.
                </span>

              </div>

            </section>


          </aside>

        </section>

      </main>

    </div>
  );
}

export default GuidanceRequest;