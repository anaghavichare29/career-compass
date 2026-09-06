import React from "react";
import StudentLayout from "../../components/student/StudentLayout";

const StudentProfessionalProfile = () => {

  return (
    <StudentLayout pageTitle="Professional Profile">

      <div className="professional-profile-header student-card">

        <div className="large-professional-avatar">
          P
        </div>

        <div className="professional-header-info">

          <span className="student-section-label">
            INDUSTRY PROFESSIONAL
          </span>

          <h1>Priya Sharma</h1>

          <h3>
            Senior Data Analyst
          </h3>

          <p>
            8+ years of industry experience
          </p>

        </div>

      </div>


      <div className="professional-tabs">

        <button className="active">
          Overview
        </button>

        <button>
          Career Journey
        </button>

        <button>
          Experience
        </button>

        <button>
          Interview Tips
        </button>

        <button>
          Industry Expectations
        </button>

      </div>


      <div className="professional-content-grid">

        <div className="student-card">

          <span className="student-section-label">
            CAREER JOURNEY
          </span>

          <h2>Career Journey</h2>

          <div className="career-timeline">

            <div>
              <strong>Senior Data Analyst</strong>
              <span>2024 – Present</span>
              <small>Technology Company</small>
            </div>

            <div>
              <strong>Data Analyst</strong>
              <span>2021 – 2024</span>
              <small>Technology Company</small>
            </div>

            <div>
              <strong>Junior Analyst</strong>
              <span>2019 – 2021</span>
              <small>Startup</small>
            </div>

          </div>

        </div>


        <div className="student-card">

          <span className="student-section-label">
            INTERVIEW TIPS
          </span>

          <h2>What helped me</h2>

          <ul className="professional-tips">

            <li>
              Master SQL fundamentals.
            </li>

            <li>
              Build strong practical projects.
            </li>

            <li>
              Understand statistics.
            </li>

            <li>
              Practice explaining your projects.
            </li>

          </ul>

        </div>

      </div>

    </StudentLayout>
  );
};

export default StudentProfessionalProfile;