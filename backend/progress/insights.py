"""
Skill-gap and career-readiness insights, computed from what the student has
actually done. Nothing here is invented: if a student has not taken the
assessment there is no data, and any area they haven't started scores 0.

Inputs
  * top career recommendation (from the assessment)  -> which skills are required
  * learning tasks                                     -> skill proficiency / practical experience
  * roadmap (kept in sync with tasks)                  -> learning progress
  * quiz attempts                                      -> knowledge (+ a small proficiency bonus)
"""
from collections import defaultdict

from careers.models import CareerDefinition, CareerRecommendation
from quizzes.models import QuizAttempt
from roadmaps.models import RoadmapSkill
from roadmaps.services import sync_roadmap_progress
from tasks.models import Task

# Proficiency (0-100) a student needs in each skill. Finishing every task for a
# skill gives 100, so completing the work always meets the requirement.
REQUIRED_LEVEL = 85

# Passing a quiz on a skill can add up to this many points on top of task progress.
QUIZ_BONUS_MAX = 15

CATEGORY_TARGETS = {
    "Technical Skills": 85,
    "Learning Progress": 100,
    "Practical Experience": 85,
    "Knowledge Assessment": 75,
}

SKILL_CATEGORIES = {
    "python": "Programming", "javascript": "Programming", "programming": "Programming",
    "data structures": "Computer Science", "algorithms": "Computer Science",
    "problem solving": "Computer Science", "git": "Developer Tools",
    "react": "Frontend", "node.js": "Backend", "apis": "Backend", "databases": "Backend",
    "sql": "Database", "excel": "Spreadsheets", "statistics": "Data Analysis",
    "analytics": "Data Analysis", "data visualization": "Visualization",
    "machine learning": "AI / ML", "deep learning": "AI / ML", "model deployment": "AI / ML",
    "aws": "Cloud", "docker": "DevOps / Cloud", "kubernetes": "DevOps / Cloud",
    "linux": "Systems", "networking": "Systems",
    "security fundamentals": "Security", "risk assessment": "Security",
    "incident response": "Security",
    "figma": "Design Tools", "wireframing": "Design", "prototyping": "Design",
    "visual design": "Design", "user research": "Research",
    "communication": "Professional Skills", "prioritization": "Product",
    "market research": "Product", "roadmapping": "Product",
}


def _avg(values):
    values = list(values)
    return sum(values) / len(values) if values else 0


def _skill_status(current, required):
    if current >= required:
        return "Strong", "green"
    if current >= 65:
        return "Almost There", "blue"
    if current >= 30:
        return "Needs Improvement", "orange"
    return "Beginner", "purple"


def _readiness_level(overall):
    if overall >= 75:
        return "Job Ready", "You meet most targets for this career. Start applying and practising interviews."
    if overall >= 60:
        return "Accelerating", "You are close. A little more practice in your weakest areas will get you there."
    if overall >= 25:
        return "Foundational", "You have a solid start. Keep completing tasks and quizzes to build on it."
    return "Getting Started", "You are at the beginning of your journey. Work through your roadmap one step at a time."


def _split_csv(value):
    return [s.strip() for s in (value or "").split(",") if s.strip()]


def has_taken_assessment(user_id):
    return CareerRecommendation.objects.filter(user_id=user_id).exists()


