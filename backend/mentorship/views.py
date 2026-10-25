import json
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User
from .models import ProfessionalProfile, GuidanceRequest

INITIAL_EXPERTS_DATA = [
    {
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "company": "Google",
        "designation": "Software Engineer",
        "industry": "AI / Machine Learning",
        "experience_years": 6.0,
        "bio": "Software engineer specializing in machine learning and scalable AI applications. Experienced in building production-ready systems and working with data-driven technologies.",
        "skills": "Python, Machine Learning, Deep Learning, TensorFlow, System Design",
        "guidance_topics": "AI / ML Career Paths, Machine Learning Projects, Technical Interview Preparation, Industry Skills",
        "workplace_expectations": "Strong bias for action, continuous collaboration with cross-functional product teams, and proactive communication when solving complex problems.",
        "journey": [
            {"year": "2018", "title": "Started Software Engineering", "description": "Began working on software development and programming fundamentals."},
            {"year": "2020", "title": "Moved into Machine Learning", "description": "Started specializing in machine learning and data-driven applications."},
            {"year": "2022", "title": "Machine Learning Engineer", "description": "Worked on scalable machine learning systems and production applications."},
            {"year": "2024", "title": "Software Engineer — Google", "description": "Currently working on AI and machine learning solutions."},
        ],
        "interview_tips": [
            "Master data structures, algorithms, and SQL fundamentals.",
            "Build strong practical portfolio projects and be able to explain trade-offs.",
            "Understand mathematical intuition behind ML models, not just high-level libraries.",
            "Practice mock behavioral and technical interview communication.",
        ],
    },
    {
        "name": "Rahul Mehta",
        "email": "rahul.mehta@example.com",
        "company": "Microsoft",
        "designation": "Data Scientist",
        "industry": "Data Science",
        "experience_years": 8.0,
        "bio": "Data scientist working on analytics, predictive modelling and data-driven products. Passionate about mentoring students transitioning into corporate analytics.",
        "skills": "Python, SQL, Statistics, Machine Learning, Data Visualization",
        "guidance_topics": "Data Science Careers, Analytics Projects, Statistics, Data Science Interviews",
        "workplace_expectations": "Translating ambiguous business questions into testable statistical hypotheses and actionable dashboards.",
        "journey": [
            {"year": "2016", "title": "Data Analyst", "description": "Started a career in analytics and business intelligence."},
            {"year": "2019", "title": "Data Scientist", "description": "Moved into predictive modelling and machine learning."},
            {"year": "2022", "title": "Senior Data Scientist", "description": "Led analytics pipelines and predictive product features."},
        ],
        "interview_tips": [
            "Demonstrate how your data insights drove tangible business decisions.",
            "Know your probability and regression metrics inside out.",
            "Prepare clean GitHub repositories with structured documentation.",
        ],
    },
    {
        "name": "Neha Shah",
        "email": "neha.shah@example.com",
        "company": "Adobe",
        "designation": "Product Manager",
        "industry": "Product Management",
        "experience_years": 7.0,
        "bio": "Product professional focused on building user-centric digital products and strategies. Experienced in roadmapping, agile delivery, and market research.",
        "skills": "Roadmapping, Agile / Scrum, User Research, Prioritization, Product Analytics",
        "guidance_topics": "Product Strategy, Transitioning to PM, Interview Case Studies, User Experience",
        "workplace_expectations": "Extreme empathy for user needs paired with business viability and technical feasibility.",
        "journey": [
            {"year": "2017", "title": "Business Analyst", "description": "Analyzed market requirements and user behavior."},
            {"year": "2020", "title": "Associate Product Manager", "description": "Defined product features and managed release backlogs."},
            {"year": "2023", "title": "Product Manager — Adobe", "description": "Overseeing digital product experiences."},
        ],
        "interview_tips": [
            "Structure your product sense answers using frameworks like CIRCLES.",
            "Always anchor on user pain points before jumping to features.",
            "Show data-driven prioritization with clear metrics.",
        ],
    },
    {
        "name": "Arjun Kapoor",
        "email": "arjun.kapoor@example.com",
        "company": "Cisco",
        "designation": "Cybersecurity Engineer",
        "industry": "Cybersecurity",
        "experience_years": 5.0,
        "bio": "Cybersecurity professional working on application security, threat detection, and network defense architectures.",
        "skills": "Networking, Linux, Penetration Testing, Risk Assessment, Incident Response",
        "guidance_topics": "Security Fundamentals, Threat Analysis, Security Certifications, Corporate Security",
        "workplace_expectations": "Zero-trust mindset, attention to compliance, and rigorous incident documentation.",
        "journey": [
            {"year": "2019", "title": "Network Administrator", "description": "Managed infrastructure and firewalls."},
            {"year": "2022", "title": "Security Analyst", "description": "Handled SIEM monitoring and vulnerability audits."},
            {"year": "2024", "title": "Cybersecurity Engineer — Cisco", "description": "Architecting threat detection and defense systems."},
        ],
        "interview_tips": [
            "Thoroughly understand OSI layers, protocols, and common OWASP vulnerabilities.",
            "Practice hands-on labs (TryHackMe, HackTheBox) and explain methodology.",
        ],
    },
    {
        "name": "Aisha Khan",
        "email": "aisha.khan@example.com",
        "company": "Amazon Web Services",
        "designation": "Cloud Engineer",
        "industry": "Cloud Computing",
        "experience_years": 6.0,
        "bio": "Cloud engineer specializing in cloud architecture, containerization with Docker/Kubernetes, and scalable infrastructure automation.",
        "skills": "AWS, Docker, Kubernetes, Terraform, Linux, CI/CD",
        "guidance_topics": "Cloud Architectures, DevOps Practices, Infrastructure as Code, AWS Certifications",
        "workplace_expectations": "Automation-first mentality, high-availability architecture design, and cost optimization awareness.",
        "journey": [
            {"year": "2018", "title": "Systems Engineer", "description": "Maintained on-premise servers and automation scripts."},
            {"year": "2021", "title": "Cloud Architect", "description": "Migrated legacy workloads to cloud environments."},
            {"year": "2023", "title": "Cloud Engineer — AWS", "description": "Building scalable cloud infrastructure solutions."},
        ],
        "interview_tips": [
            "Be able to design a resilient, multi-region web application on AWS.",
            "Understand differences between IaaS, PaaS, and serverless architectures.",
        ],
    },
    {
        "name": "Rohan Desai",
        "email": "rohan.desai@example.com",
        "company": "Infosys",
        "designation": "Full Stack Developer",
        "industry": "Web Development",
        "experience_years": 5.0,
        "bio": "Full stack developer experienced in building modern web applications, REST APIs, and responsive user interfaces.",
        "skills": "JavaScript, React, Node.js, SQL, REST APIs, Git",
        "guidance_topics": "Full Stack Projects, Modern Web Architecture, Frontend / Backend Interviews",
        "workplace_expectations": "Writing clean, tested code, participating in sprint reviews, and continuous refactoring.",
        "journey": [
            {"year": "2019", "title": "Junior Web Developer", "description": "Built responsive frontends with HTML/CSS and JavaScript."},
            {"year": "2021", "title": "Full Stack Developer", "description": "Developed React and Node.js microservices."},
            {"year": "2024", "title": "Senior Developer — Infosys", "description": "Delivering enterprise web applications."},
        ],
        "interview_tips": [
            "Demonstrate end-to-end full stack project from database schema to UI deployment.",
            "Explain async JavaScript, event loop, and REST API design principles.",
        ],
    },
]


