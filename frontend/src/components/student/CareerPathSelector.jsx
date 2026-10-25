import React, { useEffect, useState } from "react";
import api from "../../services/api";

const CareerPathSelector = ({ onCareerChange, selectedCareerName }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [recommendations, setRecommendations] = useState([]);
  const [activeCareer, setActiveCareer] = useState(null);

  useEffect(() => {
    const fetchCareers = async () => {
      if (!user?.user_id) return;
      try {
        const res = await api.get("careers/", { params: { user_id: user.user_id } });
        const recs = res.data || [];
        setRecommendations(recs);

        const saved = JSON.parse(localStorage.getItem("selectedCareer") || "null");
        if (saved && recs.some((r) => r.career_name === saved.career_name || r.id === saved.id)) {
          setActiveCareer(saved);
        } else if (recs.length > 0) {
          const first = recs[0];
          setActiveCareer(first);
          localStorage.setItem("selectedCareer", JSON.stringify(first));
          if (onCareerChange) onCareerChange(first);
        }
      } catch (err) {
        console.error("Failed to load career recommendations in selector:", err);
      }
    };

    fetchCareers();

    const handleCareerChange = (e) => {
      if (e.detail) {
        setActiveCareer(e.detail);
      }
    };
    window.addEventListener("selectedCareerChanged", handleCareerChange);
    return () => window.removeEventListener("selectedCareerChanged", handleCareerChange);
  }, [user?.user_id]);

  // If parent passes selectedCareerName and it doesn't match activeCareer, sync it
  useEffect(() => {
    if (selectedCareerName && activeCareer?.career_name !== selectedCareerName) {
      const match = recommendations.find((r) => r.career_name?.toLowerCase() === selectedCareerName?.toLowerCase());
      if (match) {
        setActiveCareer(match);
      }
    }
  }, [selectedCareerName, recommendations]);

  const handleSelect = (career) => {
    setActiveCareer(career);
    localStorage.setItem("selectedCareer", JSON.stringify(career));
    window.dispatchEvent(new CustomEvent("selectedCareerChanged", { detail: career }));
    if (onCareerChange) {
      onCareerChange(career);
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
        border: "1px solid #c7d2fe",
        borderRadius: "14px",
        padding: "14px 18px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#4f46e5",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            flexShrink: 0,
          }}
        >
          <i className="bi bi-compass"></i>
        </div>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Current Career Track
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <strong style={{ fontSize: "16px", color: "#1e1b4b" }}>
              {activeCareer?.career_name || "Select Career Path"}
            </strong>
            {activeCareer?.match_percent && (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                {activeCareer.match_percent}% Match
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
          Switch track:
        </span>
        <select
          value={activeCareer?.career_name || ""}
          onChange={(e) => {
            const found = recommendations.find((r) => r.career_name === e.target.value);
            if (found) handleSelect(found);
          }}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            color: "#1e293b",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {recommendations.map((rec) => (
            <option key={rec.id || rec.career_name} value={rec.career_name}>
              {rec.career_name} ({rec.match_percent}%)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CareerPathSelector;
