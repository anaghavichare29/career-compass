import React from "react";
import StudentSidebar from "./StudentSidebar";
import StudentNavbar from "./StudentNavbar";

const StudentLayout = ({ children, pageTitle = "Dashboard" }) => {
  return (
    <div className="student-layout">
      <StudentSidebar />

      <main className="student-main">
        <StudentNavbar pageTitle={pageTitle} />

        <div className="student-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;