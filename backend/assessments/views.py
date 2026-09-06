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

                # 7. Generate a roadmap from the top career match
        if top_careers:
            top = top_careers[0]
            matched_skill_names = set(
                s.strip() for s in top["matched_skills"].split(",") if s.strip()
            )

            career_obj = CareerDefinition.objects.filter(name=top["career_name"]).first()
            if career_obj:
                _generate_roadmap(user_id, career_obj, matched_skill_names)
        return Response(
            {"detail": "Assessment submitted and recommendations generated.",
             "recommendations_created": len(top_careers)},
            status=status.HTTP_201_CREATED,
        )

def _generate_roadmap(user_id, career, matched_skill_names):
    from roadmaps.models import RoadmapStage, RoadmapSkill

    STAGE_TEMPLATE = ["Foundation", "Core Skills", "Specialization", "Portfolio & Projects"]
    STAGE_DURATIONS = ["2–3 Weeks", "3–4 Weeks", "3–4 Weeks", "2–3 Weeks"]
    STAGE_DESCRIPTIONS = [
        "Build a strong foundation in the core tools and concepts for this career.",
        "Develop the core technical skills required for this career path.",
        "Go deeper into specialized skills that set you apart in this field.",
        "Apply your skills to practical projects and build a portfolio.",
    ]

    RoadmapStage.objects.filter(user_id=user_id).delete()

    all_skills = career.skills_list()
    if not all_skills:
        return

    stage_count = len(STAGE_TEMPLATE)
    buckets = [[] for _ in range(stage_count)]
    for index, skill in enumerate(all_skills):
        buckets[index % stage_count].append(skill)

    current_assigned = False

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
        for skill_name in skill_names:
            if skill_name in matched_skill_names:
                status, progress = 'completed', 100
            elif not current_assigned:
                status, progress = 'current', 40
                current_assigned = True
            else:
                status, progress = 'upcoming', 0

            RoadmapSkill.objects.create(stage=stage, name=skill_name, status=status, progress=progress)
            stage_statuses.append(status)

        if all(s == 'completed' for s in stage_statuses):
            stage.status = 'completed'
        elif 'current' in stage_statuses:
            stage.status = 'current'
        else:
            stage.status = 'upcoming'
        stage.save()