import json
import os
import random

from google import genai

from .models import Quiz, QuizQuestion
from .question_bank import QUESTION_BANK, GENERIC_TEMPLATES

NUM_QUESTIONS_PER_QUIZ = 5

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        _client = genai.Client(api_key=api_key)
    return _client


def _generate_with_gemini(skill, difficulty):
    """Asks Gemini for quiz questions. Returns None if it fails for any reason,
    so the caller can fall back to the offline question bank."""
    client = _get_client()
    if client is None:
        return None

    prompt = f"""Generate {NUM_QUESTIONS_PER_QUIZ} multiple choice quiz questions
to test a student's knowledge of "{skill}" at a {difficulty} level.

Respond with ONLY valid JSON, no markdown formatting, no code fences, in this exact shape:
[
  {{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0}},
  ...
]

Rules:
- Exactly 4 options per question.
- correct_index is the 0-based index of the correct option.
- Questions must be clear, factually correct, and specific to "{skill}".
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
        )
        text = response.text.strip()

        # Strip markdown code fences if Gemini adds them anyway
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        questions = json.loads(text)

        # Basic validation — if malformed, treat as a failure
        for q in questions:
            if not all(k in q for k in ("question", "options", "correct_index")):
                return None
            if len(q["options"]) != 4:
                return None

        return questions[:NUM_QUESTIONS_PER_QUIZ]

    except Exception as e:
        print(f"Gemini quiz generation failed, falling back to question bank: {e}")
        return None


def _build_question_pool_offline(skill):
    """Offline fallback — same logic as before, used if Gemini fails or has no key."""
    bank_questions = list(QUESTION_BANK.get(skill, []))
    random.shuffle(bank_questions)

    if len(bank_questions) >= NUM_QUESTIONS_PER_QUIZ:
        return bank_questions[:NUM_QUESTIONS_PER_QUIZ]

    needed = NUM_QUESTIONS_PER_QUIZ - len(bank_questions)
    generic_pool = random.sample(GENERIC_TEMPLATES, min(needed, len(GENERIC_TEMPLATES)))
    generic_filled = [
        {
            "question": q["question"].format(skill=skill),
            "options": q["options"],
            "correct_index": q["correct_index"],
        }
        for q in generic_pool
    ]
    return bank_questions + generic_filled


def generate_quiz_for_skill(user_id, skill, source='ai', status='approved'):
    difficulty = random.choice(["Beginner", "Intermediate"])

    questions = _generate_with_gemini(skill, difficulty)
    if questions is None:
        questions = _build_question_pool_offline(skill)

    quiz = Quiz.objects.create(
        user_id=user_id,
        title=f"{skill} Quiz",
        skill=skill,
        description=f"Test your knowledge of {skill} with this short quiz.",
        difficulty=difficulty,
        duration_minutes=NUM_QUESTIONS_PER_QUIZ * 2,
        source=source,
        status=status,
        ai_recommended=(source == 'ai'),
    )

    QuizQuestion.objects.bulk_create([
        QuizQuestion(
            quiz=quiz,
            question=q["question"],
            options=q["options"],
            correct_index=q["correct_index"],
        )
        for q in questions
    ])

    return quiz


def get_skills_for_user(user_id):
    from roadmaps.models import RoadmapStage

    skills = []
    for stage in RoadmapStage.objects.filter(user_id=user_id).order_by('order'):
        for skill in stage.skills.all():
            if skill.name not in skills:
                skills.append(skill.name)

    return skills if skills else ["General Aptitude"]


def generate_initial_quizzes(user_id, count=10):
    Quiz.objects.filter(user_id=user_id, source='ai').delete()

    skills = get_skills_for_user(user_id)
    created = []
    for i in range(count):
        skill = skills[i % len(skills)]
        created.append(generate_quiz_for_skill(user_id, skill, source='ai', status='approved'))

    return created