def _ensure_experts_seeded():
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM professionals")
        count = cursor.fetchone()[0]
        if count > 0:
            return

        for exp in INITIAL_EXPERTS_DATA:
            # Check or create user
            names = exp["name"].split()
            first = names[0]
            last = names[1] if len(names) > 1 else ""
            user = User.objects.filter(email=exp["email"]).first()
            if not user:
                user = User.objects.create(
                    first_name=first,
                    last_name=last,
                    email=exp["email"],
                    password="pbkdf2_sha256$260000$testpassword",
                    role="PROFESSIONAL",
                )

            cursor.execute("""
                INSERT INTO professionals (
                    user_id, company, designation, experience_years, industry,
                    bio, skills, guidance_topics, journey, interview_tips, workplace_expectations, is_verified
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
            """, [
                user.user_id,
                exp["company"],
                exp["designation"],
                exp["experience_years"],
                exp["industry"],
                exp["bio"],
                exp["skills"],
                exp["guidance_topics"],
                json.dumps(exp["journey"]),
                json.dumps(exp["interview_tips"]),
                exp["workplace_expectations"],
            ])


class IndustryExpertsListView(APIView):
    """GET /api/mentorship/experts/"""

    def get(self, request):
        _ensure_experts_seeded()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.professional_id, p.user_id, u.first_name, u.last_name,
                       p.company, p.designation, p.experience_years, p.industry,
                       p.bio, p.skills, p.guidance_topics, p.is_verified
                FROM professionals p
                JOIN users u ON p.user_id = u.user_id
                WHERE p.is_verified = 1
                ORDER BY p.professional_id ASC
            """)
            rows = cursor.fetchall()

        experts = []
        for r in rows:
            name = f"{r[2]} {r[3] or ''}".strip()
            skills_list = [s.strip() for s in (r[9] or "").split(",") if s.strip()]
            initials = "".join([part[0] for part in name.split()[:2]]).upper() or "EX"
            experts.append({
                "id": r[0],
                "userId": r[1],
                "name": name,
                "role": r[5] or "Industry Expert",
                "company": r[4] or "Technology Company",
                "domain": r[7] or "Technology",
                "experience": f"{int(r[6]) if r[6] else 5}+ Years Experience",
                "experienceYears": float(r[6]) if r[6] else 5.0,
                "initials": initials,
                "bio": r[8] or "",
                "skills": skills_list,
                "guidance": [g.strip() for g in (r[10] or "").split(",") if g.strip()],
            })

        return Response(experts, status=status.HTTP_200_OK)


class IndustryExpertDetailView(APIView):
    """GET /api/mentorship/experts/<id>/"""

    def get(self, request, pk):
        _ensure_experts_seeded()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.professional_id, p.user_id, u.first_name, u.last_name,
                       p.company, p.designation, p.experience_years, p.industry,
                       p.bio, p.skills, p.guidance_topics, p.journey, p.interview_tips,
                       p.workplace_expectations
                FROM professionals p
                JOIN users u ON p.user_id = u.user_id
                WHERE p.professional_id = %s OR p.user_id = %s
            """, [pk, pk])
            row = cursor.fetchone()

        if not row:
            return Response({"detail": "Expert not found."}, status=status.HTTP_404_NOT_FOUND)

        name = f"{row[2]} {row[3] or ''}".strip()
        skills_list = [s.strip() for s in (row[9] or "").split(",") if s.strip()]
        initials = "".join([part[0] for part in name.split()[:2]]).upper() or "EX"

        journey = []
        if row[11]:
            try:
                journey = json.loads(row[11]) if isinstance(row[11], str) else row[11]
            except Exception:
                pass

        interview_tips = []
        if row[12]:
            try:
                interview_tips = json.loads(row[12]) if isinstance(row[12], str) else row[12]
            except Exception:
                pass

        expert = {
            "id": row[0],
            "userId": row[1],
            "name": name,
            "role": row[5] or "Industry Expert",
            "company": row[4] or "Technology Company",
            "domain": row[7] or "Technology",
            "experience": f"{int(row[6]) if row[6] else 5}+ Years Experience",
            "experienceYears": float(row[6]) if row[6] else 5.0,
            "initials": initials,
            "bio": row[8] or "",
            "skills": skills_list,
            "guidance": [g.strip() for g in (row[10] or "").split(",") if g.strip()],
            "journey": journey,
            "interviewTips": interview_tips,
            "workplaceExpectations": row[13] or "Work hard, collaborate with transparency, and stay curious.",
        }
        return Response(expert, status=status.HTTP_200_OK)


