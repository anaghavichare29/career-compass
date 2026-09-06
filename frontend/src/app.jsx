import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssessment from "./pages/student/StudentAssessment";
import StudentRecommendations from "./pages/student/StudentRecommendations";
import StudentRoadmap from "./pages/student/StudentRoadmap";
import StudentTasks from "./pages/student/StudentTasks";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import StudentSkillGap from "./pages/student/StudentSkillGap";
import StudentCareerReadiness from "./pages/student/StudentCareerReadiness";
import StudentProfile from "./pages/student/StudentProfile";

import IndustryExperts from "./pages/professional/IndustryExperts";
import ExpertProfile from "./pages/professional/ExpertProfile";
import GuidanceRequest from "./pages/professional/GuidanceRequest";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminExperts from "./pages/admin/AdminExperts";


function App() {
  const path = window.location.pathname;


  /* =========================
     AUTH
  ========================= */

  if (path === "/register") {
    return <Register />;
  }


  /* =========================
     STUDENT
  ========================= */

  if (path === "/student/dashboard") {
    return <StudentDashboard />;
  }

  if (path === "/student/assessment") {
    return <StudentAssessment />;
  }

  if (path === "/student/recommendations") {
    return <StudentRecommendations />;
  }

  if (path === "/student/roadmap") {
    return <StudentRoadmap />;
  }

  if (path === "/student/tasks") {
    return <StudentTasks />;
  }

  if (path === "/student/quizzes") {
    return <StudentQuizzes />;
  }

  if (path === "/student/skill-gap") {
    return <StudentSkillGap />;
  }

  if (path === "/student/career-readiness") {
    return <StudentCareerReadiness />;
  }

  if (path === "/student/profile") {
    return <StudentProfile />;
  }


  /* =========================
     INDUSTRY EXPERTS
  ========================= */

  if (path === "/industry-experts/dashboard") {
    return <IndustryExperts />;
  }

  if (
  path.startsWith("/industry-experts/") &&
  path.endsWith("/guidance")
) {
  return <GuidanceRequest />;
}



  if (path.startsWith("/industry-experts/")) {
    return <ExpertProfile />;
  }


  if (path === "/admin/dashboard") {
  return <AdminDashboard />;
}

if (path === "/admin/students") {
  return <AdminStudents />;
}

if (path === "/admin/experts") {
  return <AdminExperts />;
}

  /* =========================
     DEFAULT
  ========================= */

  return <Login />;
}


export default App;