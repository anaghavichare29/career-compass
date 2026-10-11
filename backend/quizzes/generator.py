import json
import os
import random
import concurrent.futures

try:
    from google import genai
except ImportError:
    genai = None

from .models import Quiz, QuizQuestion
from .question_bank import QUESTION_BANK, GENERIC_TEMPLATES

NUM_QUESTIONS_PER_QUIZ = 10

# How long the request may wait for Gemini before using the offline question bank.
GEMINI_TIMEOUT_SECONDS = 12

_client = None

SKILL_ALIASES = {
    "programming": "Programming",
    "python": "Python",
    "sql": "SQL",
    "excel": "Excel",
    "statistics": "Statistics",
    "data analysis": "Data Analysis",
    "data visualization": "Data Visualization",
    "machine learning": "Machine Learning",
    "data structures": "Programming",
    "algorithms": "Programming",
    "git": "Programming",
    "problem solving": "Programming",
    "react": "Programming",
    "node.js": "Programming",
    "javascript": "Programming",
    "apis": "Programming",
    "communication": "Communication",
    "prioritization": "Product Management",
    "market research": "Product Management",
    "roadmapping": "Product Management",
    "product management": "Product Management",
    "analytics": "Data Analysis",
    "general aptitude": "General Aptitude",
}


def _get_client():
    global _client
    if genai is None:
        return None
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        try:
            _client = genai.Client(api_key=api_key)
        except Exception as e:
            print(f"Error initializing GenAI client: {e}")
            return None
    return _client


def _fetch_gemini_response(client, prompt):
    # Try gemini-3.8-flash first, then gemini-2.5-flash / gemini-2.0-flash
    models = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"]
    for model_name in models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response and response.text:
                return response.text
        except Exception as e:
            print(f"Gemini generation with {model_name} failed: {e}")
            continue
    return None


def _generate_with_gemini(skill, difficulty):
    """Asks Gemini for quiz questions with a 4-second timeout.
    Returns None if it fails, times out, or is busy, so the caller can fall back to the offline question bank."""
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
- Exactly {NUM_QUESTIONS_PER_QUIZ} questions.
- Exactly 4 options per question.
- correct_index is the 0-based index of the correct option.
- Questions must be clear, factually correct, and specific to "{skill}".
"""

    # NOTE: do not use `with ThreadPoolExecutor(...)` here. Its __exit__ waits for the
    # worker thread, which would make the timeout below useless when Gemini is slow.
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    try:
        future = executor.submit(_fetch_gemini_response, client, prompt)
        text = future.result(timeout=GEMINI_TIMEOUT_SECONDS)

        if not text:
            return None

        text = text.strip()
        if text.startswith("```"):
            parts = text.split("```")
            text = parts[1] if len(parts) > 1 else text
            if text.startswith("json"):
                text = text[4:].strip()

        questions = json.loads(text)

        valid_questions = []
        for q in questions:
            try:
                options = q["options"]
                correct = int(q["correct_index"])
                if q["question"] and len(options) == 4 and 0 <= correct < 4:
                    valid_questions.append({"question": q["question"], "options": options, "correct_index": correct})
            except (KeyError, TypeError, ValueError):
                continue

        if len(valid_questions) >= NUM_QUESTIONS_PER_QUIZ:
            return valid_questions[:NUM_QUESTIONS_PER_QUIZ]

        return None

    except Exception as e:
        print(f"Gemini quiz generation failed/busy, falling back to backup question bank: {e}")
        return None
    finally:
        executor.shutdown(wait=False)


def _build_question_pool_offline(skill):
    """Offline fallback — fetches 10 random questions from the backup bank for that quiz."""
    key = SKILL_ALIASES.get(skill.lower().strip(), skill)
    bank_questions = list(QUESTION_BANK.get(key, []))

    if not bank_questions:
        # Check partial match in QUESTION_BANK
        for bank_key, q_list in QUESTION_BANK.items():
            if bank_key.lower() in skill.lower() or skill.lower() in bank_key.lower():
                bank_questions = list(q_list)
                break

    if not bank_questions:
        bank_questions = list(QUESTION_BANK.get("General Aptitude", []))

    random.shuffle(bank_questions)

    if len(bank_questions) >= NUM_QUESTIONS_PER_QUIZ:
        return bank_questions[:NUM_QUESTIONS_PER_QUIZ]

    needed = NUM_QUESTIONS_PER_QUIZ - len(bank_questions)
    templates = list(GENERIC_TEMPLATES)
    random.shuffle(templates)
    generic_pool = templates[:needed]

    generic_filled = [
        {
            "question": q["question"].format(skill=skill),
            "options": q["options"],
            "correct_index": q["correct_index"],
        }
        for q in generic_pool
    ]

    combined = bank_questions + generic_filled
    random.shuffle(combined)
    return combined[:NUM_QUESTIONS_PER_QUIZ]


def generate_quiz_for_skill(user_id, skill, source='ai', status='approved'):
    difficulty = random.choice(["Beginner", "Intermediate"])

    questions = _generate_with_gemini(skill, difficulty)
    if questions is None:
        questions = _build_question_pool_offline(skill)

    quiz = Quiz.objects.create(
        user_id=user_id,
        title=f"{skill} Quiz",
        skill=skill,
        description=f"Test your knowledge of {skill} with this 10-question quiz.",
        difficulty=difficulty,
        duration_minutes=15,
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