from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User
from careers.models import CareerRecommendation, CareerDefinition
from roadmaps.models import RoadmapStage
from tasks.models import Task
from quizzes.models import QuizAttempt, Quiz
from progress.models import ProgressSummary
from progress.insights import build_insights, has_taken_assessment
from roadmaps.models import RoadmapSkill
from roadmaps.services import sync_roadmap_progress


class StudentProfileView(APIView):
    """GET and PUT /api/students/profile/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        with connection.cursor() as cursor:
            cursor.execute("SELECT college, course, year, academic_score, bio, phone, location, career_goal FROM students WHERE user_id = %s", [user_id])
            s_row = cursor.fetchone()

        if s_row:
            college, course, year, academic_score, bio, phone, location, career_goal = s_row
        else:
            # A new profile should reflect what the student has actually provided.
            # Do not seed fabricated personal details or academic scores.
            college = course = year = academic_score = bio = phone = location = career_goal = None

        # Fetch skills
        skills = []
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT s.skill_name, ss.proficiency_level
                FROM student_skills ss
                JOIN students st ON ss.student_id = st.student_id
                JOIN skills s ON ss.skill_id = s.skill_id
                WHERE st.user_id = %s
            """, [user_id])
            for r in cursor.fetchall():
                skills.append({"name": r[0], "level": r[1]})


        # Calculate completion %
        fields = [user.first_name, user.last_name, user.email, college, course, year, academic_score, bio, phone, location, career_goal]
        filled = sum(1 for f in fields if f)
        completion_percent = round((filled / len(fields)) * 100)

        data = {
            "user_id": user.user_id,
            "firstName": user.first_name or "",
            "lastName": user.last_name or "",
            "email": user.email,
            "role": user.role,
            "college": college or "",
            "course": course or "",
            "year": (f"{year}{'st' if year == 1 else 'nd' if year == 2 else 'rd' if year == 3 else 'th'} Year") if year else "",
            "academicScore": float(academic_score) if academic_score is not None else None,
            "bio": bio or "",
            "phone": phone or "",
            "location": location or "",
            "careerGoal": career_goal or "",
            "skills": [s["name"] for s in skills],
            "skillsDetail": skills,
            "completion": completion_percent,
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Update user names
        first_name = request.data.get("firstName", user.first_name)
        last_name = request.data.get("lastName", user.last_name)
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        # Update students record
        with connection.cursor() as cursor:
            cursor.execute("SELECT college, course, year, academic_score, bio, phone, location, career_goal FROM students WHERE user_id = %s", [user_id])
            existing = cursor.fetchone()
        existing = existing or (None, None, None, None, None, None, None, None)
        college = request.data.get("college", existing[0])
        course = request.data.get("course", existing[1])
        year_raw = request.data.get("year", existing[2])
        try:
            year = int(str(year_raw).split()[0].replace("st", "").replace("nd", "").replace("rd", "").replace("th", "")) if year_raw not in (None, "") else None
        except (TypeError, ValueError):
            return Response({"detail": "Year must be a valid year number."}, status=status.HTTP_400_BAD_REQUEST)
        academic_score = request.data.get("academicScore", existing[3])
        bio = request.data.get("bio", existing[4])
        phone = request.data.get("phone", existing[5])
        location = request.data.get("location", existing[6])
        career_goal = request.data.get("careerGoal", existing[7])

        with connection.cursor() as cursor:
            cursor.execute("SELECT student_id FROM students WHERE user_id = %s", [user_id])
            if cursor.fetchone():
                cursor.execute("""
                    UPDATE students
                    SET college=%s, course=%s, year=%s, academic_score=%s, bio=%s, phone=%s, location=%s, career_goal=%s
                    WHERE user_id=%s
                """, [college, course, year, academic_score, bio, phone, location, career_goal, user_id])
            else:
                cursor.execute("""
                    INSERT INTO students (user_id, college, course, year, academic_score, bio, phone, location, career_goal)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [user_id, college, course, year, academic_score, bio, phone, location, career_goal])

        return Response({"detail": "Profile updated successfully."}, status=status.HTTP_200_OK)


class StudentSkillManageView(APIView):
    """POST /api/students/skills/ body: { user_id, skill_name, level }
       DELETE /api/students/skills/?user_id=X&skill_name=Y"""

    def post(self, request):
        user_id = request.data.get("user_id")
        skill_name = request.data.get("skill_name", "").strip()
        level = request.data.get("level", "INTERMEDIATE").upper()

        if not user_id or not skill_name:
            return Response({"detail": "user_id and skill_name are required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            # Ensure skill in skills table
            cursor.execute("SELECT skill_id FROM skills WHERE LOWER(skill_name) = LOWER(%s)", [skill_name])
            s_row = cursor.fetchone()
            if s_row:
                skill_id = s_row[0]
            else:
                cursor.execute("INSERT INTO skills (skill_name, category) VALUES (%s, %s)", [skill_name, "Technical"])
                skill_id = cursor.lastrowid

            # Ensure student in students table
            cursor.execute("SELECT student_id FROM students WHERE user_id = %s", [user_id])
            st_row = cursor.fetchone()
            if st_row:
                student_id = st_row[0]
            else:
                cursor.execute("INSERT INTO students (user_id) VALUES (%s)", [user_id])
                student_id = cursor.lastrowid

            # Upsert into student_skills
            cursor.execute("SELECT student_skill_id FROM student_skills WHERE student_id = %s AND skill_id = %s", [student_id, skill_id])
            if cursor.fetchone():
                cursor.execute("UPDATE student_skills SET proficiency_level = %s WHERE student_id = %s AND skill_id = %s", [level, student_id, skill_id])
            else:
                cursor.execute("INSERT INTO student_skills (student_id, skill_id, proficiency_level) VALUES (%s, %s, %s)", [student_id, skill_id, level])

        return Response({"detail": "Skill added successfully."}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        user_id = request.query_params.get("user_id") or request.data.get("user_id")
        skill_name = request.query_params.get("skill_name") or request.data.get("skill_name")

        if not user_id or not skill_name:
            return Response({"detail": "user_id and skill_name are required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE ss FROM student_skills ss
                JOIN students st ON ss.student_id = st.student_id
                JOIN skills s ON ss.skill_id = s.skill_id
                WHERE st.user_id = %s AND LOWER(s.skill_name) = LOWER(%s)
            """, [user_id, skill_name.strip()])

        return Response({"detail": "Skill removed successfully."}, status=status.HTTP_200_OK)


class StudentSkillGapView(APIView):
    """GET /api/students/skill-gap/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id or not str(user_id).isdigit():
            return Response({"detail": "A valid user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(build_insights(int(user_id)), status=status.HTTP_200_OK)


class StudentCareerReadinessView(APIView):
    """GET /api/students/career-readiness/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id or not str(user_id).isdigit():
            return Response({"detail": "A valid user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(build_insights(int(user_id)), status=status.HTTP_200_OK)


class StudentProgressView(APIView):
    """GET /api/students/progress/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        sync_roadmap_progress(user_id)

        stages = RoadmapStage.objects.filter(user_id=user_id).order_by('order')
        tasks = Task.objects.filter(user_id=user_id)
        quizzes = Quiz.objects.filter(user_id=user_id, status='approved')
        attempts = QuizAttempt.objects.filter(user_id=user_id).order_by('-completed_at')

        total_stages = stages.count()
        roadmap_skills = list(RoadmapSkill.objects.filter(stage__user_id=user_id))
        roadmap_progress = round(sum(s.progress for s in roadmap_skills) / len(roadmap_skills)) if roadmap_skills else 0

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status__in=['Completed', 'Submitted']).count()

        total_quizzes = quizzes.count()
        quizzes_completed_count = len(set(attempts.values_list('quiz_id', flat=True)))

        avg_score = 0
        if attempts.exists():
            avg_score = round(sum((a.score / a.total_questions) * 100 for a in attempts) / attempts.count())

        assessment_done = has_taken_assessment(user_id)
        insights = build_insights(int(user_id)) if assessment_done else {}
        readiness_overall = insights.get("overall", 0)

        achievements = [
            {
                "title": "Assessment Completed",
                "description": "Completed common career assessment and received recommendations",
                "achieved": assessment_done,
                "icon": "bi-clipboard-check",
            },
            {
                "title": "Roadmap Activated",
                "description": "Personalized career roadmap generated",
                "achieved": total_stages > 0,
                "icon": "bi-map",
            },
            {
                "title": "First Quiz Passed",
                "description": "Scored on your first career knowledge quiz",
                "achieved": attempts.exists(),
                "icon": "bi-patch-check",
            },
            {
                "title": "Task Champion",
                "description": "Completed 3 or more practical learning tasks",
                "achieved": completed_tasks >= 3,
                "icon": "bi-trophy",
            },
            {
                "title": "Ready for Industry",
                "description": "Reached above 75% career readiness score",
                "achieved": readiness_overall >= 75,
                "icon": "bi-stars",
            },
        ]

        recent_attempts = [
            {
                "quizTitle": att.quiz.title,
                "score": att.score,
                "total": att.total_questions,
                "percent": round((att.score / att.total_questions) * 100),
                "date": att.completed_at.strftime("%d %b %Y"),
            }
            for att in attempts[:5]
        ]

        return Response({
            "assessmentCompleted": assessment_done,
            "metrics": {
                "roadmapProgress": roadmap_progress,
                "tasksCompleted": f"{completed_tasks} of {total_tasks}",
                "taskPercent": round((completed_tasks / total_tasks * 100)) if total_tasks else 0,
                "quizzesCompleted": f"{quizzes_completed_count} of {total_quizzes}",
                "averageQuizScore": f"{avg_score}%",
            },
            "achievements": achievements,
            "recentQuizzes": recent_attempts,
        }, status=status.HTTP_200_OK)
