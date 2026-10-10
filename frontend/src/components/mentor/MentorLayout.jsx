import React from "react";
import MentorSidebar from "./MentorSidebar";
import MentorNavbar from "./MentorNavbar";
import "./MentorLayout.css";

const MentorLayout = ({ children, activePage = "directory", pageTitle = "Industry Experts Directory" }) => {
  return (
    <div className="student-layout mentor-layout">
      <MentorSidebar activePage={activePage} />

      <main className="student-main mentor-main">
        <MentorNavbar pageTitle={pageTitle} />

        <div className="student-content mentor-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MentorLayout;
