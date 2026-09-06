import React, { useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import "./StudentProfile.css";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Rohit",
    lastName: "Sharma",
    email: "rohit@example.com",
    phone: "+91 98765 43210",
    college: "Vidyalankar Institute of Technology",
    course: "B.Tech Information Technology",
    year: "3rd Year",
    careerGoal: "Data Analyst",
    location: "Mumbai, India",
    bio: "B.Tech IT student interested in AI/ML, data analysis and building practical technology solutions.",
  });

  const skills = [
    "Python",
    "SQL",
    "Excel",
    "React",
    "HTML/CSS",
    "Git",
  ];

  const [newSkill, setNewSkill] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) {
      return;
    }

    setNewSkill("");
  };

  return (
    <StudentLayout pageTitle="Profile">

      <div className="student-profile-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="profile-introduction">

          <div>

            <span className="student-section-label">
              YOUR ACCOUNT
            </span>

            <h1>
              Student Profile
            </h1>

            <p>
              Manage your personal information, academic
              details, skills and career preferences.
            </p>

          </div>

          <button
            className="profile-edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            <i
              className={
                isEditing
                  ? "bi bi-x-lg"
                  : "bi bi-pencil"
              }
            ></i>

            {isEditing
              ? "Cancel Editing"
              : "Edit Profile"}
          </button>

        </section>


        {/* =================================================
            PROFILE OVERVIEW
        ================================================= */}

        <section className="profile-overview-card">

          <div className="profile-large-avatar">
            AS
          </div>


          <div className="profile-overview-info">

            <div className="profile-name-row">

              <h2>
                {profile.firstName}{" "}
                {profile.lastName}
              </h2>

              <span className="profile-role-badge">
                Student
              </span>

            </div>

            <p>
              {profile.course}
            </p>

            <span className="profile-college">
              <i className="bi bi-building"></i>
              {profile.college}
            </span>

          </div>


          <div className="profile-completion">

            <div className="profile-completion-top">

              <span>
                Profile Completion
              </span>

              <strong>
                85%
              </strong>

            </div>

            <div className="profile-completion-track">

              <div
                style={{
                  width: "85%",
                }}
              ></div>

            </div>

            <small>
              Complete your profile to improve
              personalization.
            </small>

          </div>

        </section>


        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="profile-section">

          <div className="profile-section-header">

            <div>

              <span className="student-section-label">
                PERSONAL INFORMATION
              </span>

              <h2>
                Basic Details
              </h2>

            </div>

            <i className="bi bi-person"></i>

          </div>


          <div className="profile-form-grid">

            <div className="profile-field">

              <label>
                First Name
              </label>

              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>


            <div className="profile-field">

              <label>
                Last Name
              </label>

              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>


            <div className="profile-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>


            <div className="profile-field">

              <label>
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>


            <div className="profile-field">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>


            <div className="profile-field">

              <label>
                Career Goal
              </label>

              <input
                type="text"
                name="careerGoal"
                value={profile.careerGoal}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>

          </div>

        </section>


        {/* =================================================
            ACADEMIC INFORMATION
        ================================================= */}

        <section className="profile-section">

          <div className="profile-section-header">

            <div>

              <span className="student-section-label">
                ACADEMIC INFORMATION
              </span>

              <h2>
                Education
              </h2>

            </div>

            <i className="bi bi-mortarboard"></i>

          </div>


          <div className="profile-form-grid">

            <div className="profile-field">

              <label>
                College / Institute
              </label>

              <input
                type="text"
                name="college"
                value={profile.college}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>


            <div className="profile-field">

              <label>
                Degree / Course
              </label>

              <input
                type="text"
                name="course"
                value={profile.course}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>


            <div className="profile-field">

              <label>
                Current Year
              </label>

              <input
                type="text"
                name="year"
                value={profile.year}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>

          </div>

        </section>


        {/* =================================================
            BIO
        ================================================= */}

        <section className="profile-section">

          <div className="profile-section-header">

            <div>

              <span className="student-section-label">
                ABOUT YOU
              </span>

              <h2>
                Profile Summary
              </h2>

            </div>

            <i className="bi bi-card-text"></i>

          </div>


          <div className="profile-field">

            <label>
              Bio
            </label>

            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows="4"
            />

          </div>

        </section>


        {/* =================================================
            SKILLS
        ================================================= */}

        <section className="profile-section">

          <div className="profile-section-header">

            <div>

              <span className="student-section-label">
                YOUR SKILLS
              </span>

              <h2>
                Skills & Technologies
              </h2>

            </div>

            <i className="bi bi-lightning"></i>

          </div>


          <div className="profile-skills">

            {skills.map((skill) => (

              <span
                className="profile-skill-tag"
                key={skill}
              >

                {skill}

                {isEditing && (
                  <button
                    type="button"
                    title={`Remove ${skill}`}
                  >
                    ×
                  </button>
                )}

              </span>

            ))}

          </div>


          {isEditing && (

            <div className="add-skill-row">

              <input
                type="text"
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) =>
                  setNewSkill(e.target.value)
                }
              />

              <button
                type="button"
                onClick={addSkill}
              >
                <i className="bi bi-plus-lg"></i>
                Add Skill
              </button>

            </div>

          )}

        </section>


        {/* =================================================
            CAREER PREFERENCES
        ================================================= */}

        <section className="profile-section">

          <div className="profile-section-header">

            <div>

              <span className="student-section-label">
                CAREER PREFERENCES
              </span>

              <h2>
                Your Career Direction
              </h2>

            </div>

            <i className="bi bi-compass"></i>

          </div>


          <div className="career-preference-grid">

            <div className="career-preference-card">

              <div className="career-preference-icon blue">
                <i className="bi bi-bullseye"></i>
              </div>

              <div>

                <span>
                  Target Career
                </span>

                <strong>
                  Data Analyst
                </strong>

              </div>

            </div>


            <div className="career-preference-card">

              <div className="career-preference-icon purple">
                <i className="bi bi-stars"></i>
              </div>

              <div>

                <span>
                  Interested Domain
                </span>

                <strong>
                  AI / Data
                </strong>

              </div>

            </div>


            <div className="career-preference-card">

              <div className="career-preference-icon orange">
                <i className="bi bi-briefcase"></i>
              </div>

              <div>

                <span>
                  Work Preference
                </span>

                <strong>
                  Technology
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            AI PERSONALIZATION
        ================================================= */}

        <section className="profile-ai-card">

          <div className="profile-ai-icon">

            <i className="bi bi-stars"></i>

          </div>


          <div className="profile-ai-content">

            <span className="student-section-label">
              AI PERSONALIZATION
            </span>

            <h2>
              Make CareerCompass more personalized
            </h2>

            <p>
              Your profile information can later be used by
              the AI system to personalize career
              recommendations, learning paths, skill-gap
              analysis and recommended tasks.
            </p>


            <div className="profile-ai-items">

              <span>
                <i className="bi bi-check2"></i>
                Career Recommendations
              </span>

              <span>
                <i className="bi bi-check2"></i>
                Personalized Roadmap
              </span>

              <span>
                <i className="bi bi-check2"></i>
                Skill Recommendations
              </span>

              <span>
                <i className="bi bi-check2"></i>
                Learning Suggestions
              </span>

            </div>

          </div>


          <span className="coming-soon-badge">
            AI Ready
          </span>

        </section>


        {/* =================================================
            SAVE
        ================================================= */}

        {isEditing && (

          <div className="profile-save-bar">

            <div>

              <i className="bi bi-info-circle"></i>

              <span>
                Your profile changes will be saved to
                your CareerCompass account.
              </span>

            </div>


            <button
              className="student-primary-btn"
              onClick={() =>
                setIsEditing(false)
              }
            >

              <i className="bi bi-check-lg"></i>

              Save Changes

            </button>

          </div>

        )}

      </div>

    </StudentLayout>
  );
};

export default StudentProfile;