def build_insights(user_id):
    top_rec = (
        CareerRecommendation.objects.filter(user_id=user_id)
        .order_by("-match_percent", "id")
        .first()
    )
    if not top_rec:
        return {"has_data": False}

    career_def = CareerDefinition.objects.filter(name=top_rec.career_name).first()
    required_skills = career_def.skills_list() if career_def else (
        _split_csv(top_rec.matched_skills) + _split_csv(top_rec.missing_skills)
    )
    if not required_skills:
        return {"has_data": False}

    # Make sure the roadmap reflects the latest task progress before reading it.
    sync_roadmap_progress(user_id)

    tasks = list(Task.objects.filter(user_id=user_id))
    task_pct_by_skill = defaultdict(list)
    for t in tasks:
        if t.skill:
            task_pct_by_skill[t.skill.strip().lower()].append(t.percent)

    attempts = list(QuizAttempt.objects.filter(user_id=user_id).select_related("quiz"))
    best_by_quiz = {}
    for a in attempts:
        pct = (a.score / max(a.total_questions, 1)) * 100
        best_by_quiz[a.quiz_id] = max(best_by_quiz.get(a.quiz_id, 0), pct)
    quiz_best_by_skill = defaultdict(list)
    for a in attempts:
        if a.quiz.skill:
            quiz_best_by_skill[a.quiz.skill.strip().lower()].append(best_by_quiz[a.quiz_id])

    # ---------- per-skill proficiency ----------
    skills = []
    for name in required_skills:
        key = name.strip().lower()
        base = round(_avg(task_pct_by_skill.get(key, [])))
        bonus = round(max(quiz_best_by_skill[key]) * QUIZ_BONUS_MAX / 100) if quiz_best_by_skill.get(key) else 0
        current = min(100, base + bonus)
        status_label, color = _skill_status(current, REQUIRED_LEVEL)
        skills.append({
            "name": name,
            "category": SKILL_CATEGORIES.get(key, "Technical Skill"),
            "current": current,
            "required": REQUIRED_LEVEL,
            "status": status_label,
            "color": color,
        })

    overall_skill = round(_avg(s["current"] for s in skills))
    strong = [s for s in skills if s["current"] >= s["required"]]
    to_improve = sorted(
        (s for s in skills if s["current"] < s["required"]),
        key=lambda s: s["required"] - s["current"],
        reverse=True,
    )
    largest = to_improve[0] if to_improve else None

    skill_summary = {
        "overall": overall_skill,
        "strong_count": len(strong),
        "improve_count": len(to_improve),
        "largest_gap": (
            {"name": largest["name"], "gap": largest["required"] - largest["current"]}
            if largest else None
        ),
    }

    if largest:
        skill_insight = {
            "title": f"{largest['name']} is currently your highest-priority skill gap",
            "description": (
                f"You are at {largest['current']}% in {largest['name']} and the target for "
                f"{top_rec.career_name} is {largest['required']}%. Closing this gap will "
                f"move your career readiness the most."
            ),
            "recommendation": (
                f"Complete your {largest['name']} learning task and take its quiz to "
                f"close the {largest['required'] - largest['current']}% gap."
            ),
        }
    else:
        skill_insight = {
            "title": f"You meet every skill target for {top_rec.career_name}",
            "description": "All of your required skills are at or above the recommended level.",
            "recommendation": "Try advanced quizzes or a portfolio project to stand out.",
        }

    # ---------- readiness ----------
    roadmap_skills = list(RoadmapSkill.objects.filter(stage__user_id=user_id))
    learning = round(_avg(rs.progress for rs in roadmap_skills))
    practical = round(_avg(t.percent for t in tasks))
    knowledge = round(_avg(best_by_quiz.values()))
    overall = round((overall_skill + learning + practical + knowledge) / 4)

    done_tasks = sum(1 for t in tasks if t.status in ("Completed", "Submitted"))
    categories = [
        {"name": "Technical Skills", "value": overall_skill, "icon": "bi-code-slash", "color": "blue",
         "description": f"Average proficiency across the {len(skills)} skills {top_rec.career_name} needs"},
        {"name": "Learning Progress", "value": learning, "icon": "bi-book", "color": "purple",
         "description": "Progress across the skills in your career roadmap"},
        {"name": "Practical Experience", "value": practical, "icon": "bi-kanban", "color": "orange",
         "description": f"{done_tasks} of {len(tasks)} learning tasks completed or submitted"},
        {"name": "Knowledge Assessment", "value": knowledge, "icon": "bi-patch-question", "color": "green",
         "description": (f"Best scores across {len(best_by_quiz)} quiz{'zes' if len(best_by_quiz) != 1 else ''} taken"
                         if best_by_quiz else "Take a quiz to measure what you know")},
    ]

    strengths = []
    if strong:
        strengths.append(f"Target level reached in {', '.join(s['name'] for s in strong[:3])}")
    for c in sorted(categories, key=lambda c: c["value"], reverse=True):
        if c["value"] >= 60:
            strengths.append(f"{c['name']} is at {c['value']}%")
    strengths.append(f"Career assessment completed ({top_rec.match_percent}% match for {top_rec.career_name})")
    strengths = strengths[:4]

    improvement_areas = [
        {"name": c["name"], "progress": c["value"], "target": CATEGORY_TARGETS[c["name"]]}
        for c in categories if c["value"] < CATEGORY_TARGETS[c["name"]]
    ]
    improvement_areas.sort(key=lambda a: a["target"] - a["progress"], reverse=True)

    next_steps = [
        f"Build your {s['name']} skills ({s['current']}% now, target {s['required']}%)" for s in to_improve[:2]
    ]
    if not best_by_quiz:
        next_steps.append("Take your first quiz to measure your knowledge")
    elif knowledge < CATEGORY_TARGETS["Knowledge Assessment"]:
        next_steps.append("Retake quizzes on your weaker skills to lift your score")
    if tasks and done_tasks < len(tasks):
        next_steps.append(f"Finish your open learning tasks ({len(tasks) - done_tasks} remaining)")
    if not next_steps:
        next_steps.append("Request guidance from an industry professional to prepare for applications")
    next_steps = next_steps[:3]

    level, level_note = _readiness_level(overall)
    insight = (
        f"You are {overall}% ready for {top_rec.career_name}. Your biggest opportunity is {largest['name']}."
        if largest else f"You are {overall}% ready for {top_rec.career_name} and meet every skill target."
    )

    readiness = {
        "overall": overall,
        "insight": insight,
        "skill_progress": overall_skill,
        "roadmap_progress": learning,
        "level": level,
        "level_note": level_note,
        "categories": categories,
        "strengths": strengths,
        "improvement_areas": improvement_areas,
        "improvementAreas": improvement_areas,
        "next_steps": next_steps,
    }

    return {
        "has_data": True,
        "overall": overall,
        "target_career": top_rec.career_name,
        "targetCareer": top_rec.career_name,
        "career_match": top_rec.match_percent,
        "careerMatch": top_rec.match_percent,
        "skills": skills,
        "skill_summary": skill_summary,
        "summary": skill_summary,
        "skill_insight": skill_insight,
        "insight": skill_insight,
        "readiness": readiness,
        "categories": categories,
        "strengths": strengths,
        "improvement_areas": improvement_areas,
        "improvementAreas": improvement_areas,
        "next_steps": next_steps,
    }
