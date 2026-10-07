import json
import datetime
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User
from mentorship.views import _ensure_experts_seeded
from careers.models import CareerDefinition
from quizzes.models import Quiz, QuizQuestion, QuizAttempt
from tasks.models import Task
from progress.models import ProgressSummary


class AdminStatsView(APIView):
    """GET /api/admin-portal/stats/ - Overview statistics for Admin Dashboard"""

    def get(self, request):
        _ensure_experts_seeded()

        total_students = User.objects.filter(role='STUDENT').count()
        total_experts = User.objects.filter(role='PROFESSIONAL').count()
        total_quizzes = Quiz.objects.filter(status='approved').count()

        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM assessment_submissions")
            assessments_completed = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM professionals WHERE is_verified = 0")
            pending_experts = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'Completed'")
            tasks_completed = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM platform_reports WHERE status = 'pending'")
            pending_reports = cursor.fetchone()[0]

            # Recent activity
            cursor.execute("""
                SELECT user_id, first_name, last_name, email, role, created_at, status
                FROM users
                ORDER BY created_at DESC
                LIMIT 5
            """)
            recent_users = [
                {
                    "name": f"{r[1]} {r[2] or ''}".strip(),
                    "email": r[3],
                    "role": r[4],
                    "status": r[6] or "Active",
                    "time": r[5].strftime("%d %b %Y") if r[5] else "Recently",
                }
                for r in cursor.fetchall()
            ]

        stats = [
            {"label": "Total Students", "value": f"{total_students:,}", "change": "+14.2%", "icon": "bi-people", "type": "blue"},
            {"label": "Industry Experts", "value": f"{total_experts:,}", "change": f"{pending_experts} Pending", "icon": "bi-person-badge", "type": "purple"},
            {"label": "Active Quizzes", "value": f"{total_quizzes:,}", "change": "+8.4%", "icon": "bi-book", "type": "green"},
            {"label": "Assessments Done", "value": f"{assessments_completed:,}", "change": "+18.7%", "icon": "bi-clipboard-check", "type": "orange"},
        ]

        return Response({
            "stats": stats,
            "totalStudents": total_students,
            "totalExperts": total_experts,
            "pendingExperts": pending_experts,
            "activeQuizzes": total_quizzes,
            "assessmentsCompleted": assessments_completed,
            "tasksCompleted": tasks_completed,
            "pendingReports": pending_reports,
            "recentUsers": recent_users,
        }, status=status.HTTP_200_OK)


