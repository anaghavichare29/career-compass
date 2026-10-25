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
    """GET /api/students/skill-gap/?user_id=X&career_name=Y"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        career_name = request.query_params.get("career_name")
        if not user_id or not str(user_id).isdigit():
            return Response({"detail": "A valid user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(build_insights(int(user_id), career_name=career_name), status=status.HTTP_200_OK)


class StudentCareerReadinessView(APIView):
    """GET /api/students/career-readiness/?user_id=X&career_name=Y"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        career_name = request.query_params.get("career_name")
        if not user_id or not str(user_id).isdigit():
            return Response({"detail": "A valid user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(build_insights(int(user_id), career_name=career_name), status=status.HTTP_200_OK)


class StudentProgressView(APIView):
    """GET /api/students/progress/?user_id=X&career_name=Y"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        career_name = request.query_params.get("career_name")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        norm_career = None
        if career_name and career_name not in ('undefined', 'null', ''):
            from quizzes.generator import normalize_career_name
            norm_career = normalize_career_name(career_name)

        if not norm_career:
            top_rec = CareerRecommendation.objects.filter(user_id=user_id).order_by("-match_percent", "id").first()
            if top_rec:
                norm_career = top_rec.career_name
            else:
                first_stage = RoadmapStage.objects.filter(user_id=user_id).first()
                if first_stage and first_stage.career_name:
                    norm_career = first_stage.career_name
                else:
                    first_career = CareerDefinition.objects.first()
                    norm_career = first_career.name if first_career else "Software Engineer"

        career_def = CareerDefinition.objects.filter(name__iexact=norm_career).first()
        if not career_def:
            career_def = CareerDefinition.objects.filter(name__icontains=norm_career).first()

        # Ensure roadmap exists for this career track
        stages_qs = RoadmapStage.objects.filter(user_id=user_id, career_name__iexact=norm_career)
        if not stages_qs.exists():
            stages_qs = RoadmapStage.objects.filter(user_id=user_id, career_name__icontains=norm_career)
        if not stages_qs.exists() and career_def:
            from roadmaps.services import generate_roadmap_for_user
            generate_roadmap_for_user(user_id, career_def)
            stages_qs = RoadmapStage.objects.filter(user_id=user_id, career_name__iexact=norm_career)
            if not stages_qs.exists():
                stages_qs = RoadmapStage.objects.filter(user_id=user_id, career_name__icontains=norm_career)

        sync_roadmap_progress(user_id, career_name=norm_career)
        stages = stages_qs.order_by('order')

        roadmap_skills = list(RoadmapSkill.objects.filter(stage__in=stages).select_related('stage'))
        career_skill_names = set(s.name.strip().lower() for s in roadmap_skills)
        if career_def:
            career_skill_names.update(s.strip().lower() for s in career_def.skills_list())

        # Stage milestones breakdown
        stage_milestones = []
        for st in stages:
            st_skills = [s for s in roadmap_skills if s.stage_id == st.id]
            st_prog = round(sum(s.progress for s in st_skills) / len(st_skills)) if st_skills else (100 if st.status == 'completed' else 0)
            st_completed = sum(1 for s in st_skills if s.progress >= 100 or s.status == 'completed')
            stage_milestones.append({
                "id": st.id,
                "name": st.name,
                "order": st.order,
                "status": st.status,
                "duration": st.duration,
                "description": st.description,
                "progress": st_prog,
                "totalSkills": len(st_skills),
                "completedSkills": st_completed,
                "skills": [
                    {"name": s.name, "progress": s.progress, "status": s.status}
                    for s in st_skills
                ],
            })

        # Overall roadmap progress for this career
        roadmap_progress = round(sum(s.progress for s in roadmap_skills) / len(roadmap_skills)) if roadmap_skills else 0

        # Career assessment match profile
        assessment_done = has_taken_assessment(user_id)
        rec = CareerRecommendation.objects.filter(user_id=user_id, career_name__iexact=norm_career).first()
        if not rec:
            rec = CareerRecommendation.objects.filter(user_id=user_id, career_name__icontains=norm_career).first()
        if not rec:
            for r in CareerRecommendation.objects.filter(user_id=user_id):
                if r.career_name.lower() in norm_career.lower() or norm_career.lower() in r.career_name.lower():
                    rec = r
                    break

        matched_skills = [s.strip() for s in rec.matched_skills.split(',') if s.strip()] if rec and rec.matched_skills else []
        missing_skills = [s.strip() for s in rec.missing_skills.split(',') if s.strip()] if rec and rec.missing_skills else []
        match_percent = rec.match_percent if rec else 0
        assessment_profile = {
            "has_assessment": assessment_done and (rec is not None),
            "career_name": norm_career,
            "match_percent": match_percent,
            "description": rec.description if rec else (career_def.description if career_def else ""),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "total_skills": len(matched_skills) + len(missing_skills),
        }

        # Tasks specific to this career
        all_tasks = list(Task.objects.filter(user_id=user_id))
        if not all_tasks:
            from tasks.views import _generate_default_tasks_for_user
            _generate_default_tasks_for_user(user_id)
            all_tasks = list(Task.objects.filter(user_id=user_id))

        career_tasks = [t for t in all_tasks if t.skill and t.skill.strip().lower() in career_skill_names]
        if not career_tasks and all_tasks and not career_skill_names:
            career_tasks = all_tasks

        total_tasks = len(career_tasks)
        completed_tasks = sum(1 for t in career_tasks if t.status in ['Completed', 'Submitted'])
        task_percent = round((completed_tasks / total_tasks * 100)) if total_tasks else 0

        # Quizzes and attempts specific to this career
        all_quizzes = list(Quiz.objects.filter(user_id=user_id, status='approved'))
        career_quizzes = [
            q for q in all_quizzes
            if (q.career_name and (norm_career.lower() in q.career_name.lower() or q.career_name.lower() in norm_career.lower()))
            or (q.skill and q.skill.strip().lower() in career_skill_names)
        ]
        career_quiz_ids = set(q.id for q in career_quizzes)

        all_attempts = list(QuizAttempt.objects.filter(user_id=user_id).select_related('quiz').order_by('-completed_at'))
        career_attempts = [
            a for a in all_attempts
            if a.quiz_id in career_quiz_ids
            or (a.quiz.career_name and (norm_career.lower() in a.quiz.career_name.lower() or a.quiz.career_name.lower() in norm_career.lower()))
            or (a.quiz.skill and a.quiz.skill.strip().lower() in career_skill_names)
        ]

        total_career_quizzes = max(len(career_quizzes), len(career_attempts))
        quizzes_completed_count = len(set(a.quiz_id for a in career_attempts))

        valid_attempts = [a for a in career_attempts if a.total_questions and a.total_questions > 0]
        avg_score = round(sum((a.score / a.total_questions) * 100 for a in valid_attempts) / len(valid_attempts)) if valid_attempts else 0
        passed_quizzes_count = len(set(a.quiz_id for a in valid_attempts if (a.score / a.total_questions) >= 0.7))

        recent_attempts = []
        for att in career_attempts[:6]:
            q_title = att.quiz.title if att.quiz and att.quiz.title else "Career Quiz"
            total_q = att.total_questions if att.total_questions and att.total_questions > 0 else 1
            pct = round((att.score / total_q) * 100)
            recent_attempts.append({
                "quizId": att.quiz_id,
                "quizTitle": q_title,
                "skill": att.quiz.skill if att.quiz else "",
                "score": att.score,
                "total": total_q,
                "percent": pct,
                "passed": pct >= 70,
                "date": att.completed_at.strftime("%d %b %Y") if att.completed_at else "",
            })

        # Insights and career readiness
        insights = build_insights(int(user_id), career_name=norm_career) if assessment_done else {}
        readiness_overall = insights.get("overall", 0)

        # Career specific achievements & milestones
        stage1_done = stages.filter(order=1, status='completed').exists() or (
            len(roadmap_skills) > 0 and all(s.progress >= 100 for s in roadmap_skills if s.stage.order == 1)
        )

        achievements = [
            {
                "id": "assessment_match",
                "title": f"Assessed for {norm_career}",
                "description": f"Target aligned with {match_percent}% assessment match" if rec else f"Initial career alignment profile prepared for {norm_career}",
                "achieved": rec is not None,
                "icon": "bi-clipboard2-check",
                "badge": f"{match_percent}% Match" if rec else "Pending",
            },
            {
                "id": "roadmap_active",
                "title": f"{norm_career} Roadmap Activated",
                "description": f"{len(stages)} learning stages sequenced for {norm_career}",
                "achieved": len(stages) > 0,
                "icon": "bi-map",
                "badge": f"{len(stages)} Stages" if len(stages) > 0 else "Locked",
            },
            {
                "id": "stage1_mastered",
                "title": "Foundation Milestone",
                "description": f"Mastered baseline prerequisite skills for {norm_career}",
                "achieved": stage1_done,
                "icon": "bi-building-check",
                "badge": "Stage 1 Done" if stage1_done else "In Progress",
            },
            {
                "id": "quiz_passed",
                "title": f"{norm_career} Knowledge Verified",
                "description": f"Passed knowledge assessments on {norm_career} skills ({passed_quizzes_count} passed)",
                "achieved": passed_quizzes_count >= 1,
                "icon": "bi-patch-check",
                "badge": f"{passed_quizzes_count} Passed" if passed_quizzes_count >= 1 else "Not Started",
            },
            {
                "id": "tasks_champion",
                "title": f"{norm_career} Practical Champion",
                "description": f"Completed practical learning coursework for {norm_career} ({completed_tasks} completed)",
                "achieved": completed_tasks >= 2,
                "icon": "bi-code-square",
                "badge": f"{completed_tasks} Tasks" if completed_tasks > 0 else "0 Tasks",
            },
            {
                "id": "industry_ready",
                "title": f"Job Ready: {norm_career}",
                "description": f"Attained 75%+ overall career readiness score ({readiness_overall}%)",
                "achieved": readiness_overall >= 75,
                "icon": "bi-stars",
                "badge": f"{readiness_overall}% Ready",
            },
        ]

        return Response({
            "target_career": norm_career,
            "targetCareer": norm_career,
            "assessmentCompleted": assessment_done,
            "assessmentProfile": assessment_profile,
            "careerSkills": [s.name for s in roadmap_skills] or list(career_skill_names),
            "metrics": {
                "roadmapProgress": roadmap_progress,
                "tasksCompleted": f"{completed_tasks} of {total_tasks}",
                "taskPercent": task_percent,
                "quizzesCompleted": f"{quizzes_completed_count} of {total_career_quizzes}",
                "quizzesPassed": passed_quizzes_count,
                "averageQuizScore": f"{avg_score}%",
                "readinessScore": readiness_overall,
            },
            "stageMilestones": stage_milestones,
            "achievements": achievements,
            "recentQuizzes": recent_attempts,
            "readiness": insights.get("readiness", {}),
            "skillSummary": insights.get("skill_summary", {}),
            "categories": insights.get("categories", []),
        }, status=status.HTTP_200_OK)
