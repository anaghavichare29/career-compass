import React, { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";
import { Avatar, Badge, Card, EmptyState, Loading, PageHeader, Progress, StatCard, toneForStatus } from "../../components/ui/ui";
import "./Admin.css";

const MODULES = [
  { href: "/admin/students", icon: "bi-people", tone: "blue", title: "Manage Students", sub: "View, filter and activate accounts" },
  { href: "/admin/experts", icon: "bi-person-badge", tone: "purple", title: "Verify Mentors", sub: "Approve mentor verification requests" },
  { href: "/admin/careers", icon: "bi-diagram-3", tone: "green", title: "Careers & Skills", sub: "Configure career paths and skills" },
  { href: "/admin/quizzes", icon: "bi-clipboard2-check", tone: "orange", title: "Quizzes & Assessments", sub: "Monitor questions and submissions" },
  { href: "/admin/announcements", icon: "bi-megaphone", tone: "blue", title: "Announcements", sub: "Broadcast notices, handle complaints" },
  { href: "/admin/reports", icon: "bi-bar-chart-line", tone: "teal", title: "Reports & Analytics", sub: "Performance and engagement" },
];

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const firstName = user?.first_name || "Admin";

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [expertRequests, setExpertRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, studentsRes, expertsRes] = await Promise.all([
          api.get("admin-portal/stats/").catch(() => null),
          api.get("admin-portal/students/").catch(() => null),
          api.get("admin-portal/experts/").catch(() => null),
        ]);

        if (statsRes?.data?.stats) setStats(statsRes.data.stats);
        if (Array.isArray(statsRes?.data?.activity)) setActivity(statsRes.data.activity);
        if (studentsRes?.data) setRecentStudents(studentsRes.data.slice(0, 5));
        if (expertsRes?.data) setExpertRequests(expertsRes.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const peak = Math.max(1, ...activity.flatMap((d) => [d.signups, d.assessments]));
  const hasActivity = activity.some((d) => d.signups > 0 || d.assessments > 0);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

  return (
    <AdminLayout activePage="dashboard" pageTitle="Dashboard">
      <main className="adm-page">
        <PageHeader
          eyebrow="Administration"
          title={`Welcome back, ${firstName}`}
          subtitle="Monitor platform activity, verify industry mentors, oversee career paths and manage students."
          actions={<span className="cc-chip"><i className="bi bi-calendar3"></i> {today}</span>}
        />

        <div className="cc-grid cc-grid--4 adm-section">
          {stats
            ? stats.map((s) => (
                <StatCard key={s.label} icon={s.icon} tone={s.type} label={s.label} value={s.value} hint={s.change} />
              ))
            : ["Total Students", "Industry Experts", "Active Quizzes", "Assessments Done"].map((label, i) => (
                <StatCard key={label} icon={["bi-people", "bi-person-badge", "bi-book", "bi-clipboard-check"][i]} tone={["blue", "purple", "green", "orange"][i]} label={label} value={loading ? "…" : "—"} />
              ))}
        </div>

        <div className="adm-split">
          <Card
            title="Platform activity"
            subtitle="New sign-ups and completed assessments, last 7 days"
            action={
              <div className="adm-legend">
                <span><i style={{ background: "var(--cc-brand-600)" }}></i>Sign-ups</span>
                <span><i style={{ background: "var(--cc-purple-600)" }}></i>Assessments</span>
              </div>
            }
          >
            {loading ? (
              <Loading label="Loading activity..." />
            ) : !hasActivity ? (
              <EmptyState icon="bi-bar-chart" title="No activity in the last 7 days">
                Sign-ups and assessments will appear here as students use the platform.
              </EmptyState>
            ) : (
              <div className="adm-bars">
                {activity.map((d) => (
                  <div className="adm-bars__col" key={d.day}>
                    <div className="adm-bars__pair">
                      <div className="adm-bars__bar" style={{ height: `${(d.signups / peak) * 100}%`, background: "var(--cc-brand-600)" }}>{d.signups > 0 && <b>{d.signups}</b>}</div>
                      <div className="adm-bars__bar" style={{ height: `${(d.assessments / peak) * 100}%`, background: "var(--cc-purple-600)" }}>{d.assessments > 0 && <b>{d.assessments}</b>}</div>
                    </div>
                    <span className="adm-bars__day">{d.day}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Quick modules" subtitle="Jump to a management area">
            <nav className="adm-quick">
              {MODULES.map((m) => (
                <a key={m.href} href={m.href}>
                  <div className={`cc-stat__icon cc-tone-${m.tone}`}><i className={`bi ${m.icon}`}></i></div>
                  <div>
                    <strong>{m.title}</strong>
                    <span className="sub">{m.sub}</span>
                  </div>
                  <i className="bi bi-arrow-right"></i>
                </a>
              ))}
            </nav>
          </Card>
        </div>

        <div className="adm-split adm-split--even">
          <Card
            flush
            title="Registered students"
            subtitle="Most recent accounts"
            action={<a className="cc-btn cc-btn--soft cc-btn--sm" href="/admin/students">View all</a>}
          >
            {recentStudents.length === 0 ? (
              <EmptyState icon="bi-people" title="No students yet">New student accounts will show up here.</EmptyState>
            ) : (
              <div className="adm-rows">
                {recentStudents.map((st) => (
                  <div className="adm-row" key={st.email || st.id}>
                    <Avatar name={st.name} />
                    <div className="adm-row__main">
                      <strong>{st.name}</strong>
                      <span>{st.career} • {st.email}</span>
                    </div>
                    <div className="adm-row__meter">
                      <span>{st.progress}%</span>
                      <Progress value={st.progress} />
                    </div>
                    <Badge tone={toneForStatus(st.status || "Active")} dot>{st.status || "Active"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            flush
            title="Mentor verification"
            subtitle="Industry expert accounts"
            action={<a className="cc-btn cc-btn--soft cc-btn--sm" href="/admin/experts">Review</a>}
          >
            {expertRequests.length === 0 ? (
              <EmptyState icon="bi-person-badge" title="No mentors yet">Industry experts will be listed here.</EmptyState>
            ) : (
              <div className="adm-rows">
                {expertRequests.map((ex) => {
                  const st = ex.status || (ex.verified ? "Approved" : "Pending");
                  return (
                    <div className="adm-row" key={ex.email || ex.id}>
                      <Avatar name={ex.name} />
                      <div className="adm-row__main">
                        <strong>{ex.name}</strong>
                        <span>{ex.role} • {ex.company}</span>
                      </div>
                      <Badge tone={toneForStatus(st)} dot>{st}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboard;
