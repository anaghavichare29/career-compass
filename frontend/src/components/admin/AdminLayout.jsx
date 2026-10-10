import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import "./AdminLayout.css";

const AdminLayout = ({ children, activePage = "dashboard", pageTitle = "Admin Console" }) => {
  return (
    <div className="student-layout admin-layout">
      <AdminSidebar activePage={activePage} />

      <main className="student-main admin-main">
        <AdminNavbar pageTitle={pageTitle} />

        <div className="student-content admin-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