class AdminStudentsListView(APIView):
    """GET /api/admin-portal/students/ - List all registered students"""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.created_at,
                       s.college, s.course, s.year, s.academic_score, s.career_goal
                FROM users u
                LEFT JOIN students s ON u.user_id = s.user_id
                WHERE u.role = 'STUDENT'
                ORDER BY u.user_id DESC
            """)
            rows = cursor.fetchall()

        results = []
        for r in rows:
            uid = r[0]
            name = f"{r[1]} {r[2] or ''}".strip()
            summary = ProgressSummary.objects.filter(user_id=uid).first()
            tasks = Task.objects.filter(user_id=uid)
            completed_tasks = tasks.filter(status='Completed').count()
            total_tasks = tasks.count()

            task_percent = round((completed_tasks / max(total_tasks, 1)) * 100) if total_tasks else 0

            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM assessment_submissions WHERE user_id = %s", [uid])
                has_assessment = cursor.fetchone()[0] > 0

            attempts = QuizAttempt.objects.filter(user_id=uid)
            avg_quiz = 0
            if attempts.exists():
                avg_quiz = round((sum(a.score / a.total_questions for a in attempts) / attempts.count()) * 100)

            readiness = round((task_percent * 0.5) + (avg_quiz * 0.5)) if has_assessment else 25

            results.append({
                "id": uid,
                "userId": uid,
                "name": name,
                "email": r[3],
                "status": r[4] or "Active",
                "joined": r[5].strftime("%d %b %Y") if r[5] else "Aug 2026",
                "college": r[6] or "Vidyalankar Institute of Technology",
                "course": r[7] or "B.Tech IT",
                "year": f"{r[8]} Year" if r[8] else "3rd Year",
                "academicScore": float(r[9]) if r[9] else 8.5,
                "career": r[10] or "Software Engineer",
                "domain": "Technology",
                "assessment": "Completed" if has_assessment else "Pending",
                "progress": summary.skill_progress_percent if summary else task_percent,
                "readiness": readiness,
            })

        return Response(results, status=status.HTTP_200_OK)


class AdminStudentDetailView(APIView):
    """GET /api/admin-portal/students/<student_id>/ - View detailed student info for admin"""

    def get(self, request, student_id):
        user = User.objects.filter(user_id=student_id).first()
        if not user:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        from mentorship.views import MentorStudentProgressView
        view = MentorStudentProgressView()
        res = view.get(request, student_id)
        data = res.data
        data["status"] = user.status or "Active"
        return Response(data, status=status.HTTP_200_OK)


class AdminUserToggleStatusView(APIView):
    """POST /api/admin-portal/users/<user_id>/toggle-status/ - Activate or Deactivate account"""

    def post(self, request, user_id):
        user = User.objects.filter(user_id=user_id).first()
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if not new_status:
            current = user.status or "Active"
            new_status = "Inactive" if current == "Active" else "Active"

        with connection.cursor() as cursor:
            cursor.execute("UPDATE users SET status = %s WHERE user_id = %s", [new_status, user_id])

            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                [
                    user_id,
                    f"Account Status Updated: {new_status}",
                    f"Your CareerCompass account has been set to {new_status} by platform administration.",
                    "admin",
                ]
            )

        return Response({"detail": f"User status updated to {new_status}.", "status": new_status}, status=status.HTTP_200_OK)


class AdminExpertsListView(APIView):
    """GET /api/admin-portal/experts/ - List all registered mentors/experts"""

    def get(self, request):
        _ensure_experts_seeded()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.professional_id, p.user_id, u.first_name, u.last_name, u.email,
                       p.company, p.designation, p.experience_years, p.industry,
                       p.is_verified, u.status, u.created_at
                FROM professionals p
                JOIN users u ON p.user_id = u.user_id
                ORDER BY p.professional_id DESC
            """)
            rows = cursor.fetchall()

        results = []
        for r in rows:
            name = f"{r[2]} {r[3] or ''}".strip()
            initials = "".join([part[0] for part in name.split()[:2]]).upper() or "EX"
            is_verified = bool(r[9])
            results.append({
                "id": r[0],
                "professionalId": r[0],
                "userId": r[1],
                "name": name,
                "email": r[4],
                "role": r[6] or "Industry Expert",
                "company": r[5] or "Technology Company",
                "domain": r[8] or "Technology",
                "experience": f"{int(r[7]) if r[7] else 5}+ Years",
                "experienceYears": float(r[7]) if r[7] else 5.0,
                "verified": is_verified,
                "status": "Approved" if is_verified else "Pending",
                "accountStatus": r[10] or "Active",
                "joined": r[11].strftime("%d %b %Y") if r[11] else "Aug 2026",
                "initials": initials,
            })

        return Response(results, status=status.HTTP_200_OK)


class AdminExpertVerifyView(APIView):
    """POST /api/admin-portal/experts/<prof_id>/verify/ body: { decision: 'Approved'|'Rejected'|'Pending' }"""

    def post(self, request, prof_id):
        decision = request.data.get("decision", "Approved")
        is_verified = 1 if decision == "Approved" else 0

        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM professionals WHERE professional_id = %s", [prof_id])
            row = cursor.fetchone()
            if not row:
                return Response({"detail": "Expert not found."}, status=status.HTTP_404_NOT_FOUND)

            mentor_user_id = row[0]
            cursor.execute("UPDATE professionals SET is_verified = %s WHERE professional_id = %s", [is_verified, prof_id])

            # Notify mentor
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                [
                    mentor_user_id,
                    f"Mentor Verification {decision}",
                    f"Your industry mentor profile has been reviewed and marked as {decision}. " +
                    ("You can now connect with and guide students!" if decision == 'Approved' else "Please update your profile details for re-review."),
                    "admin",
                ]
            )

        return Response({"detail": f"Mentor verification set to {decision}.", "status": decision, "verified": bool(is_verified)}, status=status.HTTP_200_OK)


