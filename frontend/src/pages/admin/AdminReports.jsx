import React, { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";
import { Card, EmptyState, Loading, PageHeader, Progress, StatCard } from "../../components/ui/ui";
import "./Admin.css";

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get("admin-portal/analytics/")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const o = data?.overview;
  const domains = data?.domainDistribution || [];
  const months = data?.monthlyEngagement || [];

  return (
    <AdminLayout activePage="reports" pageTitle="Reports & Analytics">
      <main className="adm-page">
        <PageHeader
          eyebrow="Platform intelligence"
          title="Reports & Performance"
          subtitle="Student assessments, quiz performance, mentor activity and engagement over time."
        />

        {loading ? (
          <Card><Loading label="Loading reports..." /></Card>
        ) : error || !o ? (
          <Card>
            <EmptyState icon="bi-exclamation-triangle" title="Could not load analytics">
              Check that the backend is running and try again.
            </EmptyState>
          </Card>
        ) : (
          <>
            <div className="cc-grid cc-grid--4 adm-section">
              <StatCard icon="bi-check2-square" tone="green" label="Task completion" value={`${o.taskCompletionRate}%`} hint="Overall coursework progress" />
              <StatCard icon="bi-patch-question" tone="purple" label="Average quiz score" value={`${o.averageQuizScore}%`} hint={`Across ${o.totalQuizAttempts} attempts`} />
              <StatCard icon="bi-chat-dots" tone="orange" label="Mentor response rate" value={`${o.mentorResponseRate}%`} hint="Guidance requests answered" />
              <StatCard icon="bi-person-badge" tone="blue" label="Platform mentors" value={o.totalMentors} hint={`${o.totalStudents} students enrolled`} />
            </div>

            <div className="adm-split adm-split--even">
              <Card title="Student career domains" subtitle="Where students' top career matches fall">
                {domains.length === 0 ? (
                  <EmptyState icon="bi-pie-chart" title="No data yet">Domains appear once students finish the assessment.</EmptyState>
                ) : (
                  <div className="adm-meter">
                    {domains.map((d) => (
                      <div className="adm-meter__row" key={d.domain}>
                        <div><strong>{d.domain}</strong><span>{d.percentage}%</span></div>
                        <Progress value={d.percentage} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card flush title="Monthly engagement" subtitle="Assessments, quizzes and guidance requests">
                {months.length === 0 ? (
                  <EmptyState icon="bi-graph-up" title="No data yet">Monthly activity will be listed here.</EmptyState>
                ) : (
                  <div className="cc-table-wrap">
                    <table className="cc-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th className="cc-num">Assessments</th>
                          <th className="cc-num">Quizzes</th>
                          <th className="cc-num">Guidance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {months.map((m) => (
                          <tr key={m.month}>
                            <td><strong className="adm-strong">{m.month}</strong></td>
                            <td className="cc-num">{m.assessments}</td>
                            <td className="cc-num">{m.quizzes}</td>
                            <td className="cc-num">{m.guidance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminReports;
