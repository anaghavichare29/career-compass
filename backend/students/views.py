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
        if not user_id:
            student_user = User.objects.filter(role="STUDENT").first()
            user_id = student_user.user_id if student_user else 1

        top_rec = CareerRecommendation.objects.filter(user_id=user_id).order_by("-match_percent").first()
        target_career = top_rec.career_name if top_rec else "Data Analyst"
        match_percent = top_rec.match_percent if top_rec else 78

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
            "javascript": "Web Development", "react": "Frontend", "machine learning": "AI / ML",
            "cloud computing": "DevOps / Cloud", "cybersecurity": "Security", "html/css": "Frontend"
        }

        lowest_skill = None
        min_current = 999

        for skill in req_skills:
            s_lower = skill.lower()
            cat = categories.get(s_lower, "Technical Skill")

            # Determine baseline current proficiency
            if s_lower in matched_set:
                current = 82 + (len(skill) % 12)
            else:
                # Skill gap
                current = 45 + (len(skill) * 5 % 25)

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
            "description": f"Your current proficiency in {priority_gap} is below the level recommended for your {target_career} career path. Strengthening this skill will improve your roadmap progress and overall readiness.",
            "recommendation": f"Focus on completing assigned learning tasks and taking the targeted {priority_gap} quiz to close this gap.",
        }

        # Calculate summary statistics
        total_score = sum(s["current"] for s in skill_rows)
        overall_score = round(total_score / max(1, len(skill_rows)))
        strong_count = sum(1 for s in skill_rows if s["current"] >= s["required"])
        improve_count = sum(1 for s in skill_rows if s["current"] < s["required"])
        largest_gap_val = max([s["required"] - s["current"] for s in skill_rows], default=0)
        largest_gap_skill = next((s for s in skill_rows if s["required"] - s["current"] == largest_gap_val), None)
        largest_gap_info = {"name": largest_gap_skill["name"], "gap": max(0, largest_gap_val)} if largest_gap_skill and largest_gap_val > 0 else None

        skill_summary = {
            "overall": overall_score,
            "strong_count": strong_count,
            "improve_count": improve_count,
            "largest_gap": largest_gap_info,
        }

        return Response({
            "has_data": True,
            "targetCareer": target_career,
            "target_career": target_career,
            "career_match": match_percent,
            "careerMatch": match_percent,
            "skills": skill_rows,
            "skill_summary": skill_summary,
            "summary": skill_summary,
            "insight": insight,
            "skill_insight": insight,
        }, status=status.HTTP_200_OK)


class StudentCareerReadinessView(APIView):
    """GET /api/students/career-readiness/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        top_rec = CareerRecommendation.objects.filter(user_id=user_id).order_by("-match_percent").first()
        target_career = top_rec.career_name if top_rec else "Not selected"
        match_percent = top_rec.match_percent if top_rec else 0

        # Technical score is based on the student's recorded skills/recommendation.
        tech_score = int(match_percent) if top_rec else 0

        # Roadmap progress
        stages = RoadmapStage.objects.filter(user_id=user_id)
        if stages.exists():
            completed_stages = stages.filter(status='completed').count()
            current_stages = stages.filter(status='current').count()
            learning_score = round((completed_stages / stages.count()) * 100)
        else:
            learning_score = 0

        # Practical tasks experience
        tasks = Task.objects.filter(user_id=user_id)
        if tasks.exists():
            completed_tasks = tasks.filter(status='Completed').count()
            submitted_tasks = tasks.filter(status='Submitted').count()
            practical_score = round(((completed_tasks + submitted_tasks) / tasks.count()) * 100)
        else:
            practical_score = 0

        # Quiz knowledge assessment
        attempts = QuizAttempt.objects.filter(user_id=user_id)
        if attempts.exists():
            knowledge_score = round(sum((a.score / a.total_questions) * 100 for a in attempts) / attempts.count())
        else:
            knowledge_score = 0

        # Average only dimensions for which there is real evidence; empty dimensions are zero,
        # so a recommendation by itself cannot imply learning or task completion.
        overall = round((tech_score + learning_score + practical_score + knowledge_score) / 4)

        level = "Job Ready" if overall >= 75 else ("Accelerating" if overall >= 60 else "Foundational")
        level_note = f"You are demonstrating solid progress across key foundational competencies for {target_career}."
        readiness_insight = f"Your career preparation for {target_career} is at {overall}%. Strengthening practical projects and quizzes will boost your hireability."

        categories = [
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
        ]

        strengths = [
            "Strong foundation in core technical competencies",
            "Active engagement with structured learning roadmap",
            "Consistent quiz participation and self-evaluation",
        ]

        improvement_areas = [
            {"name": "Advanced Practice Tasks", "progress": practical_score, "target": 85},
            {"name": "Domain Quiz Mastery", "progress": knowledge_score, "target": 90},
            {"name": "Milestone Roadmap Completion", "progress": learning_score, "target": 100},
        ]

        next_steps = [
            f"Continue your next milestone stage in {target_career}",
            f"Strengthen your highest skill gap through targeted practice tasks",
            f"Schedule guidance or review with an industry professional",
        ]

        readiness_nested = {
            "overall": overall,
            "insight": readiness_insight,
            "skill_progress": tech_score,
            "roadmap_progress": learning_score,
            "level": level,
            "level_note": level_note,
            "categories": categories,
            "strengths": strengths,
            "improvement_areas": improvement_areas,
            "improvementAreas": improvement_areas,
            "next_steps": next_steps,
        }

        data = {
            "has_data": True,
            "overall": overall,
            "target_career": target_career,
            "targetCareer": target_career,
            "career_match": match_percent,
            "careerMatch": match_percent,
            "readiness": readiness_nested,
            "categories": categories,
            "strengths": strengths,
            "improvementAreas": improvement_areas,
            "improvement_areas": improvement_areas,
            "next_steps": next_steps,
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
