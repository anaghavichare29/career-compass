import json
import os
import random
import re
import concurrent.futures

try:
    from google import genai
except ImportError:
    genai = None

from .models import Quiz, QuizQuestion
from .question_bank import QUESTION_BANK, GENERIC_TEMPLATES

NUM_QUESTIONS_PER_QUIZ = 10
GEMINI_TIMEOUT_SECONDS = 22

_client = None

SKILL_ALIASES = {
    # SQL & Databases
    "sql": "SQL",
    "mysql": "SQL",
    "postgresql": "SQL",
    "postgres": "SQL",
    "sqlite": "SQL",
    "databases": "SQL",
    "database": "SQL",
    "relational database": "SQL",
    "data warehousing": "SQL",
    "etl": "SQL",

    # Python & Backend
    "python": "Python",
    "django": "Python",
    "flask": "Python",
    "fastapi": "Python",

    # JavaScript & Web
    "javascript": "JavaScript",
    "typescript": "JavaScript",
    "es6": "JavaScript",
    "js": "JavaScript",

    # Frontend & React
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "frontend": "React",
    "vue": "React",
    "next.js": "React",
    "react native": "React",

    # Node.js & APIs
    "node.js": "Node.js",
    "node": "Node.js",
    "express": "Node.js",
    "express.js": "Node.js",
    "apis": "Node.js",
    "api": "Node.js",
    "rest apis": "Node.js",
    "backend": "Node.js",

    # HTML & CSS
    "html": "HTML & CSS",
    "css": "HTML & CSS",
    "html5": "HTML & CSS",
    "css3": "HTML & CSS",
    "web development": "HTML & CSS",
    "responsive design": "HTML & CSS",

    # Git
    "git": "Git",
    "github": "Git",
    "version control": "Git",

    # DevOps & Containers
    "docker": "Docker & Kubernetes",
    "kubernetes": "Docker & Kubernetes",
    "ci/cd": "Docker & Kubernetes",
    "devops": "Docker & Kubernetes",
    "terraform": "Docker & Kubernetes",

    # Linux & OS
    "linux": "Linux",
    "bash": "Linux",
    "shell scripting": "Linux",
    "operating systems": "Linux",
    "networking": "Linux",

    # Cloud
    "aws": "AWS & Cloud",
    "cloud": "AWS & Cloud",
    "cloud computing": "AWS & Cloud",
    "azure": "AWS & Cloud",
    "gcp": "AWS & Cloud",
    "cloud platforms": "AWS & Cloud",

    # DSA & Programming
    "programming": "Data Structures & Algorithms",
    "data structures": "Data Structures & Algorithms",
    "algorithms": "Data Structures & Algorithms",
    "dsa": "Data Structures & Algorithms",
    "problem solving": "Data Structures & Algorithms",

    # System Design
    "system design": "System Design",
    "distributed systems": "System Design",
    "microservices": "System Design",
    "architecture": "System Design",

    # Machine Learning & AI
    "machine learning": "Machine Learning",
    "deep learning": "Machine Learning",
    "ai": "Machine Learning",
    "scikit-learn": "Machine Learning",
    "tensorflow": "Machine Learning",
    "pytorch": "Machine Learning",
    "nlp": "Machine Learning",
    "computer vision": "Machine Learning",
    "model deployment": "Machine Learning",

    # Data Analysis
    "data analysis": "Data Analysis",
    "pandas": "Data Analysis",
    "numpy": "Data Analysis",
    "eda": "Data Analysis",
    "analytics": "Data Analysis",
    "data analytics": "Data Analysis",
    "data visualization": "Data Analysis",
    "visualization": "Data Analysis",

    # Statistics
    "statistics": "Statistics",
    "probability": "Statistics",
    "math": "Statistics",
    "mathematics": "Statistics",

    # Excel & BI
    "excel": "Excel",
    "spreadsheets": "Excel",
    "power bi": "Excel",
    "tableau": "Excel",
    "business intelligence": "Excel",
    "bi": "Excel",

    # Cybersecurity
    "cybersecurity": "Cybersecurity",
    "security": "Cybersecurity",
    "security fundamentals": "Cybersecurity",
    "risk assessment": "Cybersecurity",
    "siem": "Cybersecurity",
    "incident response": "Cybersecurity",
    "ethical hacking": "Cybersecurity",
    "penetration testing": "Cybersecurity",

    # UI/UX & Design
    "ui design": "UI/UX Design",
    "ux design": "UI/UX Design",
    "ui/ux": "UI/UX Design",
    "figma": "UI/UX Design",
    "wireframing": "UI/UX Design",
    "prototyping": "UI/UX Design",
    "visual design": "UI/UX Design",
    "design systems": "UI/UX Design",
    "accessibility": "UI/UX Design",

    # Product Management
    "product management": "Product Management",
    "prioritization": "Product Management",
    "roadmapping": "Product Management",
    "user research": "Product Management",
    "market research": "Product Management",
    "agile": "Product Management",
    "scrum": "Product Management",

    # Communication & Soft Skills
    "communication": "Communication",
    "soft skills": "Communication",
    "stakeholder management": "Communication",
    "process mapping": "Communication",

    # Aptitude
    "general aptitude": "General Aptitude",
    "aptitude": "General Aptitude",
    "logical reasoning": "General Aptitude",
    "quantitative aptitude": "General Aptitude",
    "critical thinking": "General Aptitude",
    "numerical reasoning": "General Aptitude",
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
    models = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-flash-lite-latest"]
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


def _generate_with_gemini(skill, difficulty, count=NUM_QUESTIONS_PER_QUIZ):
    """Asks Gemini for quiz questions with a timeout.
    Returns valid questions list or None on failure/timeout."""
    client = _get_client()
    if client is None:
        return None

    prompt = f"""Generate {count} multiple choice quiz questions
to test a student's knowledge of "{skill}" at a {difficulty} level.

Respond with ONLY valid JSON, no markdown formatting, no code fences, in this exact shape:
[
  {{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0}},
  ...
]

Rules:
- Exactly {count} questions.
- Exactly 4 options per question.
- correct_index is the 0-based integer index (0, 1, 2, or 3) of the correct option.
- Every question and all 4 options must be factually accurate, realistic, and specific to "{skill}".
- Do not use placeholder options like "None of the above" or nonsensical text.
"""

    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    try:
        future = executor.submit(_fetch_gemini_response, client, prompt)
        text = future.result(timeout=GEMINI_TIMEOUT_SECONDS)

        if not text:
            return None

        text = text.strip()
        # Strip markdown fences
        if text.startswith("```"):
            parts = text.split("```")
            text = parts[1] if len(parts) > 1 else text
            if text.startswith("json"):
                text = text[4:].strip()

        # Find JSON array using regex if necessary
        match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
        if match:
            text = match.group(0)

        questions = json.loads(text)

        valid_questions = []
        for q in questions:
            try:
                options = q["options"]
                correct = int(q["correct_index"])
                if q["question"] and len(options) == 4 and 0 <= correct < 4:
                    valid_questions.append({
                        "question": q["question"].strip(),
                        "options": [str(opt).strip() for opt in options],
                        "correct_index": correct,
                    })
            except (KeyError, TypeError, ValueError):
                continue

        if len(valid_questions) >= min(count, 4):
            return valid_questions[:count]

        return None

    except Exception as e:
        print(f"Gemini quiz generation failed/busy, falling back to backup question bank: {e}")
        return None
    finally:
        executor.shutdown(wait=False)


def _build_question_pool_offline(skill, count=NUM_QUESTIONS_PER_QUIZ):
    """Offline fallback — fetches high-quality questions for the skill domain."""
    skill_lower = skill.lower().strip()
    key = SKILL_ALIASES.get(skill_lower)

    if not key:
        # Partial match in aliases
        for alias, domain in SKILL_ALIASES.items():
            if alias in skill_lower or skill_lower in alias:
                key = domain
                break

    if not key:
        # Partial match in QUESTION_BANK
        for bank_key in QUESTION_BANK.keys():
            if bank_key.lower() in skill_lower or skill_lower in bank_key.lower():
                key = bank_key
                break

    if not key:
        # Keyword heuristic
        if any(w in skill_lower for w in ["web", "front", "react", "vue", "angular", "css", "html"]):
            key = "React"
        elif any(w in skill_lower for w in ["data", "pandas", "analytic", "numpy", "power"]):
            key = "Data Analysis"
        elif any(w in skill_lower for w in ["ai", "learn", "neural", "model", "vision"]):
            key = "Machine Learning"
        elif any(w in skill_lower for w in ["cloud", "server", "aws", "deploy", "docker"]):
            key = "AWS & Cloud"
        elif any(w in skill_lower for w in ["security", "hack", "threat", "auth", "crypto"]):
            key = "Cybersecurity"
        elif any(w in skill_lower for w in ["design", "ui", "ux", "figma", "wireframe"]):
            key = "UI/UX Design"
        elif any(w in skill_lower for w in ["product", "agile", "scrum", "roadmap"]):
            key = "Product Management"
        elif any(w in skill_lower for w in ["api", "node", "backend", "server", "django"]):
            key = "Node.js"
        elif any(w in skill_lower for w in ["code", "program", "logic", "algorithm"]):
            key = "Data Structures & Algorithms"
        else:
            key = "Python"

    bank_questions = [dict(q) for q in QUESTION_BANK.get(key, QUESTION_BANK["Python"])]
    random.shuffle(bank_questions)

    if len(bank_questions) >= count:
        return bank_questions[:count]

    # Fill up if needed using generic templates customized with the skill name
    needed = count - len(bank_questions)
    templates = list(GENERIC_TEMPLATES)
    random.shuffle(templates)
    generic_filled = [
        {
            "question": q["question"].format(skill=skill),
            "options": q["options"],
            "correct_index": q["correct_index"],
        }
        for q in templates[:needed]
    ]

    combined = bank_questions + generic_filled
    random.shuffle(combined)
    return combined[:count]


def normalize_career_name(name):
    if not name or name in ('undefined', 'null'):
        return ""
    clean = str(name).strip()
    if re.search(r'\b(ui\s*/\s*ux|ux\s*/\s*ui)\b', clean, re.IGNORECASE):
        return "UX/UI Designer"
    try:
        from careers.models import CareerDefinition
        cd = CareerDefinition.objects.filter(name__iexact=clean).first()
        if cd:
            return cd.name
        cd_part = CareerDefinition.objects.filter(name__icontains=clean).first()
        if cd_part:
            return cd_part.name
    except Exception:
        pass
    return clean


def generate_quiz_for_skill(user_id, skill, source='ai', status='approved', count=NUM_QUESTIONS_PER_QUIZ, career_name=None):
    difficulty = random.choice(["Beginner", "Intermediate"])

    questions = _generate_with_gemini(skill, difficulty, count=count)
    if not questions or len(questions) < min(count, 4):
        questions = _build_question_pool_offline(skill, count=count)

    quiz = Quiz.objects.create(
        user_id=user_id,
        title=f"{skill} Quiz",
        skill=skill,
        description=f"Test your knowledge of {skill} with this {len(questions)}-question quiz.",
        difficulty=difficulty,
        duration_minutes=15,
        source=source,
        status=status,
        ai_recommended=(source == 'ai'),
        career_name=career_name,
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


def get_skills_for_user(user_id, career_name=None):
    from roadmaps.models import RoadmapStage
    from careers.models import CareerRecommendation, CareerDefinition
    from roadmaps.services import CAREER_ROADMAP_TEMPLATES

    skills = []
    norm_career = normalize_career_name(career_name) if career_name else ""

    # 1. If career_name is provided, prioritize that career's definition skills
    if norm_career:
        c_def = CareerDefinition.objects.filter(name__iexact=norm_career).first()
        if not c_def:
            c_def = CareerDefinition.objects.filter(name__icontains=norm_career).first()
        if c_def:
            for s in c_def.skills_list():
                if s and s not in skills:
                    skills.append(s)

        # Also check roadmap stages for this career
        for stage in RoadmapStage.objects.filter(user_id=user_id, career_name__iexact=norm_career).order_by('order'):
            for skill in stage.skills.all():
                if skill.name and skill.name not in skills:
                    skills.append(skill.name)

        # Also check recommendation record for this career
        rec = CareerRecommendation.objects.filter(user_id=user_id, career_name__iexact=norm_career).first()
        if rec:
            for s in (rec.matched_skills or '').split(','):
                s = s.strip()
                if s and s not in skills:
                    skills.append(s)
            for s in (rec.missing_skills or '').split(','):
                s = s.strip()
                if s and s not in skills:
                    skills.append(s)

        # Check template
        c_key = norm_career.lower().strip()
        if c_key in CAREER_ROADMAP_TEMPLATES:
            for st in CAREER_ROADMAP_TEMPLATES[c_key]:
                for s in st.get("skills", []):
                    if s and s not in skills:
                        skills.append(s)

        if skills:
            return skills

    # 2. General fallback: from existing RoadmapStage records for user
    for stage in RoadmapStage.objects.filter(user_id=user_id).order_by('order'):
        for skill in stage.skills.all():
            if skill.name and skill.name not in skills:
                skills.append(skill.name)

    # 3. From CareerRecommendation records if roadmap not initialized
    if not skills:
        recs = CareerRecommendation.objects.filter(user_id=user_id).order_by('-match_percent')
        for rec in recs:
            for s in (rec.matched_skills or '').split(','):
                s = s.strip()
                if s and s not in skills:
                    skills.append(s)
            for s in (rec.missing_skills or '').split(','):
                s = s.strip()
                if s and s not in skills:
                    skills.append(s)

            c_key = rec.career_name.lower().strip()
            if c_key in CAREER_ROADMAP_TEMPLATES:
                for st in CAREER_ROADMAP_TEMPLATES[c_key]:
                    for s in st.get("skills", []):
                        if s and s not in skills:
                            skills.append(s)

    # 4. Default high-demand tech skills if no assessment or roadmap
    if not skills:
        skills = [
            "Python", "SQL", "JavaScript", "Problem Solving",
            "Data Analysis", "Git", "React", "General Aptitude"
        ]

    return skills


def generate_initial_quizzes(user_id, count=10, career_name=None):
    norm_career = normalize_career_name(career_name) if career_name else None
    if norm_career:
        Quiz.objects.filter(user_id=user_id, source='ai', career_name__iexact=norm_career).delete()
    else:
        Quiz.objects.filter(user_id=user_id, source='ai').delete()

    skills = get_skills_for_user(user_id, career_name=norm_career)
    created = []
    for i in range(min(count, len(skills) * 2)):
        skill = skills[i % len(skills)]
        created.append(generate_quiz_for_skill(user_id, skill, source='ai', status='approved', career_name=norm_career))

    # Also ensure there are general aptitude quizzes available
    aptitude_skills = ["General Aptitude", "Logical Reasoning", "Quantitative Aptitude", "Critical Thinking", "Verbal Reasoning"]
    aptitude_count = Quiz.objects.filter(user_id=user_id, skill__in=aptitude_skills).count()
    if aptitude_count < 3:
        for sk in aptitude_skills[:3]:
            if not Quiz.objects.filter(user_id=user_id, skill=sk).exists():
                created.append(generate_quiz_for_skill(user_id, sk, source='ai', status='approved', career_name="Aptitude"))

    return created