class GuidanceRequestCreateView(APIView):
    """POST /api/mentorship/requests/ body: { student_id, mentor_id, topic, message, goals }"""

    def post(self, request):
        student_id = request.data.get("student_id")
        mentor_id = request.data.get("mentor_id")
        topic = request.data.get("topic", "").strip()
        message = request.data.get("message", "").strip()
        goals = request.data.get("goals", "").strip()

        if not student_id or not mentor_id or not topic or not message:
            return Response({"detail": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO guidance_requests (student_id, mentor_id, topic, message, goals, status)
                VALUES (%s, %s, %s, %s, %s, 'pending')
            """, [student_id, mentor_id, topic, message, goals])
            req_id = cursor.lastrowid

            # Find mentor user_id
            cursor.execute("SELECT user_id FROM professionals WHERE professional_id = %s", [mentor_id])
            p_row = cursor.fetchone()
            mentor_user_id = p_row[0] if p_row else mentor_id

            # Student details
            student_user = User.objects.filter(user_id=student_id).first()
            student_name = f"{student_user.first_name} {student_user.last_name or ''}".strip() if student_user else f"Student #{student_id}"

            # Mentor notification
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                [
                    mentor_user_id,
                    "New Student Mentorship Request",
                    f"{student_name} requested your mentorship on topic '{topic}'.",
                    "mentorship",
                ]
            )

            # Student notification
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                [
                    student_id,
                    "Mentorship Request Submitted",
                    f"Your guidance request on '{topic}' was sent. The mentor will review and reply.",
                    "mentorship",
                ]
            )

        return Response({
            "detail": "Guidance request submitted successfully.",
            "request_id": req_id
        }, status=status.HTTP_201_CREATED)


class GuidanceRequestListView(APIView):
    """GET /api/mentorship/requests/?user_id=X&role=student|mentor"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        role = request.query_params.get("role", "student").lower()

        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            if role == "mentor":
                # Find professional_id for user_id
                cursor.execute("SELECT professional_id FROM professionals WHERE user_id = %s", [user_id])
                p_row = cursor.fetchone()
                mentor_id = p_row[0] if p_row else user_id

                cursor.execute("""
                    SELECT gr.id, gr.student_id, u.first_name, u.last_name, gr.topic, gr.message,
                           gr.goals, gr.status, gr.reply, gr.created_at,
                           s.college, s.course, s.year, s.career_goal, s.academic_score, u.email,
                           s.bio, s.phone, s.location
                    FROM guidance_requests gr
                    JOIN users u ON gr.student_id = u.user_id
                    LEFT JOIN students s ON u.user_id = s.user_id
                    WHERE gr.mentor_id = %s OR gr.mentor_id = %s
                    ORDER BY gr.created_at DESC
                """, [mentor_id, user_id])
            else:
                cursor.execute("""
                    SELECT gr.id, gr.mentor_id, u.first_name, u.last_name, gr.topic, gr.message,
                           gr.goals, gr.status, gr.reply, gr.created_at,
                           NULL, NULL, NULL, NULL, NULL, NULL,
                           NULL, NULL, NULL
                    FROM guidance_requests gr
                    JOIN professionals p ON gr.mentor_id = p.professional_id
                    JOIN users u ON p.user_id = u.user_id
                    WHERE gr.student_id = %s
                    ORDER BY gr.created_at DESC
                """, [user_id])

            rows = cursor.fetchall()

        # For mentor role, fetch complete career recommendations and skills for each student
        student_recommendations = {}
        student_skills_map = {}
        if role == "mentor":
            try:
                from careers.models import CareerRecommendation
                student_ids = list({r[1] for r in rows})
                for sid in student_ids:
                    recs = CareerRecommendation.objects.filter(user_id=sid).order_by('-match_percent')
                    student_recommendations[sid] = [
                        {
                            "career_name": rec.career_name,
                            "match_percent": rec.match_percent,
                            "description": rec.description,
                            "matched_skills": [s.strip() for s in (rec.matched_skills or '').split(',') if s.strip()],
                            "missing_skills": [s.strip() for s in (rec.missing_skills or '').split(',') if s.strip()],
                        }
                        for rec in recs
                    ]
            except Exception:
                pass

            try:
                student_ids = list({r[1] for r in rows})
                with connection.cursor() as s_cursor:
                    for sid in student_ids:
                        s_cursor.execute("""
                            SELECT sk.skill_name, ss.proficiency_level
                            FROM student_skills ss
                            JOIN skills sk ON ss.skill_id = sk.skill_id
                            JOIN students s ON ss.student_id = s.student_id
                            WHERE s.user_id = %s
                        """, [sid])
                        student_skills_map[sid] = [
                            {"skill": s_row[0], "level": s_row[1]}
                            for s_row in s_cursor.fetchall()
                        ]
            except Exception:
                pass

        TOPIC_MAP = {
            "career": "Career Guidance & Transition",
            "skills": "Skills & Technologies Gap",
            "projects": "Portfolio & Project Review",
            "interviews": "Interview Preparation",
            "industry": "Industry Insights & Expectations",
            "other": "General Mentorship",
        }

        results = []
        for r in rows:
            other_name = f"{r[2]} {r[3] or ''}".strip()
            raw_topic = r[4] or ""
            topic_display = TOPIC_MAP.get(raw_topic.lower(), raw_topic)
            entry = {
                "id": r[0],
                "otherId": r[1],
                "otherName": other_name,
                "topic": topic_display,
                "message": r[5],
                "goals": r[6] or "",
                "status": r[7],
                "reply": r[8] or "",
                "createdAt": r[9].strftime("%d %b %Y, %I:%M %p") if r[9] else "",
            }
            if role == "mentor":
                student_id = r[1]
                raw_recs = student_recommendations.get(student_id, [])
                recs_list = [
                    {
                        **rec,
                        "career": rec.get("career_name", ""),
                        "matchPercentage": rec.get("match_percent", 0),
                        "matchedSkills": rec.get("matched_skills", []),
                        "missingSkills": rec.get("missing_skills", []),
                    }
                    for rec in raw_recs
                ]
                top_career = recs_list[0]["career"] if recs_list else ""
                entry["recommendedCareers"] = recs_list
                entry["studentProfile"] = {
                    "studentId": student_id,
                    "name": other_name,
                    "email": r[15] or "",
                    "college": r[10] or "",
                    "course": r[11] or "",
                    "year": f"{r[12]}th Year" if r[12] else "",
                    "careerGoal": r[13] or top_career,
                    "academicScore": float(r[14]) if r[14] else None,
                    "bio": r[16] or "",
                    "phone": r[17] or "",
                    "location": r[18] or "",
                    "targetCareer": top_career,
                    "recommendedCareers": recs_list,
                    "skills": student_skills_map.get(student_id, []),
                }
            results.append(entry)

        return Response(results, status=status.HTTP_200_OK)


class GuidanceRequestReplyView(APIView):
    """POST /api/mentorship/requests/<id>/reply/ body: { reply, status: 'approved'|'completed'|'replied' }"""

    def post(self, request, pk):
        reply = request.data.get("reply", "").strip()
        status_val = request.data.get("status", "replied")

        with connection.cursor() as cursor:
            cursor.execute("SELECT student_id, topic FROM guidance_requests WHERE id = %s", [pk])
            row = cursor.fetchone()
            if not row:
                return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

            student_id, topic = row
            cursor.execute("UPDATE guidance_requests SET reply = %s, status = %s WHERE id = %s", [reply, status_val, pk])

            # Notify student
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                [
                    student_id,
                    "Mentor Replied to Your Guidance Request",
                    f"Your mentor replied to your request on '{topic}': \"{reply[:100]}\"",
                    "mentorship",
                ]
            )

        return Response({"detail": "Reply submitted successfully."}, status=status.HTTP_200_OK)


class GuidanceRequestActionView(APIView):
    """POST /api/mentorship/requests/<id>/action/ body: { action: 'approved'|'rejected', note: '' }"""

    def post(self, request, pk):
        action = request.data.get("action", "").lower()
        note = request.data.get("note", "").strip()
        if action not in ("approved", "rejected"):
            return Response({"detail": "Action must be 'approved' or 'rejected'."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("SELECT student_id, topic, mentor_id FROM guidance_requests WHERE id = %s", [pk])
            row = cursor.fetchone()
            if not row:
                return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

            student_id, topic, mentor_id = row
            reply_text = f"[{action.upper()}] {note}" if note else f"Request has been {action}."
            cursor.execute("UPDATE guidance_requests SET status = %s, reply = %s WHERE id = %s", [action, reply_text, pk])

            # Notify student
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                [
                    student_id,
                    f"Mentorship Request {action.capitalize()}",
                    f"Your mentorship request on '{topic}' has been {action}. {note}",
                    "mentorship",
                ]
            )

        return Response({"detail": f"Request {action} successfully."}, status=status.HTTP_200_OK)


class MentorProfileView(APIView):
    """GET and PUT /api/mentorship/profile/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        _ensure_experts_seeded()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.professional_id, p.user_id, u.first_name, u.last_name, u.email,
                       p.company, p.designation, p.experience_years, p.industry,
                       p.bio, p.skills, p.guidance_topics, p.journey, p.interview_tips,
                       p.workplace_expectations, p.is_verified
                FROM professionals p
                JOIN users u ON p.user_id = u.user_id
                WHERE p.user_id = %s
            """, [user_id])
            row = cursor.fetchone()

            if not row:
                # create default professional record
                user = User.objects.filter(user_id=user_id).first()
                if not user:
                    return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
                cursor.execute("""
                    INSERT INTO professionals (user_id, company, designation, experience_years, industry, bio, skills, guidance_topics, is_verified)
                    VALUES (%s, 'Technology Company', 'Industry Expert', 5.0, 'Technology', 'Experienced mentor helping students succeed.', 'Python, Problem Solving, Career Planning', 'Interview Prep, Resume Review', 1)
                """, [user_id])
                cursor.execute("""
                    SELECT p.professional_id, p.user_id, u.first_name, u.last_name, u.email,
                           p.company, p.designation, p.experience_years, p.industry,
                           p.bio, p.skills, p.guidance_topics, p.journey, p.interview_tips,
                           p.workplace_expectations, p.is_verified
                    FROM professionals p
                    JOIN users u ON p.user_id = u.user_id
                    WHERE p.user_id = %s
                """, [user_id])
                row = cursor.fetchone()

        journey = []
        if row[12]:
            try:
                journey = json.loads(row[12]) if isinstance(row[12], str) else row[12]
            except Exception:
                pass

        interview_tips = []
        if row[13]:
            try:
                interview_tips = json.loads(row[13]) if isinstance(row[13], str) else row[13]
            except Exception:
                pass

        return Response({
            "id": row[0],
            "userId": row[1],
            "firstName": row[2],
            "lastName": row[3] or "",
            "fullName": f"{row[2]} {row[3] or ''}".strip(),
            "email": row[4],
            "company": row[5] or "",
            "designation": row[6] or "",
            "experienceYears": float(row[7]) if row[7] else 5.0,
            "industry": row[8] or "",
            "bio": row[9] or "",
            "skills": row[10] or "",
            "guidanceTopics": row[11] or "",
            "journey": journey,
            "interviewTips": interview_tips,
            "workplaceExpectations": row[14] or "",
            "isVerified": bool(row[15]),
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        company = request.data.get("company", "")
        designation = request.data.get("designation", "")
        experience_years = request.data.get("experienceYears", 5.0)
        industry = request.data.get("industry", "")
        bio = request.data.get("bio", "")
        skills = request.data.get("skills", "")
        guidance_topics = request.data.get("guidanceTopics", "")
        workplace_expectations = request.data.get("workplaceExpectations", "")
        journey = request.data.get("journey", [])
        interview_tips = request.data.get("interviewTips", [])

        # Also update first_name, last_name in users if given
        first_name = request.data.get("firstName")
        last_name = request.data.get("lastName")
        if first_name:
            User.objects.filter(user_id=user_id).update(first_name=first_name, last_name=last_name or "")

        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE professionals SET
                    company = %s,
                    designation = %s,
                    experience_years = %s,
                    industry = %s,
                    bio = %s,
                    skills = %s,
                    guidance_topics = %s,
                    workplace_expectations = %s,
                    journey = %s,
                    interview_tips = %s
                WHERE user_id = %s
            """, [
                company, designation, experience_years, industry, bio, skills,
                guidance_topics, workplace_expectations,
                json.dumps(journey), json.dumps(interview_tips), user_id
            ])

        return Response({"detail": "Mentor profile updated successfully."}, status=status.HTTP_200_OK)


class MentorStudentsListView(APIView):
    """GET /api/mentorship/my-students/?mentor_user_id=X - Returns list of students assigned to or requesting this mentor"""

    def get(self, request):
        mentor_user_id = request.query_params.get("mentor_user_id")
        if not mentor_user_id:
            return Response({"detail": "mentor_user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("SELECT professional_id FROM professionals WHERE user_id = %s", [mentor_user_id])
            p_row = cursor.fetchone()
            prof_id = p_row[0] if p_row else mentor_user_id

            cursor.execute("""
                SELECT DISTINCT u.user_id, u.first_name, u.last_name, u.email,
                       s.college, s.course, s.year, s.academic_score, s.career_goal,
                       gr.status as mentorship_status, gr.topic, gr.id as request_id, gr.created_at
                FROM guidance_requests gr
                JOIN users u ON gr.student_id = u.user_id
                LEFT JOIN students s ON u.user_id = s.user_id
                WHERE (gr.mentor_id = %s OR gr.mentor_id = %s)
                  AND LOWER(gr.status) IN ('approved', 'accepted')
                ORDER BY gr.created_at DESC
            """, [prof_id, mentor_user_id])
            rows = cursor.fetchall()

        from progress.models import ProgressSummary
        from tasks.models import Task
        from quizzes.models import QuizAttempt

        students = []
        seen_users = set()
        for r in rows:
            uid = r[0]
            if uid in seen_users:
                continue
            seen_users.add(uid)

            name = f"{r[1]} {r[2] or ''}".strip()
            summary = ProgressSummary.objects.filter(user_id=uid).first()
            tasks = Task.objects.filter(user_id=uid)
            completed_tasks = tasks.filter(status='Completed').count()
            total_tasks = tasks.count()

            attempts = QuizAttempt.objects.filter(user_id=uid)
            avg_quiz = 0
            if attempts.exists():
                avg_quiz = round((sum(a.score / a.total_questions for a in attempts) / attempts.count()) * 100)

            students.append({
                "studentId": uid,
                "name": name,
                "email": r[3],
                "college": r[4] or "Vidyalankar Institute of Technology",
                "course": r[5] or "Information Technology",
                "year": f"{r[6]}rd Year" if r[6] else "3rd Year",
                "academicScore": float(r[7]) if r[7] else 8.5,
                "careerGoal": r[8] or "Software Engineer",
                "mentorshipStatus": r[9],
                "topic": r[10],
                "requestId": r[11],
                "skillProgress": summary.skill_progress_percent if summary else 0,
                "quizProgress": avg_quiz,
                "tasksCount": f"{completed_tasks}/{total_tasks}",
                "readinessScore": round((((summary.skill_progress_percent if summary else 50) + avg_quiz) / 2)),
            })

        return Response(students, status=status.HTTP_200_OK)


class MentorStudentProgressView(APIView):
    """GET /api/mentorship/student-progress/<int:student_id>/ - In-depth progress analysis for mentor"""

    def get(self, request, student_id):
        user = User.objects.filter(user_id=student_id).first()
        if not user:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        with connection.cursor() as cursor:
            cursor.execute("SELECT college, course, year, academic_score, bio, phone, location, career_goal FROM students WHERE user_id = %s", [student_id])
            s_row = cursor.fetchone()

        from tasks.models import Task
        from quizzes.models import QuizAttempt
        from progress.models import ProgressSummary
        from careers.models import CareerRecommendation
        from roadmaps.models import RoadmapStage

        tasks = Task.objects.filter(user_id=student_id)
        attempts = QuizAttempt.objects.filter(user_id=student_id).order_by('-completed_at')[:10]
        summary = ProgressSummary.objects.filter(user_id=student_id).first()
        recs = CareerRecommendation.objects.filter(user_id=student_id).order_by('-match_percent')
        stages = RoadmapStage.objects.filter(user_id=student_id).order_by('order')

        # Calculate readiness
        task_rate = round((tasks.filter(status='Completed').count() / max(tasks.count(), 1)) * 100)
        quiz_avg = round((sum(a.score / a.total_questions for a in attempts) / max(attempts.count(), 1)) * 100) if attempts.exists() else 0
        readiness = round((task_rate * 0.5) + (quiz_avg * 0.5))

        return Response({
            "studentId": student_id,
            "name": f"{user.first_name} {user.last_name or ''}".strip(),
            "email": user.email,
            "phone": s_row[5] if s_row and s_row[5] else "",
            "location": s_row[6] if s_row and s_row[6] else "",
            "bio": s_row[4] if s_row and s_row[4] else "",
            "college": s_row[0] if s_row and s_row[0] else "Technology Institute",
            "course": s_row[1] if s_row and s_row[1] else "Engineering",
            "year": f"{s_row[2]} Year" if s_row and s_row[2] else "3rd Year",
            "academicScore": float(s_row[3]) if s_row and s_row[3] else 8.5,
            "careerGoal": s_row[7] if s_row and s_row[7] else "Software Engineer",
            "readinessScore": readiness,
            "skillProgress": summary.skill_progress_percent if summary else task_rate,
            "quizAverage": quiz_avg,
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "skill": t.skill,
                    "status": t.status,
                    "assignedByMentor": bool(t.assigned_by_mentor),
                    "submissionNotes": t.submission_notes,
                    "mentorFeedback": t.mentor_feedback,
                }
                for t in tasks
            ],

            "recentAttempts": [
                {
                    "id": a.id,
                    "quizTitle": a.quiz.title,
                    "score": a.score,
                    "total": a.total_questions,
                    "date": a.completed_at.strftime("%d %b %Y"),
                }
                for a in attempts
            ],
            "careerRecommendations": [
                {
                    "career": r.career_name,
                    "match": r.match_percent,
                    "matchedSkills": r.matched_skills,
                    "missingSkills": r.missing_skills,
                }
                for r in recs
            ],
            "roadmapStages": [
                {
                    "name": st.name,
                    "status": st.status,
                    "duration": st.duration,
                    "skills": [sk.name for sk in st.skills.all()],
                }
                for st in stages
            ],
        }, status=status.HTTP_200_OK)


class MentorAssignTaskView(APIView):
    """POST /api/mentorship/assign-task/ body: { student_id, mentor_user_id, title, description, skill, course_name, deadline, priority, total_lessons }"""

    def post(self, request):
        student_id = request.data.get("student_id")
        mentor_user_id = request.data.get("mentor_user_id")
        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        skill = request.data.get("skill", "General").strip()
        course_name = request.data.get("course_name", "Mentor Assigned Course").strip()
        priority = request.data.get("priority", "High")
        total_lessons = request.data.get("total_lessons", 5)

        if not student_id or not title:
            return Response({"detail": "student_id and title are required."}, status=status.HTTP_400_BAD_REQUEST)

        from tasks.models import Task
        import datetime
        deadline_date = datetime.date.today() + datetime.timedelta(days=14)

        task = Task.objects.create(
            user_id=student_id,
            title=title,
            description=description or f"Complete this task assigned by your mentor to advance your practical {skill} capabilities.",
            skill=skill,
            course_name=course_name,
            deadline=deadline_date,
            completed_lessons=0,
            total_lessons=total_lessons,
            priority=priority,
            ai_recommended=False,
            status='Not Started',
            mentor_id=mentor_user_id,
            assigned_by_mentor=True,
        )

        # Notify student
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                    [
                        student_id,
                        f"New Task Assigned by Mentor: {title}",
                        f"Your mentor assigned a new practical task '{title}' in {skill}. Due in 14 days.",
                        "task",
                    ]
                )
        except Exception:
            pass

        return Response({"detail": "Task assigned successfully.", "task_id": task.id}, status=status.HTTP_201_CREATED)


class MentorAssignRoadmapView(APIView):
    """POST /api/mentorship/assign-roadmap/ body: { student_id, stage_name, description, duration, skills }"""

    def post(self, request):
        student_id = request.data.get("student_id")
        stage_name = request.data.get("stage_name", "").strip()
        description = request.data.get("description", "").strip()
        duration = request.data.get("duration", "4 Weeks").strip()
        skills = request.data.get("skills", [])

        if not student_id or not stage_name:
            return Response({"detail": "student_id and stage_name are required."}, status=status.HTTP_400_BAD_REQUEST)

        from roadmaps.models import RoadmapStage, RoadmapSkill

        order_val = RoadmapStage.objects.filter(user_id=student_id).count() + 1
        stage = RoadmapStage.objects.create(
            user_id=student_id,
            name=stage_name,
            description=description or f"Custom mentor roadmap stage focusing on {stage_name}.",
            duration=duration,
            order=order_val,
            status='In Progress' if order_val == 1 else 'Upcoming',
        )

        for sk in skills:
            if isinstance(sk, str) and sk.strip():
                RoadmapSkill.objects.create(
                    stage=stage,
                    name=sk.strip(),
                    status='In Progress',
                    progress=0,
                )

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                    [
                        student_id,
                        f"Roadmap Updated by Mentor: {stage_name}",
                        f"Your mentor added a tailored roadmap milestone '{stage_name}' to your career path.",
                        "roadmap",
                    ]
                )
        except Exception:
            pass

        return Response({"detail": "Roadmap stage assigned successfully.", "stage_id": stage.id}, status=status.HTTP_201_CREATED)


class LearningResourcesView(APIView):
    """GET and POST /api/mentorship/resources/"""

    def get(self, request):
        skill = request.query_params.get("skill")
        with connection.cursor() as cursor:
            if skill:
                cursor.execute("SELECT id, title, skill, resource_type, url, provider, level, description FROM learning_resources WHERE skill LIKE %s ORDER BY id DESC", [f"%{skill}%"])
            else:
                cursor.execute("SELECT id, title, skill, resource_type, url, provider, level, description FROM learning_resources ORDER BY id DESC")
            rows = cursor.fetchall()

        resources = [
            {
                "id": r[0],
                "title": r[1],
                "skill": r[2],
                "type": r[3],
                "url": r[4],
                "provider": r[5],
                "level": r[6],
                "description": r[7] or "",
            }
            for r in rows
        ]
        return Response(resources, status=status.HTTP_200_OK)

    def post(self, request):
        title = request.data.get("title", "").strip()
        skill = request.data.get("skill", "").strip()
        res_type = request.data.get("type", "Course").strip()
        url = request.data.get("url", "#").strip()
        provider = request.data.get("provider", "Online").strip()
        level = request.data.get("level", "All Levels").strip()
        description = request.data.get("description", "").strip()

        if not title or not skill:
            return Response({"detail": "title and skill are required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO learning_resources (title, skill, resource_type, url, provider, level, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, [title, skill, res_type, url, provider, level, description])

        return Response({"detail": "Resource added successfully."}, status=status.HTTP_201_CREATED)


class MyMentorsView(APIView):
    """GET /api/mentorship/my-mentors/?user_id=X - mentors connected to this student."""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id or not str(user_id).isdigit():
            return Response({"detail": "A valid user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        from .services import mentors_for_student
        return Response(mentors_for_student(int(user_id)), status=status.HTTP_200_OK)


class MentorMessageListView(APIView):
    """
    GET /api/mentorship/messages/?user_id=X&mentor_id=Y
    Returns the chat messages between a student and their mentor (works bidirectionally).
    """

    def _ensure_table(self):
        with connection.cursor() as cursor:
            try:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS mentor_messages (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        sender_id INT NOT NULL,
                        receiver_id INT NOT NULL,
                        message TEXT NOT NULL,
                        is_read TINYINT(1) NOT NULL DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            except Exception:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS mentor_messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sender_id INTEGER NOT NULL,
                        receiver_id INTEGER NOT NULL,
                        message TEXT NOT NULL,
                        is_read INTEGER NOT NULL DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)

    def _resolve_user_id(self, val):
        if val is None:
            return None
        try:
            val_int = int(val)
        except (ValueError, TypeError):
            return None
        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM professionals WHERE professional_id = %s", [val_int])
            row = cursor.fetchone()
            if row:
                return row[0]
        return val_int

    def get(self, request):
        user_id = request.query_params.get("user_id")
        mentor_id = request.query_params.get("mentor_id")

        if not user_id or not mentor_id:
            return Response({"detail": "user_id and mentor_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            self._ensure_table()
        except Exception:
            pass

        uid_a = self._resolve_user_id(user_id)
        uid_b = self._resolve_user_id(mentor_id)
        if uid_a is None or uid_b is None:
            return Response({"detail": "Invalid IDs."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, sender_id, receiver_id, message, is_read, created_at
                    FROM mentor_messages
                    WHERE (sender_id = %s AND receiver_id = %s)
                       OR (sender_id = %s AND receiver_id = %s)
                    ORDER BY created_at ASC
                """, [uid_a, uid_b, uid_b, uid_a])

                rows = cursor.fetchall()

                # Mark messages sent by uid_b to uid_a as read
                cursor.execute("""
                    UPDATE mentor_messages SET is_read = 1
                    WHERE sender_id = %s AND receiver_id = %s AND is_read = 0
                """, [uid_b, uid_a])

                messages = [
                    {
                        "id": r[0],
                        "sender_id": r[1],
                        "receiver_id": r[2],
                        "message": r[3],
                        "is_read": bool(r[4]),
                        "created_at": r[5].isoformat() if hasattr(r[5], 'isoformat') else str(r[5]),
                    }
                    for r in rows
                ]
                return Response(messages, status=status.HTTP_200_OK)
        except Exception as e:
            return Response([], status=status.HTTP_200_OK)


class MentorMessageSendView(APIView):
    """
    POST /api/mentorship/messages/send/
    Body: { user_id / sender_id, mentor_id / receiver_id, message }
    Works for both student sending to mentor and mentor sending to student.
    """

    def _ensure_table(self):
        with connection.cursor() as cursor:
            try:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS mentor_messages (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        sender_id INT NOT NULL,
                        receiver_id INT NOT NULL,
                        message TEXT NOT NULL,
                        is_read TINYINT(1) NOT NULL DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            except Exception:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS mentor_messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sender_id INTEGER NOT NULL,
                        receiver_id INTEGER NOT NULL,
                        message TEXT NOT NULL,
                        is_read INTEGER NOT NULL DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)

    def _resolve_user_id(self, val):
        if val is None:
            return None
        try:
            val_int = int(val)
        except (ValueError, TypeError):
            return None
        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM professionals WHERE professional_id = %s", [val_int])
            row = cursor.fetchone()
            if row:
                return row[0]
        return val_int

    def post(self, request):
        sender_id = request.data.get("sender_id") or request.data.get("user_id")
        receiver_id = request.data.get("receiver_id") or request.data.get("mentor_id") or request.data.get("student_id")
        message = request.data.get("message", "").strip()

        if not sender_id or not receiver_id or not message:
            return Response(
                {"detail": "sender_id, receiver_id and message are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            self._ensure_table()
        except Exception:
            pass

        sender_uid = self._resolve_user_id(sender_id)
        receiver_uid = self._resolve_user_id(receiver_id)
        if sender_uid is None or receiver_uid is None:
            return Response({"detail": "Invalid sender or receiver ID."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO mentor_messages (sender_id, receiver_id, message, is_read)
                    VALUES (%s, %s, %s, 0)
                """, [sender_uid, receiver_uid, message])

                # Send in-app notification to receiver
                try:
                    cursor.execute("SELECT first_name, last_name, role FROM users WHERE user_id = %s", [sender_uid])
                    u_row = cursor.fetchone()
                    sender_name = f"{u_row[0]} {u_row[1] or ''}".strip() if u_row else "Your mentor"
                    is_sender_mentor = (u_row[2] or "").upper() in ("MENTOR", "PROFESSIONAL") if u_row else False
                    notif_title = f"New Message from {sender_name}" if not is_sender_mentor else f"Message from Mentor {sender_name}"
                    cursor.execute("""
                        INSERT INTO notifications (user_id, title, message, type)
                        VALUES (%s, %s, %s, 'mentorship')
                    """, [receiver_uid, notif_title, f"{sender_name}: {message[:120]}"])
                except Exception:
                    pass

            return Response({"detail": "Message sent."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": f"Failed to send: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
