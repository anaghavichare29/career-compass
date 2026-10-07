import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminStudents.css";

const AdminCareers = () => {
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add career form
  const [showAddCareer, setShowAddCareer] = useState(false);
  const [careerName, setCareerName] = useState("");
  const [careerDesc, setCareerDesc] = useState("");
  const [careerSkills, setCareerSkills] = useState("");
  const [careerTags, setCareerTags] = useState("");

  // Add skill form
  const [skillName, setSkillName] = useState("");
  const [skillCat, setSkillCat] = useState("Programming");

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        api.get("admin-portal/careers/"),
        api.get("admin-portal/skills/"),
      ]);
      setCareers(cRes.data);
      setSkills(sRes.data);
    } catch (err) {
      console.error("Failed to load careers/skills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCareer = async (e) => {
    e.preventDefault();
    try {
      await api.post("admin-portal/careers/", {
        name: careerName.trim(),
        description: careerDesc.trim(),
        requiredSkills: careerSkills.trim(),
        tags: careerTags.trim(),
      });
      alert("Career created successfully!");
      setShowAddCareer(false);
      setCareerName("");
      setCareerDesc("");
      setCareerSkills("");
      setCareerTags("");
      loadData();
    } catch (err) {
      console.error("Failed to create career:", err);
      alert("Failed to save career.");
    }
  };

  const handleDeleteCareer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this career?")) return;
    try {
      await api.delete(`admin-portal/careers/?id=${id}`);
      loadData();
    } catch (err) {
      console.error("Failed to delete career:", err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    try {
      await api.post("admin-portal/skills/", {
        name: skillName.trim(),
        category: skillCat,
      });
      setSkillName("");
      loadData();
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await api.delete(`admin-portal/skills/?id=${id}`);
      loadData();
    } catch (err) {
      console.error("Failed to delete skill:", err);
    }
  };

  return (
    <div className="admin-students-page">
      <header className="admin-header">
        <div className="admin-brand">
          <h1 onClick={() => (window.location.href = "/admin/dashboard")} style={{ cursor: "pointer" }}>
            CareerCompass <span style={{ fontSize: "14px", fontWeight: "600", color: "#2f5bea", background: "#eff6ff", padding: "3px 8px", borderRadius: "6px" }}>ADMIN</span>
          </h1>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button onClick={() => (window.location.href = "/admin/dashboard")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Dashboard
          </button>
          <button onClick={() => (window.location.href = "/admin/students")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Students
          </button>
          <button onClick={() => (window.location.href = "/admin/experts")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Experts
          </button>
          <button onClick={() => (window.location.href = "/admin/careers")} style={{ background: "none", border: "none", fontWeight: "700", color: "#2f5bea", cursor: "pointer", fontSize: "14px" }}>
            Careers & Skills
          </button>
          <button onClick={() => (window.location.href = "/admin/quizzes")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Quizzes & Tests
          </button>
          <button onClick={() => (window.location.href = "/admin/announcements")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Announcements & Moderation
          </button>
          <button onClick={() => (window.location.href = "/admin/reports")} style={{ background: "none", border: "none", fontWeight: "600", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>
            Reports & Analytics
          </button>
        </div>
      </header>

      <main className="admin-students-content">
        <button className="admin-back-button" onClick={() => (window.location.href = "/admin/dashboard")}>
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>

        <section className="admin-page-heading">
          <div>
            <span className="admin-section-label">CURRICULUM & PATHWAYS</span>
            <h2>Manage Career Tracks & Associated Skills</h2>
            <p>Define career pathways, assign required skills for recommendations, and manage platform skill taxonomy.</p>
          </div>

          <button className="admin-primary-button" onClick={() => setShowAddCareer(true)}>
            <i className="bi bi-plus-lg"></i> Add New Career Option
          </button>
        </section>

        {/* Careers Grid */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {careers.map((c) => (
            <div key={c.id} style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a" }}>{c.name}</h3>
                <button
                  onClick={() => handleDeleteCareer(c.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}
                  title="Delete Career"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>

              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5", margin: "6px 0 14px" }}>{c.description}</p>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Required Skills:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {c.skillsList?.map((s) => (
                    <span key={s} style={{ background: "#eff6ff", color: "#2563eb", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Skills Taxonomy Section */}
        <section style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Platform Skills Directory</h3>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>Skills available for assessment mapping and roadmap generation.</p>
            </div>
          </div>

          <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Skill name (e.g., PyTorch, GraphQL, UX Wireframing)"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              style={{ flex: 1, minWidth: "240px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            />
            <select
              value={skillCat}
              onChange={(e) => setSkillCat(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            >
              <option value="Programming">Programming</option>
              <option value="Database">Database</option>
              <option value="AI">AI & Data Science</option>
              <option value="Web">Web Development</option>
              <option value="Cloud">Cloud & DevOps</option>
              <option value="Security">Cybersecurity</option>
              <option value="Soft Skills">Soft Skills & Communication</option>
              <option value="Design">Product & UX Design</option>
            </select>
            <button type="submit" className="admin-primary-button">
              <i className="bi bi-plus-lg"></i> Add Skill
            </button>
          </form>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {skills.map((s) => (
              <span
                key={s.id}
                style={{
                  background: "#f1f5f9",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <strong>{s.name}</strong>
                <small style={{ color: "#64748b" }}>({s.category})</small>
                <button
                  onClick={() => handleDeleteSkill(s.id)}
                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* ADD CAREER MODAL */}
      {showAddCareer && (
        <div className="student-modal-overlay">
          <div className="student-modal" style={{ maxWidth: "520px" }}>
            <div className="student-modal-header">
              <h3>Add Career Option</h3>
              <button className="modal-close" onClick={() => setShowAddCareer(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCareer} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Career Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DevOps Engineer / Blockchain Developer"
                  value={careerName}
                  onChange={(e) => setCareerName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Required Skills (comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Linux, CI/CD, Docker, Kubernetes, AWS"
                  value={careerSkills}
                  onChange={(e) => setCareerSkills(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the career responsibilities and scope..."
                  value={careerDesc}
                  onChange={(e) => setCareerDesc(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Tags</label>
                <input
                  type="text"
                  placeholder="e.g., devops, cloud, infrastructure"
                  value={careerTags}
                  onChange={(e) => setCareerTags(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="student-modal-secondary" onClick={() => setShowAddCareer(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-primary-button">
                  Save Career
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCareers;
