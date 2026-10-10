from collections import Counter
from roadmaps.models import RoadmapStage, RoadmapSkill
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import AssessmentSubmission
from careers.models import CareerDefinition, CareerRecommendation


# Maps the 3 skill-confidence question ids to a skill name.
# Must match the `id`s used in StudentAssessment.jsx's "skills" section.
SKILL_QUESTION_MAP = {
    "skill1": "Programming",
    "skill2": "Data Analysis",
    "skill3": "Communication",
}

# A student is considered "comfortable" with a rated skill
# if they picked one of the top 2 confidence levels (level 3 or 4).
CONFIDENT_LEVEL_THRESHOLD = 3

# Loosely maps a self-rated skill to the specific skill names used
# in CareerDefinition.required_skills, so we can mark those as "matched".
SKILL_ALIASES = {
    "Programming": ["Programming", "Python", "JavaScript", "Data Structures",
                     "Algorithms", "Git", "Problem Solving", "React", "Node.js", "APIs"],
    "Data Analysis": ["SQL", "Statistics", "Excel", "Data Visualization", "Machine Learning"],
    "Communication": ["Communication", "Prioritization", "Market Research", "Roadmapping"],
}


class AssessmentSubmitView(APIView):

    def post(self, request):
        user_id = request.data.get("user_id")
        answers = request.data.get("answers", {})
        academic_info = request.data.get("academic_info", {})

        if not user_id:
            return Response(
                {"detail": "user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Save the raw submission for records
        AssessmentSubmission.objects.create(
            user_id=user_id,
            answers=answers,
            academic_info=academic_info,
        )

        # 2. Collect tags from interest/aptitude answers
        tag_counter = Counter()
        for question_id, answer in answers.items():
            if isinstance(answer, dict) and "tags" in answer:
                for tag in answer["tags"]:
                    tag_counter[tag.strip().lower()] += 1

        student_tags = set(tag_counter.keys())

        # 3. Collect skills the student is confident in
        known_skills = set()
        for question_id, skill_name in SKILL_QUESTION_MAP.items():
            answer = answers.get(question_id)
            if isinstance(answer, dict) and answer.get("level", 0) >= CONFIDENT_LEVEL_THRESHOLD:
                known_skills.update(SKILL_ALIASES.get(skill_name, [skill_name]))

        # 4. Score every career in the catalog
        scored_careers = []
        for career in CareerDefinition.objects.all():
            career_tags = set(career.tags_list())
            if not career_tags:
                continue

            overlap = student_tags & career_tags
            match_percent = round(len(overlap) / len(career_tags) * 100)

            career_skills = career.skills_list()
            matched_skills = [s for s in career_skills if s in known_skills]
            missing_skills = [s for s in career_skills if s not in known_skills]

            scored_careers.append({
                "career_name": career.name,
                "description": career.description,
                "match_percent": match_percent,
                "matched_skills": ",".join(matched_skills),
                "missing_skills": ",".join(missing_skills),
            })

        # 5. Keep the top 5 matches
        scored_careers.sort(key=lambda c: c["match_percent"], reverse=True)
        top_careers = scored_careers[:5]

        # 6. Replace this user's old recommendations with the new ones
        CareerRecommendation.objects.filter(user_id=user_id).delete()

        CareerRecommendation.objects.bulk_create([
            CareerRecommendation(
                user_id=user_id,
                career_name=c["career_name"],
                match_percent=c["match_percent"],
                description=c["description"],
                matched_skills=c["matched_skills"],
                missing_skills=c["missing_skills"],
            )
            for c in top_careers
        ])

        # 7. Update student academic info in students table
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT student_id FROM students WHERE user_id = %s", [user_id])
                row = cursor.fetchone()
                degree = academic_info.get("degree", "").strip()
                branch = academic_info.get("branch", "").strip()
                course_str = f"{degree} in {branch}" if (degree and branch) else (degree or branch)
                semester = academic_info.get("semester", "")
                year_val = None
                if semester:
                    try:
                        year_val = max(1, (int(semester) + 1) // 2)
                    except Exception:
                        year_val = None
                score_val = None
                try:
                    score_val = float(academic_info.get("cgpa"))
                except Exception:
                    pass

                if row:
                    cursor.execute(
                        "UPDATE students SET course = COALESCE(NULLIF(%s, ''), course), year = COALESCE(%s, year), academic_score = COALESCE(%s, academic_score) WHERE user_id = %s",
                        [course_str, year_val, score_val, user_id]
                    )
                else:
                    cursor.execute(
                        "INSERT INTO students (user_id, college, course, year, academic_score) VALUES (%s, %s, %s, %s, %s)",
                        [user_id, "College of Engineering", course_str or "B.Tech IT", year_val or 3, score_val or 8.5]
                    )
        except Exception as e:
            print(f"Error updating students academic record: {e}")

        # 8. Generate a roadmap and tasks from the top career match
        if top_careers:
            top = top_careers[0]
            matched_skill_names = set(
                s.strip() for s in top["matched_skills"].split(",") if s.strip()
            )

            career_obj = CareerDefinition.objects.filter(name=top["career_name"]).first()
            if career_obj:
                _generate_roadmap(user_id, career_obj, matched_skill_names)

        # 9. Send notification
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                    [
                        user_id,
                        "Career Assessment Complete!",
                        f"Your assessment has been evaluated. Your top recommendation is {top_careers[0]['career_name'] if top_careers else 'available'} with a personalized roadmap and learning tasks.",
                        "assessment",
                    ]
                )
        except Exception:
            pass

        return Response(
            {"detail": "Assessment submitted and recommendations generated.",
             "recommendations_created": len(top_careers),
             "top_career": top_careers[0]["career_name"] if top_careers else None},
            status=status.HTTP_201_CREATED,
        )

def _generate_roadmap(user_id, career, matched_skill_names):
    from roadmaps.models import RoadmapStage, RoadmapSkill
    from tasks.models import Task
    import datetime

    STAGE_TEMPLATE = ["Foundation", "Core Skills", "Specialization", "Portfolio & Projects"]
    STAGE_DURATIONS = ["2–3 Weeks", "3–4 Weeks", "3–4 Weeks", "2–3 Weeks"]
    STAGE_DESCRIPTIONS = [
        "Build a strong foundation in the core tools and concepts for this career.",
        "Develop the core technical skills required for this career path.",
        "Go deeper into specialized skills that set you apart in this field.",
        "Apply your skills to practical projects and build a portfolio.",
    ]

    RoadmapStage.objects.filter(user_id=user_id).delete()
    Task.objects.filter(user_id=user_id, ai_recommended=True).delete()

    all_skills = career.skills_list()
    if not all_skills:
        return

    stage_count = len(STAGE_TEMPLATE)
    buckets = [[] for _ in range(stage_count)]
    for index, skill in enumerate(all_skills):
        buckets[index % stage_count].append(skill)

    current_assigned = False
    today = datetime.date.today()
    stage_days = [14, 28, 45, 60]

    for stage_index, skill_names in enumerate(buckets):
        if not skill_names:
            continue

        stage = RoadmapStage.objects.create(
            user_id=user_id,
            name=STAGE_TEMPLATE[stage_index],
            description=STAGE_DESCRIPTIONS[stage_index],
            duration=STAGE_DURATIONS[stage_index],
            status='upcoming',
            order=stage_index + 1,
        )

        stage_statuses = []
        deadline_date = today + datetime.timedelta(days=stage_days[min(stage_index, len(stage_days) - 1)])

        for skill_name in skill_names:
            # Self-reported confidence or a career match is not proof that a
            # roadmap skill/course has been completed. Every new roadmap starts
            # at zero; progress changes only when the student completes lessons.
            if not current_assigned:
                status, progress = 'current', 0
                current_assigned = True
            else:
                status, progress = 'upcoming', 0
            completed_lessons = 0

            from roadmaps.skill_content import get_skill_content
            content = get_skill_content(skill_name)
            RoadmapSkill.objects.create(
                stage=stage,
                name=skill_name,
                status=status,
                progress=progress,
                what_to_learn=content["what_to_learn"],
                why_it_matters=content["why_it_matters"],
                resources=content["resources"],
            )
            stage_statuses.append(status)

            # Generate suggested course & task
            Task.objects.create(
                user_id=user_id,
                title=f"Master {skill_name}: Core Concepts & Practice",
                description=f"Follow structured module lessons and practical assignments for {skill_name} in stage '{stage.name}'.",
                skill=skill_name,
                course_name=f"{skill_name} Fundamentals Course",
                deadline=deadline_date,
                completed_lessons=completed_lessons,
                total_lessons=8,
                priority='High' if stage_index == 0 else ('Medium' if stage_index == 1 else 'Low'),
                ai_recommended=True,
                status='Completed' if completed_lessons >= 8 else ('In Progress' if completed_lessons > 0 else 'Not Started'),
            )

        if all(s == 'completed' for s in stage_statuses):
            stage.status = 'completed'
        elif 'current' in stage_statuses:
            stage.status = 'current'
        else:
            stage.status = 'upcoming'
        stage.save()

    # Recalculate progress summary
    from tasks.views import _recalculate_user_progress
    _recalculate_user_progress(user_id)