class AdminCareersView(APIView):
    """GET and POST /api/admin-portal/careers/"""

    def get(self, request):
        careers = CareerDefinition.objects.all().order_by('id')
        results = [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "requiredSkills": c.required_skills,
                "skillsList": [s.strip() for s in c.required_skills.split(',') if s.strip()],
                "tags": c.tags,
            }
            for c in careers
        ]
        return Response(results, status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get("name", "").strip()
        description = request.data.get("description", "").strip()
        required_skills = request.data.get("requiredSkills", "").strip()
        tags = request.data.get("tags", "").strip()

        if not name:
            return Response({"detail": "Career name is required."}, status=status.HTTP_400_BAD_REQUEST)

        career, created = CareerDefinition.objects.get_or_create(
            name=name,
            defaults={
                "description": description or f"Career track for {name}",
                "required_skills": required_skills or "Problem Solving, Communication",
                "tags": tags or name.lower(),
            }
        )
        if not created:
            career.description = description
            career.required_skills = required_skills
            career.tags = tags
            career.save()

        return Response({"detail": "Career saved successfully.", "id": career.id}, status=status.HTTP_200_OK)

    def delete(self, request, pk=None):
        pk = pk or request.query_params.get("id")
        if pk:
            CareerDefinition.objects.filter(pk=pk).delete()
            return Response({"detail": "Career deleted successfully."}, status=status.HTTP_200_OK)
        return Response({"detail": "Career id is required."}, status=status.HTTP_400_BAD_REQUEST)


class AdminSkillsView(APIView):
    """GET and POST /api/admin-portal/skills/"""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT skill_id, skill_name, category FROM skills ORDER BY skill_name ASC")
            rows = cursor.fetchall()

            if not rows:
                default_skills = [
                    ("Python", "Programming"), ("SQL", "Database"), ("Excel", "Analytics"),
                    ("Machine Learning", "AI"), ("React", "Web"), ("Node.js", "Web"),
                    ("AWS", "Cloud"), ("Cybersecurity", "Security"), ("Docker", "Cloud"),
                    ("Data Structures", "Computer Science"), ("Statistics", "Data Science"),
                    ("Communication", "Soft Skills"), ("Product Management", "Management"),
                ]
                for sk, cat in default_skills:
                    cursor.execute("INSERT IGNORE INTO skills (skill_name, category) VALUES (%s, %s)", [sk, cat])
                cursor.execute("SELECT skill_id, skill_name, category FROM skills ORDER BY skill_name ASC")
                rows = cursor.fetchall()

        return Response([{"id": r[0], "name": r[1], "category": r[2] or "General"} for r in rows], status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get("name", "").strip()
        category = request.data.get("category", "General").strip()
        if not name:
            return Response({"detail": "Skill name is required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO skills (skill_name, category) VALUES (%s, %s)", [name, category])
            new_id = cursor.lastrowid
        return Response({"detail": "Skill added.", "id": new_id, "name": name, "category": category}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk=None):
        pk = pk or request.query_params.get("id")
        if pk:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM skills WHERE skill_id = %s", [pk])
            return Response({"detail": "Skill deleted."}, status=status.HTTP_200_OK)
        return Response({"detail": "Skill id required."}, status=status.HTTP_400_BAD_REQUEST)


class AdminAssessmentsView(APIView):
    """GET /api/admin-portal/assessments/ - Monitor student assessment activity"""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT sub.id, sub.user_id, u.first_name, u.last_name, u.email,
                       sub.submitted_at, sub.answers, sub.academic_info
                FROM assessment_submissions sub
                JOIN users u ON sub.user_id = u.user_id
                ORDER BY sub.submitted_at DESC
                LIMIT 50
            """)
            rows = cursor.fetchall()

        results = []
        for r in rows:
            name = f"{r[2]} {r[3] or ''}".strip()
            # Find career rec
            from careers.models import CareerRecommendation
            top_rec = CareerRecommendation.objects.filter(user_id=r[1]).order_by('-match_percent').first()
            results.append({
                "id": r[0],
                "userId": r[1],
                "studentName": name,
                "email": r[4],
                "submittedAt": r[5].strftime("%d %b %Y, %I:%M %p") if r[5] else "",
                "recommendedCareer": top_rec.career_name if top_rec else "Software Engineer",
                "matchPercent": top_rec.match_percent if top_rec else 85,
            })

        return Response(results, status=status.HTTP_200_OK)


class AdminQuizzesView(APIView):
    """GET and DELETE /api/admin-portal/quizzes/ - Monitor and manage platform quizzes"""

    def get(self, request):
        quizzes = Quiz.objects.all().order_by('-created_at')[:50]
        results = []
        for q in quizzes:
            user = User.objects.filter(user_id=q.user_id).first()
            results.append({
                "id": q.id,
                "title": q.title,
                "skill": q.skill,
                "source": q.source,
                "status": q.status,
                "difficulty": q.difficulty,
                "durationMinutes": q.duration_minutes,
                "questionsCount": q.questions.count(),
                "author": f"{user.first_name} {user.last_name or ''}".strip() if user else "System",
                "authorRole": user.role if user else "SYSTEM",
                "createdAt": q.created_at.strftime("%d %b %Y") if q.created_at else "",
            })
        return Response(results, status=status.HTTP_200_OK)

    def delete(self, request, pk=None):
        pk = pk or request.query_params.get("id")
        if pk:
            Quiz.objects.filter(pk=pk).delete()
            return Response({"detail": "Quiz deleted."}, status=status.HTTP_200_OK)
        return Response({"detail": "Quiz id is required."}, status=status.HTTP_400_BAD_REQUEST)


class AdminInteractionsView(APIView):
    """GET /api/admin-portal/interactions/ - Monitor mentor-student interactions"""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT gr.id, gr.student_id, su.first_name, su.last_name,
                       gr.mentor_id, pu.first_name, pu.last_name,
                       gr.topic, gr.status, gr.message, gr.reply, gr.created_at
                FROM guidance_requests gr
                JOIN users su ON gr.student_id = su.user_id
                JOIN professionals p ON gr.mentor_id = p.professional_id
                JOIN users pu ON p.user_id = pu.user_id
                ORDER BY gr.created_at DESC
                LIMIT 50
            """)
            rows = cursor.fetchall()

        interactions = [
            {
                "id": r[0],
                "studentName": f"{r[2]} {r[3] or ''}".strip(),
                "mentorName": f"{r[5]} {r[6] or ''}".strip(),
                "topic": r[7],
                "status": r[8],
                "message": r[9],
                "reply": r[10] or "No reply yet",
                "date": r[11].strftime("%d %b %Y, %I:%M %p") if r[11] else "",
            }
            for r in rows
        ]
        return Response(interactions, status=status.HTTP_200_OK)


class AdminComplaintsView(APIView):
    """GET and POST /api/admin-portal/complaints/ and resolve"""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT r.id, r.reporter_user_id, ru.first_name, ru.last_name,
                       r.reported_user_id, tu.first_name, tu.last_name,
                       r.content_type, r.reason, r.description, r.status, r.admin_action, r.created_at
                FROM platform_reports r
                JOIN users ru ON r.reporter_user_id = ru.user_id
                LEFT JOIN users tu ON r.reported_user_id = tu.user_id
                ORDER BY r.created_at DESC
            """)
            rows = cursor.fetchall()

        reports = [
            {
                "id": r[0],
                "reporterName": f"{r[2]} {r[3] or ''}".strip(),
                "reportedName": f"{r[5]} {r[6] or ''}".strip() if r[5] else "General Content",
                "contentType": r[7],
                "reason": r[8],
                "description": r[9] or "",
                "status": r[10],
                "adminAction": r[11] or "",
                "date": r[12].strftime("%d %b %Y") if r[12] else "",
            }
            for r in rows
        ]
        return Response(reports, status=status.HTTP_200_OK)

    def post(self, request):
        reporter_id = request.data.get("reporter_id")
        reported_id = request.data.get("reported_id")
        content_type = request.data.get("content_type", "user")
        reason = request.data.get("reason", "Inappropriate behavior").strip()
        description = request.data.get("description", "").strip()

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO platform_reports (reporter_user_id, reported_user_id, content_type, reason, description, status)
                VALUES (%s, %s, %s, %s, %s, 'pending')
            """, [reporter_id, reported_id, content_type, reason, description])

        return Response({"detail": "Report submitted for admin review."}, status=status.HTTP_201_CREATED)


class AdminComplaintResolveView(APIView):
    """POST /api/admin-portal/complaints/<id>/resolve/ body: { action: 'Resolved'|'Dismissed', note: '' }"""

    def post(self, request, pk):
        action = request.data.get("action", "Resolved")
        note = request.data.get("note", "").strip()

        with connection.cursor() as cursor:
            cursor.execute("UPDATE platform_reports SET status = %s, admin_action = %s WHERE id = %s", [action, note, pk])

        return Response({"detail": f"Report {action}."}, status=status.HTTP_200_OK)


class AdminAnnouncementsView(APIView):
    """GET and POST /api/admin-portal/announcements/"""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT a.id, a.admin_id, u.first_name, u.last_name, a.title, a.message, a.target_role, a.created_at
                FROM platform_announcements a
                JOIN users u ON a.admin_id = u.user_id
                ORDER BY a.created_at DESC
            """)
            rows = cursor.fetchall()

        results = [
            {
                "id": r[0],
                "adminName": f"{r[2]} {r[3] or ''}".strip(),
                "title": r[4],
                "message": r[5],
                "targetRole": r[6],
                "date": r[7].strftime("%d %b %Y, %I:%M %p") if r[7] else "",
            }
            for r in rows
        ]
        return Response(results, status=status.HTTP_200_OK)

    def post(self, request):
        admin_id = request.data.get("admin_id")
        title = request.data.get("title", "").strip()
        message = request.data.get("message", "").strip()
        target_role = request.data.get("target_role", "ALL").upper()

        if not admin_id or not title or not message:
            return Response({"detail": "admin_id, title, and message are required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO platform_announcements (admin_id, title, message, target_role)
                VALUES (%s, %s, %s, %s)
            """, [admin_id, title, message, target_role])

            # Broadcast notifications to target users
            if target_role == "ALL":
                cursor.execute("SELECT user_id FROM users")
            else:
                cursor.execute("SELECT user_id FROM users WHERE role = %s", [target_role])

            user_ids = [row[0] for row in cursor.fetchall()]
            for uid in user_ids:
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                    [uid, f"Announcement: {title}", message, "announcement"]
                )

        return Response({"detail": f"Announcement broadcasted to {len(user_ids)} users."}, status=status.HTTP_201_CREATED)


