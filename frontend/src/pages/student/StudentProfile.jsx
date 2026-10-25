import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import api from "../../services/api";
import "./StudentProfile.css";

const StudentProfile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const selectedCareer = JSON.parse(localStorage.getItem("selectedCareer") || "null");
  const targetCareerName = selectedCareer?.career_name || "";
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [profile, setProfile] = useState({
    firstName: user?.first_name || "Student",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: "",
    college: "",
    course: "",
    year: "",
    careerGoal: "",
    location: "",
    bio: "",
  });

  const [skills, setSkills] = useState([]);

  const [completion, setCompletion] = useState(0);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api
      .get(`students/profile/?user_id=${user.user_id}`)
      .then((res) => {
        const d = res.data;
        setProfile({
          firstName: d.firstName || user.first_name || "",
          lastName: d.lastName || user.last_name || "",
          email: d.email || user.email || "",
          phone: d.phone || "",
          college: d.college || "",
          course: d.course || "",
          year: d.year || "",
          careerGoal: d.careerGoal || "",
          location: d.location || "",
          bio: d.bio || "",
        });
        setSkills(Array.isArray(d.skills) ? d.skills : []);
        setCompletion(Number.isFinite(d.completion) ? d.completion : 0);
      })
      .catch((err) => {
        console.error("Failed to fetch student profile:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addSkill = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    if (skills.includes(trimmed)) {
      setNewSkill("");
      return;
    }

    try {
      if (user) {
        await api.post("students/skills/", {
          user_id: user.user_id,
          skill_name: trimmed,
        });
      }
      setSkills((prev) => [...prev, trimmed]);
      setNewSkill("");
    } catch (err) {
      console.error("Failed to add skill:", err);
      setStatusMessage(err.response?.data?.detail || "Could not save this skill. Please try again.");
    }
  };

  const removeSkill = async (skillToRemove) => {
    try {
      if (user) {
        await api.delete(
          `students/skills/?user_id=${user.user_id}&skill_name=${encodeURIComponent(skillToRemove)}`
        );
      }
      setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    } catch (err) {
      console.error("Failed to remove skill:", err);
      setStatusMessage(err.response?.data?.detail || "Could not remove this skill. Please try again.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage("");

    try {
      if (user) {
        await api.put("students/profile/", {
          user_id: user.user_id,
          ...profile,
        });

        // Update local storage user names
        user.first_name = profile.firstName;
        user.last_name = profile.lastName;
        localStorage.setItem("user", JSON.stringify(user));
      }

      setIsEditing(false);
      setStatusMessage("Profile updated successfully!");
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setStatusMessage(err.response?.data?.detail || err.response?.data?.error || "Could not save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase() ||
    "ST";

  return (
    <StudentLayout pageTitle="Profile">
      <div className="student-profile-page">
        {/* =================================================
            HEADER
        ================================================= */}
        <section className="profile-introduction">
          <div>
            <span className="student-section-label">YOUR ACCOUNT</span>
            <h1>Student Profile</h1>
            <p>
              Manage your personal information, academic details, skills and career preferences.
            </p>
            {statusMessage && (
              <span style={{ display: "inline-block", marginTop: "0.5rem", color: "#10b981", fontWeight: "600", fontSize: "0.9rem" }}>
                <i className="bi bi-check-circle-fill" style={{ marginRight: "0.4rem" }}></i>
                {statusMessage}
              </span>
            )}
          </div>

          <button
            className="profile-edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            <i className={isEditing ? "bi bi-x-lg" : "bi bi-pencil"}></i>
            {isEditing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </section>

        {/* =================================================
            PROFILE OVERVIEW
        ================================================= */}
        <section className="profile-overview-card">
          <div className="profile-large-avatar">{initials}</div>

          <div className="profile-overview-info">
            <div className="profile-name-row">
              <h2>
                {profile.firstName} {profile.lastName}
              </h2>
              <span className="profile-role-badge">Student</span>
            </div>

            <p>{profile.course || "Degree in Progress"}</p>

            <span className="profile-college">
              <i className="bi bi-building"></i>
              {profile.college || "Educational Institution"}
            </span>
          </div>

          <div className="profile-completion">
            <div className="profile-completion-top">
              <span>Profile Completion</span>
              <strong>{completion}%</strong>
            </div>

            <div className="profile-completion-track">
              <div style={{ width: `${completion}%` }}></div>
            </div>

            <small>Complete your profile to improve personalization.</small>
          </div>
        </section>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}
        <section className="profile-section">
          <div className="profile-section-header">
            <div>
              <span className="student-section-label">PERSONAL INFORMATION</span>
              <h2>Basic Details</h2>
            </div>
            <i className="bi bi-person"></i>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-field">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={true}
              />
            </div>

            <div className="profile-field">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-field">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-field">
              <label>Career Goal</label>
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
              <span className="student-section-label">ACADEMIC INFORMATION</span>
              <h2>Education & Qualifications</h2>
            </div>
            <i className="bi bi-mortarboard"></i>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label>College / Institute</label>
              <input
                type="text"
                name="college"
                value={profile.college}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-field">
              <label>Degree / Course</label>
              <input
                type="text"
                name="course"
                value={profile.course}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-field">
              <label>Current Year / Semester</label>
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
              <span className="student-section-label">ABOUT YOU</span>
              <h2>Profile Summary</h2>
            </div>
            <i className="bi bi-card-text"></i>
          </div>

          <div className="profile-field">
            <label>Bio</label>
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
              <span className="student-section-label">YOUR SKILLS</span>
              <h2>Skills & Technologies</h2>
            </div>
            <i className="bi bi-lightning"></i>
          </div>

          <div className="profile-skills">
            {skills.map((skill) => (
              <span className="profile-skill-tag" key={skill}>
                {skill}
                {isEditing && (
                  <button
                    type="button"
                    title={`Remove ${skill}`}
                    onClick={() => removeSkill(skill)}
                    style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "6px", color: "inherit", fontWeight: "bold" }}
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
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button type="button" onClick={addSkill}>
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
              <span className="student-section-label">CAREER PREFERENCES</span>
              <h2>Your Career Direction</h2>
            </div>
            <i className="bi bi-compass"></i>
          </div>

          <div className="career-preference-grid">
            <div className="career-preference-card">
              <div className="career-preference-icon blue">
                <i className="bi bi-bullseye"></i>
              </div>
              <div>
                <span>Target Career</span>
                <strong>{targetCareerName || profile.careerGoal || "Not selected yet"}</strong>
              </div>
            </div>

            <div className="career-preference-card">
              <div className="career-preference-icon purple">
                <i className="bi bi-stars"></i>
              </div>
              <div>
                <span>Interested Domain</span>
                <strong>Technology & Data</strong>
              </div>
            </div>

            <div className="career-preference-card">
              <div className="career-preference-icon orange">
                <i className="bi bi-briefcase"></i>
              </div>
              <div>
                <span>Work Preference</span>
                <strong>Industry Practice</strong>
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
            <span className="student-section-label">AI PERSONALIZATION</span>
            <h2>Make CareerCompass more personalized</h2>
            <p>
              Your profile information is used by the AI system to personalize career
              recommendations, learning paths, skill-gap analysis and recommended tasks.
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

          <span className="coming-soon-badge">AI Connected</span>
        </section>

        {/* =================================================
            SAVE
        ================================================= */}
        {isEditing && (
          <div className="profile-save-bar">
            <div>
              <i className="bi bi-info-circle"></i>
              <span>Your profile changes will be saved to your CareerCompass account.</span>
            </div>

            <button
              className="student-primary-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <i className="bi bi-check-lg"></i>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;