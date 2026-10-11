import React, { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";
import { Badge, Card, EmptyState, Loading, PageHeader, Segmented, toneForStatus } from "../../components/ui/ui";
import "./Admin.css";

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("quizzes");

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        api.get("admin-portal/quizzes/"),
        api.get("admin-portal/assessments/"),
      ]);
      setQuizzes(qRes.data);
      setAssessments(aRes.data);
    } catch (err) {
      console.error("Failed to load quizzes & assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`admin-portal/quizzes/?id=${quizId}`);
      loadData();
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      alert("Failed to delete quiz.");
    }
  };

  return (
    <AdminLayout activePage="quizzes" pageTitle="Quizzes & Tests">
      <main className="adm-page">
      <PageHeader
        eyebrow="Content"
        title="Quizzes & Assessment Activity"
        subtitle="Monitor student assessments, review platform quizzes and keep quiz quality high."
        actions={
          <Segmented
            value={activeSubTab}
            onChange={setActiveSubTab}
            options={[
              { value: "quizzes", label: `Platform Quizzes (${quizzes.length})` },
              { value: "assessments", label: `Student Submissions (${assessments.length})` },
            ]}
          />
        }
      />

      {activeSubTab === "quizzes" ? (
        <Card flush title={`All platform quizzes (${quizzes.length})`}>
          {loading ? (
            <Loading label="Loading quizzes..." />
          ) : quizzes.length === 0 ? (
            <EmptyState icon="bi-clipboard2-check" title="No quizzes yet">
              Quizzes are generated for students from their roadmap skills.
            </EmptyState>
          ) : (
            <div className="cc-table-wrap">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Skill focus</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Difficulty</th>
                    <th className="cc-num">Questions</th>
                    <th>Author</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <strong className="adm-strong">{q.title}</strong>
                        <small className="cc-muted adm-block">{q.durationMinutes} min</small>
                      </td>
                      <td><span className="adm-career">{q.skill}</span></td>
                      <td>
                        <Badge tone={q.source === "ai" ? "purple" : "blue"}>
                          {q.source === "ai" ? "AI generated" : "Student"}
                        </Badge>
                      </td>
                      <td><Badge tone={toneForStatus(q.status)} dot>{q.status}</Badge></td>
                      <td>{q.difficulty}</td>
                      <td className="cc-num"><strong>{q.questionsCount}</strong></td>
                      <td>
                        <div>{q.author}</div>
                        <small className="cc-muted">{q.authorRole}</small>
                      </td>
                      <td>
                        <div className="cc-actions">
                          <button className="cc-btn cc-btn--danger-soft cc-btn--sm" onClick={() => handleDeleteQuiz(q.id)}>
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card flush title={`Student assessment submissions (${assessments.length})`}>
          {loading ? (
            <Loading label="Loading submissions..." />
          ) : assessments.length === 0 ? (
            <EmptyState icon="bi-clipboard-data" title="No submissions yet">
              Completed career assessments will show up here.
            </EmptyState>
          ) : (
            <div className="cc-table-wrap">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Recommended career</th>
                    <th className="cc-num">Match</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id}>
                      <td><strong className="adm-strong">{a.studentName}</strong></td>
                      <td className="cc-muted">{a.email}</td>
                      <td><span className="adm-career">{a.recommendedCareer}</span></td>
                      <td className="cc-num"><strong className="adm-good">{a.matchPercent}%</strong></td>
                      <td className="cc-muted cc-text-sm">{a.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
      </main>
    </AdminLayout>
  );
};

export default AdminQuizzes;