class AdminFeedbackView(APIView):
    """GET and POST /api/admin-portal/feedback/"""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT f.id, f.user_id, u.first_name, u.last_name, u.role,
                       f.category, f.rating, f.feedback_text, f.status, f.created_at
                FROM platform_feedback f
                JOIN users u ON f.user_id = u.user_id
                ORDER BY f.created_at DESC
            """)
            rows = cursor.fetchall()

        feedbacks = [
            {
                "id": r[0],
                "userName": f"{r[2]} {r[3] or ''}".strip(),
                "role": r[4],
                "category": r[5],
                "rating": r[6],
                "feedback": r[7],
                "status": r[8],
                "date": r[9].strftime("%d %b %Y") if r[9] else "",
            }
            for r in rows
        ]
        return Response(feedbacks, status=status.HTTP_200_OK)

    def post(self, request):
        user_id = request.data.get("user_id")
        category = request.data.get("category", "Platform Experience")
        rating = request.data.get("rating", 5)
        text = request.data.get("feedback_text", "").strip()

        if not user_id or not text:
            return Response({"detail": "user_id and feedback_text required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO platform_feedback (user_id, category, rating, feedback_text, status)
                VALUES (%s, %s, %s, %s, 'pending')
            """, [user_id, category, rating, text])

        return Response({"detail": "Feedback submitted successfully."}, status=status.HTTP_201_CREATED)


