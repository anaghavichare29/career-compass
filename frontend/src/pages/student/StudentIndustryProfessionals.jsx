import React from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/student/StudentLayout";

const StudentIndustryProfessionals = () => {

  const professionals = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Senior Data Analyst",
      company: "Technology Company",
      experience: "8+ Years",
      skills: ["Python", "SQL", "Power BI"],
    },
    {
      id: 2,
      name: "Rahul Mehta",
      role: "Software Engineer",
      company: "Technology Company",
      experience: "6+ Years",
      skills: ["Java", "DSA", "React"],
    },
    {
      id: 3,
      name: "Sneha Patel",
      role: "Product Designer",
      company: "Technology Company",
      experience: "7+ Years",
      skills: ["Figma", "UX", "Research"],
    },
  ];

  return (
    <StudentLayout pageTitle="Industry Professionals">

      <div className="page-introduction">

        <span className="student-section-label">
          INDUSTRY CONNECT
        </span>

        <h1>Industry Professionals</h1>

        <p>
          Learn from professionals and understand
          what the industry expects.
        </p>

      </div>


      <div className="industry-search">

        <div className="search-box">
          <i className="bi bi-search"></i>

          <input
            placeholder="Search professionals..."
          />
        </div>

        <select>
          <option>All Careers</option>
          <option>Data Analyst</option>
          <option>Software Developer</option>
          <option>UI/UX Designer</option>
        </select>

      </div>


      <div className="professional-grid">

        {professionals.map((professional) => (

          <div
            className="student-card professional-card"
            key={professional.id}
          >

            <div className="professional-avatar">
              {professional.name.charAt(0)}
            </div>

            <h2>{professional.name}</h2>

            <h4>{professional.role}</h4>

            <p>{professional.company}</p>

            <span className="professional-experience">
              <i className="bi bi-briefcase"></i>
              {professional.experience}
            </span>

            <div className="skill-tags">

              {professional.skills.map((skill) => (
                <span key={skill}>
                  {skill}
                </span>
              ))}

            </div>

            <Link
              to={`/student/industry-professionals/${professional.id}`}
              className="student-primary-btn"
            >
              View Profile
              <i className="bi bi-arrow-right"></i>
            </Link>

          </div>

        ))}

      </div>

    </StudentLayout>
  );
};

export default StudentIndustryProfessionals;