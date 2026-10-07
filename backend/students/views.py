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
            college = "Vidyalankar Institute of Technology"
            course = "B.Tech Information Technology"
            year = 3
            academic_score = 8.5
            bio = "Passionate student focused on practical technology, problem solving, and building skills."
            phone = "+91 98765 43210"
            location = "Mumbai, India"
            career_goal = "Software Engineer"
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO students (user_id, college, course, year, academic_score, bio, phone, location, career_goal) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    [user_id, college, course, year, academic_score, bio, phone, location, career_goal]
                )

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

        if not skills:
            # Fallback default skills list for new students
            default_skills = ["Python", "SQL", "Excel", "Data Analysis", "Git", "Problem Solving"]
            skills = [{"name": s, "level": "INTERMEDIATE"} for s in default_skills]

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
            "year": f"{year}rd Year" if year else "3rd Year",
            "academicScore": float(academic_score) if academic_score else 8.5,
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
        college = request.data.get("college", "")
        course = request.data.get("course", "")
        year_raw = request.data.get("year", "3")
        try:
            year = int(str(year_raw).split()[0].replace("st", "").replace("nd", "").replace("rd", "").replace("th", ""))
        except Exception:
            year = 3
        bio = request.data.get("bio", "")
        phone = request.data.get("phone", "")
        location = request.data.get("location", "")
        career_goal = request.data.get("careerGoal", "")

        with connection.cursor() as cursor:
            cursor.execute("SELECT student_id FROM students WHERE user_id = %s", [user_id])
            if cursor.fetchone():
                cursor.execute("""
                    UPDATE students
                    SET college=%s, course=%s, year=%s, bio=%s, phone=%s, location=%s, career_goal=%s
                    WHERE user_id=%s
                """, [college, course, year, bio, phone, location, career_goal, user_id])
            else:
                cursor.execute("""
                    INSERT INTO students (user_id, college, course, year, academic_score, bio, phone, location, career_goal)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [user_id, college, course, year, 8.5, bio, phone, location, career_goal])

        return self.get(request)


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
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        top_rec = CareerRecommendation.objects.filter(user_id=user_id).order_by("-match_percent").first()
        target_career = top_rec.career_name if top_rec else "Data Analyst"

        career_def = CareerDefinition.objects.filter(name=target_career).first()
        if not career_def:
            career_def = CareerDefinition.objects.first()

        req_skills = career_def.skills_list() if career_def else ["Python", "SQL", "Excel", "Statistics", "Data Visualization"]

        # User's known skills from recommendation
        matched_set = set()
        if top_rec and top_rec.matched_skills:
            matched_set = set(s.strip().lower() for s in top_rec.matched_skills.split(",") if s.strip())

        # Also check quiz attempts & tasks for progress
        attempts = QuizAttempt.objects.filter(user_id=user_id)
        avg_quiz_score = 0
        if attempts.exists():
            avg_quiz_score = round(sum((a.score / a.total_questions) * 100 for a in attempts) / attempts.count())

        skill_rows = []
        categories = {
            "python": "Programming", "sql": "Database", "excel": "Spreadsheets",
            "statistics": "Data Analysis", "data visualization": "Visualization",
            "javascript": "Web Development", "react": "Frontend", "machine learning": "AI / ML"
        }

        lowest_skill = None
        min_current = 999

        for skill in req_skills:
            s_lower = skill.lower()
            cat = categories.get(s_lower, "Technical Skill")

            # Determine baseline current proficiency
            if s_lower in matched_set:
                current = 85 + (len(skill) % 15)
            else:
                # Skill gap
                current = 40 + (len(skill) * 5 % 30)

            # Boost if user did quizzes/tasks in this skill
            relevant_tasks = Task.objects.filter(user_id=user_id, skill__icontains=skill)
            if relevant_tasks.exists():
                comp = relevant_tasks.filter(status="Completed").count()
                current = min(100, current + comp * 15)

            required = 85

            if current >= 80:
                status_label = "Strong"
                color = "green"
            elif current >= 65:
                status_label = "Almost There"
                color = "blue"
            elif current >= 45:
                status_label = "Needs Improvement"
                color = "orange"
            else:
                status_label = "Beginner"
                color = "purple"

            skill_rows.append({
                "name": skill,
                "category": cat,
                "current": current,
                "required": required,
                "status": status_label,
                "color": color,
            })

            if current < min_current:
                min_current = current
                lowest_skill = skill

        priority_gap = lowest_skill or "Core Fundamentals"

        insight = {
            "title": f"{priority_gap} is currently your highest-priority skill gap",
            "description": f"Your current proficiency in {priority_gap} is below the level recommended for your {target_career} career path. Strengthening this skill will improve your roadmap progress.",
            "recommendation": f"Focus on completing assigned learning tasks and taking the targeted {priority_gap} quiz to close this gap.",
        }

        return Response({
            "targetCareer": target_career,
            "skills": skill_rows,
            "insight": insight,
        }, status=status.HTTP_200_OK)


class StudentCareerReadinessView(APIView):
    """GET /api/students/career-readiness/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        top_rec = CareerRecommendation.objects.filter(user_id=user_id).order_by("-match_percent").first()
        target_career = top_rec.career_name if top_rec else "Data Analyst"
        match_percent = top_rec.match_percent if top_rec else 75

        # Technical skills score from matched skills
        tech_score = max(50, min(95, match_percent))

        # Roadmap progress
        stages = RoadmapStage.objects.filter(user_id=user_id)
        if stages.exists():
            completed_stages = stages.filter(status='completed').count()
            current_stages = stages.filter(status='current').count()
            learning_score = round(((completed_stages + 0.5 * current_stages) / stages.count()) * 100)
        else:
            learning_score = 60

        # Practical tasks experience
        tasks = Task.objects.filter(user_id=user_id)
        if tasks.exists():
            completed_tasks = tasks.filter(status='Completed').count()
            submitted_tasks = tasks.filter(status='Submitted').count()
            practical_score = round(((completed_tasks + submitted_tasks) / tasks.count()) * 100)
        else:
            practical_score = 50

        # Quiz knowledge assessment
        attempts = QuizAttempt.objects.filter(user_id=user_id)
        if attempts.exists():
            knowledge_score = round(sum((a.score / a.total_questions) * 100 for a in attempts) / attempts.count())
        else:
            knowledge_score = 65

        overall = round((tech_score + learning_score + practical_score + knowledge_score) / 4)

        data = {
            "overall": overall,
            "targetCareer": target_career,
            "categories": [
                {
                    "name": "Technical Skills",
                    "value": tech_score,
                    "icon": "bi-code-slash",
                    "color": "blue",
                    "description": f"Domain and technical skills matched for {target_career}",
                },
                {
                    "name": "Learning Progress",
                    "value": learning_score,
                    "icon": "bi-book",
                    "color": "purple",
                    "description": "Progress across your milestone career roadmap",
                },
                {
                    "name": "Practical Experience",
                    "value": practical_score,
                    "icon": "bi-kanban",
                    "color": "orange",
                    "description": "Completed courses, tasks and assignment submissions",
                },
                {
                    "name": "Knowledge Assessment",
                    "value": knowledge_score,
                    "icon": "bi-patch-question",
                    "color": "green",
                    "description": "Performance across multiple-choice quizzes and tests",
                },
            ],
            "strengths": [
                "Strong foundation in core technical competencies",
                "Active engagement with structured learning roadmap",
                "Consistent quiz participation and self-evaluation",
            ],
            "improvementAreas": [
                {"name": "Advanced Practice Tasks", "progress": practical_score, "target": 85},
                {"name": "Domain Quiz Mastery", "progress": knowledge_score, "target": 90},
                {"name": "Milestone Roadmap Completion", "progress": learning_score, "target": 100},
            ]
        }
        return Response(data, status=status.HTTP_200_OK)


class StudentProgressView(APIView):
    """GET /api/students/progress/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        stages = RoadmapStage.objects.filter(user_id=user_id).order_by('order')
        tasks = Task.objects.filter(user_id=user_id)
        quizzes = Quiz.objects.filter(user_id=user_id, status='approved')
        attempts = QuizAttempt.objects.filter(user_id=user_id).order_by('-completed_at')

        total_stages = stages.count()
        completed_stages = stages.filter(status='completed').count()

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='Completed').count()

        total_quizzes = quizzes.count()
        completed_quiz_ids = set(attempts.values_list('quiz_id', flat=True))
        quizzes_completed_count = len(completed_quiz_ids)

        avg_score = 0
        if attempts.exists():
            avg_score = round(sum((a.score / a.total_questions) * 100 for a in attempts) / attempts.count())

        # Achievements
        achievements = [
            {
                "title": "Assessment Completed",
                "description": "Completed common career assessment and received recommendations",
                "achieved": True,
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
                "achieved": avg_score >= 75 and completed_tasks >= 2,
                "icon": "bi-stars",
            },
        ]

        recent_attempts = []
        for att in attempts[:5]:
            recent_attempts.append({
                "quizTitle": att.quiz.title,
                "score": att.score,
                "total": att.total_questions,
                "percent": round((att.score / att.total_questions) * 100),
                "date": att.completed_at.strftime("%d %b %Y"),
            })

        return Response({
            "metrics": {
                "roadmapProgress": round((completed_stages / total_stages * 100)) if total_stages else 0,
                "tasksCompleted": f"{completed_tasks} of {total_tasks}",
                "taskPercent": round((completed_tasks / total_tasks * 100)) if total_tasks else 0,
                "quizzesCompleted": f"{quizzes_completed_count} of {total_quizzes}",
                "averageQuizScore": f"{avg_score}%",
            },
            "achievements": achievements,
            "recentQuizzes": recent_attempts,
        }, status=status.HTTP_200_OK)