class AdminAnalyticsReportsView(APIView):
    """GET /api/admin-portal/analytics/ - Comprehensive report summaries"""

    def get(self, request):
        total_students = User.objects.filter(role='STUDENT').count()
        total_mentors = User.objects.filter(role='PROFESSIONAL').count()

        # Quiz completion rate
        total_attempts = QuizAttempt.objects.count()
        attempts = QuizAttempt.objects.all()
        avg_score = round(sum(a.score / a.total_questions for a in attempts) / max(attempts.count(), 1) * 100) if attempts.exists() else 78

        # Task completion
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='Completed').count()
        task_rate = round((completed_tasks / max(total_tasks, 1)) * 100) if total_tasks else 82

        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM guidance_requests WHERE status IN ('approved', 'replied')")
            answered_requests = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM guidance_requests")
            total_requests = cursor.fetchone()[0]
            mentor_resp_rate = round((answered_requests / max(total_requests, 1)) * 100) if total_requests else 90

        return Response({
            "overview": {
                "totalStudents": total_students,
                "totalMentors": total_mentors,
                "totalQuizAttempts": total_attempts,
                "averageQuizScore": avg_score,
                "taskCompletionRate": task_rate,
                "mentorResponseRate": mentor_resp_rate,
            },
            "domainDistribution": [
                {"domain": "Software Development", "percentage": 38},
                {"domain": "Data Science & AI", "percentage": 32},
                {"domain": "Cybersecurity & Cloud", "percentage": 18},
                {"domain": "Product & UX Design", "percentage": 12},
            ],
            "monthlyEngagement": [
                {"month": "May", "assessments": 120, "quizzes": 310, "guidance": 45},
                {"month": "Jun", "assessments": 190, "quizzes": 460, "guidance": 68},
                {"month": "Jul", "assessments": 280, "quizzes": 720, "guidance": 95},
                {"month": "Aug", "assessments": 410, "quizzes": 980, "guidance": 130},
            ]
        }, status=status.HTTP_200_OK)
