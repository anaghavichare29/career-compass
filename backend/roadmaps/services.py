import datetime
from collections import defaultdict
from .models import RoadmapStage, RoadmapSkill
from .skill_content import get_skill_content
from careers.models import CareerDefinition, CareerRecommendation
from tasks.models import Task

CAREER_ROADMAP_TEMPLATES = {
    "data analyst": [
        {
            "name": "Data Fundamentals & Spreadsheets",
            "duration": "2–3 Weeks",
            "description": "Master tabular data modeling, statistical formulas, data cleaning, and spreadsheet analysis.",
            "skills": ["Excel", "Statistics"],
        },
        {
            "name": "Relational Querying & SQL",
            "duration": "3–4 Weeks",
            "description": "Extract, filter, join, aggregate, and transform large relational datasets using SQL.",
            "skills": ["SQL"],
        },
        {
            "name": "Business Intelligence & Visualization",
            "duration": "3–4 Weeks",
            "description": "Design interactive executive dashboards, visual storytelling, and business reports.",
            "skills": ["Data Visualization", "Tableau", "Power BI"],
        },
        {
            "name": "Programmatic Analysis & Automation",
            "duration": "3–4 Weeks",
            "description": "Automate exploratory analysis, statistical workflows, and reporting pipelines using Python.",
            "skills": ["Python"],
        },
    ],
    "data scientist": [
        {
            "name": "Python & Mathematical Foundations",
            "duration": "3–4 Weeks",
            "description": "Build numerical computing fluency and statistical modeling foundations in Python.",
            "skills": ["Python", "Statistics"],
        },
        {
            "name": "Data Extraction & Exploratory Analysis",
            "duration": "3–4 Weeks",
            "description": "Wrangle complex datasets, execute analytical SQL queries, and discover patterns visually.",
            "skills": ["SQL", "Data Visualization"],
        },
        {
            "name": "Machine Learning & Model Tuning",
            "duration": "4–5 Weeks",
            "description": "Train, validate, tune, and evaluate supervised and unsupervised machine learning algorithms.",
            "skills": ["Machine Learning", "Scikit-learn"],
        },
        {
            "name": "Deep Learning & Production AI",
            "duration": "4–5 Weeks",
            "description": "Build complex neural architectures, evaluate deep models, and deploy production ML solutions.",
            "skills": ["Deep Learning"],
        },
    ],
    "software engineer": [
        {
            "name": "Programming Core & Version Control",
            "duration": "3–4 Weeks",
            "description": "Establish solid programming syntax, algorithmic problem solving, and Git collaboration.",
            "skills": ["Programming", "Git", "Problem Solving"],
        },
        {
            "name": "Data Structures & Algorithmic Optimization",
            "duration": "4–5 Weeks",
            "description": "Master linear/non-linear structures, recursion, dynamic programming, and Big-O efficiency.",
            "skills": ["Data Structures", "Algorithms"],
        },
        {
            "name": "System Architecture & Scalability",
            "duration": "3–4 Weeks",
            "description": "Design distributed architectures, modular interfaces, and scalable database schemas.",
            "skills": ["System Design"],
        },
        {
            "name": "Testing & Software Reliability",
            "duration": "2–3 Weeks",
            "description": "Ensure code quality and reliability through automated unit, integration, and regression testing.",
            "skills": ["Testing"],
        },
    ],
    "product manager": [
        {
            "name": "User Discovery & Market Research",
            "duration": "2–3 Weeks",
            "description": "Conduct user interviews, uncover unmet customer needs, and analyze competitive landscapes.",
            "skills": ["User Research", "Market Research"],
        },
        {
            "name": "Strategic Prioritization & Roadmapping",
            "duration": "3–4 Weeks",
            "description": "Define strategic feature backlogs, assess customer ROI, and author clear product roadmaps.",
            "skills": ["Prioritization", "Roadmapping"],
        },
        {
            "name": "Agile Execution & Team Alignment",
            "duration": "3–4 Weeks",
            "description": "Lead cross-functional sprints and establish clear, empathetic cross-team communication.",
            "skills": ["Agile", "Communication"],
        },
        {
            "name": "Product Analytics & Growth Strategy",
            "duration": "2–3 Weeks",
            "description": "Define key North Star metrics, track user funnels, and optimize product growth experiments.",
            "skills": ["Analytics"],
        },
    ],
    "ux/ui designer": [
        {
            "name": "Visual Principles & Accessibility",
            "duration": "2–3 Weeks",
            "description": "Master typography, color theory, inclusive accessibility guidelines, and visual hierarchy.",
            "skills": ["Visual Design", "Accessibility"],
        },
        {
            "name": "Wireframing & Interface Prototyping",
            "duration": "3–4 Weeks",
            "description": "Create low-to-high fidelity wireframes and interactive prototypes in Figma.",
            "skills": ["Wireframing", "Figma", "Prototyping"],
        },
        {
            "name": "User Research & Usability Testing",
            "duration": "3–4 Weeks",
            "description": "Conduct user interviews, synthesize personas, and validate usability with real users.",
            "skills": ["User Research"],
        },
        {
            "name": "Scalable Design Systems & UI Hand-off",
            "duration": "3–4 Weeks",
            "description": "Build reusable UI component libraries, design tokens, and streamline developer hand-off.",
            "skills": ["Design Systems"],
        },
    ],
    "cybersecurity analyst": [
        {
            "name": "Networking & Linux Administration",
            "duration": "3–4 Weeks",
            "description": "Master TCP/IP protocols, packet routing, and secure Linux command line operations.",
            "skills": ["Networking", "Linux"],
        },
        {
            "name": "Defensive Principles & Risk Assessment",
            "duration": "3–4 Weeks",
            "description": "Implement access controls, threat modeling frameworks, and security risk audits.",
            "skills": ["Security Fundamentals", "Risk Assessment"],
        },
        {
            "name": "Security Operations & Incident Response",
            "duration": "4–5 Weeks",
            "description": "Analyze security event logs with SIEM tools and orchestrate incident triage workflows.",
            "skills": ["SIEM", "Incident Response"],
        },
        {
            "name": "Vulnerability Assessment & Ethical Hacking",
            "duration": "3–4 Weeks",
            "description": "Execute penetration tests, discover vulnerabilities, and harden enterprise systems.",
            "skills": ["Ethical Hacking"],
        },
    ],
    "cloud engineer": [
        {
            "name": "Linux Systems & Cloud Networking",
            "duration": "3–4 Weeks",
            "description": "Configure secure Linux servers, VPC subnets, firewall rules, and routing protocols.",
            "skills": ["Linux", "Networking"],
        },
        {
            "name": "AWS Core Architecture & Services",
            "duration": "4–5 Weeks",
            "description": "Deploy scalable compute, object storage, and managed relational databases on AWS.",
            "skills": ["AWS"],
        },
        {
            "name": "Containerization & Cluster Orchestration",
            "duration": "4–5 Weeks",
            "description": "Package services with Docker and manage container clusters using Kubernetes.",
            "skills": ["Docker", "Kubernetes"],
        },
        {
            "name": "Infrastructure as Code & CI/CD",
            "duration": "3–4 Weeks",
            "description": "Automate cloud provisioning with Terraform and configure continuous delivery pipelines.",
            "skills": ["Terraform", "CI/CD"],
        },
    ],
    "ai/ml engineer": [
        {
            "name": "Python & Numerical Foundations",
            "duration": "3–4 Weeks",
            "description": "Harness NumPy/Pandas, matrix algebra, and statistical distribution theory.",
            "skills": ["Python", "Statistics"],
        },
        {
            "name": "Applied Machine Learning Systems",
            "duration": "4–5 Weeks",
            "description": "Engineer tabular features, train regression and classification models, and tune hyperparameters.",
            "skills": ["Machine Learning"],
        },
        {
            "name": "Deep Neural Architectures & Frameworks",
            "duration": "4–5 Weeks",
            "description": "Build and train CNNs, RNNs, and transformers with PyTorch and TensorFlow.",
            "skills": ["Deep Learning", "TensorFlow", "PyTorch"],
        },
        {
            "name": "MLOps & Scalable Model Serving",
            "duration": "3–4 Weeks",
            "description": "Containerize trained models, build production inference APIs, and track model drift.",
            "skills": ["Model Deployment"],
        },
    ],
    "full stack developer": [
        {
            "name": "Frontend Core & Responsive Layouts",
            "duration": "3–4 Weeks",
            "description": "Craft responsive, semantic user interfaces with HTML, CSS, and modern JavaScript.",
            "skills": ["HTML", "CSS", "JavaScript"],
        },
        {
            "name": "Client-Side Architecture & React",
            "duration": "4–5 Weeks",
            "description": "Build state-driven component architectures, routing, and single-page web applications.",
            "skills": ["React", "Git"],
        },
        {
            "name": "Server-Side Engineering & REST APIs",
            "duration": "4–5 Weeks",
            "description": "Construct scalable Node.js microservices and design secure RESTful APIs.",
            "skills": ["Node.js", "APIs"],
        },
        {
            "name": "Database Modeling & Production Delivery",
            "duration": "3–4 Weeks",
            "description": "Model relational and document databases, manage migrations, and deploy to cloud hosts.",
            "skills": ["Databases"],
        },
    ],
    "devops engineer": [
        {
            "name": "Linux Systems & Scripting Automation",
            "duration": "3–4 Weeks",
            "description": "Automate system management with Bash shell scripting and Git version control.",
            "skills": ["Linux", "Shell Scripting", "Git"],
        },
        {
            "name": "Containerization & Environment Isolation",
            "duration": "3–4 Weeks",
            "description": "Create lightweight, optimized Docker images for multi-service applications.",
            "skills": ["Docker"],
        },
        {
            "name": "CI/CD Automation & Orchestration",
            "duration": "4–5 Weeks",
            "description": "Build automated deployment pipelines and orchestrate workloads on Kubernetes.",
            "skills": ["Kubernetes", "CI/CD"],
        },
        {
            "name": "Observability & Site Reliability",
            "duration": "3–4 Weeks",
            "description": "Set up system metrics, log aggregators, and automated incident alerting.",
            "skills": ["Monitoring"],
        },
    ],
    "business analyst": [
        {
            "name": "Process Discovery & Stakeholder Communication",
            "duration": "2–3 Weeks",
            "description": "Map business workflows, gather functional requirements, and align cross-functional teams.",
            "skills": ["Communication", "Process Mapping"],
        },
        {
            "name": "Business Analytics & Spreadsheet Modeling",
            "duration": "3–4 Weeks",
            "description": "Analyze operational metrics and financial projections using advanced Excel modeling.",
            "skills": ["Excel", "SQL"],
        },
        {
            "name": "Stakeholder Alignment & Strategy",
            "duration": "3–4 Weeks",
            "description": "Manage stakeholder expectations, scope change requests, and validate solution value.",
            "skills": ["Stakeholder Management"],
        },
        {
            "name": "Business Intelligence & Executive Dashboards",
            "duration": "2–3 Weeks",
            "description": "Synthesize operational findings into interactive business intelligence dashboards.",
            "skills": ["Data Visualization", "Business Intelligence"],
        },
    ],
    "mobile app developer": [
        {
            "name": "Mobile Programming & Version Control",
            "duration": "3–4 Weeks",
            "description": "Master object-oriented mobile programming with Swift and Kotlin.",
            "skills": ["Swift", "Kotlin", "Git"],
        },
        {
            "name": "Cross-Platform Frameworks & UI",
            "duration": "4–5 Weeks",
            "description": "Build multi-platform user interfaces with Flutter and React Native.",
            "skills": ["React Native", "Flutter", "UI Design"],
        },
        {
            "name": "Network Integration & API Services",
            "duration": "3–4 Weeks",
            "description": "Connect mobile applications to REST/GraphQL APIs and manage offline caching.",
            "skills": ["APIs"],
        },
        {
            "name": "Mobile Architecture & App Publishing",
            "duration": "2–3 Weeks",
            "description": "Integrate device hardware, profile memory performance, and publish to app stores.",
            "skills": [],
        },
    ],
    "data engineer": [
        {
            "name": "Data Modeling & Query Foundations",
            "duration": "3–4 Weeks",
            "description": "Design schema models and write high-performance analytical SQL queries.",
            "skills": ["Python", "SQL"],
        },
        {
            "name": "ETL Pipelines & Modern Warehousing",
            "duration": "4–5 Weeks",
            "description": "Extract, clean, and load large-scale data into cloud data warehouses.",
            "skills": ["ETL", "Data Warehousing", "Cloud Platforms"],
        },
        {
            "name": "Distributed Big Data Computing",
            "duration": "4–5 Weeks",
            "description": "Process batch datasets at scale with Apache Spark clusters.",
            "skills": ["Apache Spark"],
        },
        {
            "name": "Real-Time Event Streaming",
            "duration": "3–4 Weeks",
            "description": "Architect fault-tolerant real-time data pipelines using Apache Kafka.",
            "skills": ["Kafka"],
        },
    ],
    "network engineer": [
        {
            "name": "Network Protocols & OSI Fundamentals",
            "duration": "3–4 Weeks",
            "description": "Master TCP/IP, subnetting, DNS, and fundamental OSI networking models.",
            "skills": ["Networking", "TCP/IP"],
        },
        {
            "name": "Cisco Routing & Linux Infrastructure",
            "duration": "4–5 Weeks",
            "description": "Configure Cisco switches, dynamic routing protocols, and Linux network stacks.",
            "skills": ["Cisco", "Linux"],
        },
        {
            "name": "Enterprise Firewalls & Network Defense",
            "duration": "3–4 Weeks",
            "description": "Implement perimeter firewalls, VPN tunnels, and network security policies.",
            "skills": ["Firewalls", "Network Security"],
        },
        {
            "name": "Diagnostic Analysis & Troubleshooting",
            "duration": "2–3 Weeks",
            "description": "Diagnose packet loss, isolate bottlenecks, and maintain network reliability.",
            "skills": ["Troubleshooting"],
        },
    ],
    "embedded systems engineer": [
        {
            "name": "Low-Level Programming & Architecture",
            "duration": "3–4 Weeks",
            "description": "Write memory-safe code in C and understand computer architecture with Assembly.",
            "skills": ["C", "Assembly"],
        },
        {
            "name": "Microcontroller Firmware & C++",
            "duration": "4–5 Weeks",
            "description": "Write firmware for microcontrollers using modern embedded C++.",
            "skills": ["C++", "Microcontrollers"],
        },
        {
            "name": "Buses & Real-Time Operating Systems",
            "duration": "4–5 Weeks",
            "description": "Implement I2C, SPI, and UART protocols and manage tasks on FreeRTOS.",
            "skills": ["Communication Protocols", "RTOS"],
        },
        {
            "name": "Hardware Debugging & Validation",
            "duration": "3–4 Weeks",
            "description": "Debug timing issues with logic analyzers and validate embedded circuits.",
            "skills": ["Hardware Debugging"],
        },
    ],
    "game developer": [
        {
            "name": "Game Programming & Logic",
            "duration": "3–4 Weeks",
            "description": "Master object-oriented programming in C# and scripting gameplay mechanics.",
            "skills": ["C#", "Scripting"],
        },
        {
            "name": "Game Engine Mastery & Level Design",
            "duration": "4–5 Weeks",
            "description": "Build interactive 2D/3D game scenes and menus using Unity.",
            "skills": ["Unity", "Game Design", "UI Design"],
        },
        {
            "name": "Physics Simulation & 3D Assets",
            "duration": "4–5 Weeks",
            "description": "Simulate collisions, character controllers, and import 3D modeling assets.",
            "skills": ["Physics Simulation", "3D Modeling"],
        },
        {
            "name": "Gameplay Polish & Multiplatform Build",
            "duration": "3–4 Weeks",
            "description": "Profile frame rate performance, tune particle effects, and export playable builds.",
            "skills": [],
        },
    ],
    "digital marketing analyst": [
        {
            "name": "Content Strategy & Organic Search",
            "duration": "2–3 Weeks",
            "description": "Plan multi-channel content and optimize organic rankings through modern SEO.",
            "skills": ["Content Strategy", "SEO", "Social Media Marketing"],
        },
        {
            "name": "Web Tracking & Email Campaigns",
            "duration": "3–4 Weeks",
            "description": "Configure Google Analytics tracking and automate targeted email marketing flows.",
            "skills": ["Google Analytics", "Email Marketing"],
        },
        {
            "name": "Conversion Experimentation & A/B Testing",
            "duration": "3–4 Weeks",
            "description": "Formulate growth hypotheses and evaluate split-test conversion metrics.",
            "skills": ["A/B Testing"],
        },
        {
            "name": "Marketing Attribution & Performance Dashboards",
            "duration": "2–3 Weeks",
            "description": "Visualize multi-touch marketing attribution and calculate channel ROI.",
            "skills": ["Data Visualization"],
        },
    ],
    "scrum master": [
        {
            "name": "Agile Philosophy & Scrum Foundations",
            "duration": "2–3 Weeks",
            "description": "Master Scrum values, sprint ceremonies, artifacts, and continuous feedback loops.",
            "skills": ["Agile", "Scrum"],
        },
        {
            "name": "Team Facilitation & Conflict Resolution",
            "duration": "3–4 Weeks",
            "description": "Foster high-performing self-organizing teams through empathy and conflict resolution.",
            "skills": ["Communication", "Conflict Resolution"],
        },
        {
            "name": "Sprint Tracking & Jira Administration",
            "duration": "3–4 Weeks",
            "description": "Configure Jira workflows, track sprint velocity, and burn-down burn-up charts.",
            "skills": ["Jira", "Project Management"],
        },
        {
            "name": "Stakeholder Alignment & Scaling",
            "duration": "2–3 Weeks",
            "description": "Manage external dependencies and champion organizational agile maturity.",
            "skills": ["Stakeholder Management"],
        },
    ],
    "blockchain developer": [
        {
            "name": "Cryptography & Decentralized Systems",
            "duration": "3–4 Weeks",
            "description": "Master public-key cryptography, hashing, and decentralized consensus algorithms.",
            "skills": ["Cryptography", "JavaScript"],
        },
        {
            "name": "Smart Contract Architecture & Solidity",
            "duration": "4–5 Weeks",
            "description": "Author, compile, and unit-test smart contracts on Ethereum using Solidity.",
            "skills": ["Solidity", "Ethereum", "Smart Contracts"],
        },
        {
            "name": "Web3 Integration & Decentralized Apps",
            "duration": "4–5 Weeks",
            "description": "Build responsive frontend interfaces connecting to contracts via Web3 and APIs.",
            "skills": ["Web3", "APIs"],
        },
        {
            "name": "Security Auditing & Testnet Deployment",
            "duration": "3–4 Weeks",
            "description": "Perform vulnerability audits, optimize gas limits, and deploy on testnets.",
            "skills": [],
        },
    ],
    "it project manager": [
        {
            "name": "Project Frameworks & Initiation",
            "duration": "2–3 Weeks",
            "description": "Author project charters, select Agile vs Waterfall models, and map stakeholders.",
            "skills": ["Project Management", "Agile", "Communication"],
        },
        {
            "name": "Budget Forecasting & Resource Planning",
            "duration": "3–4 Weeks",
            "description": "Build work breakdown structures and manage project budget schedules.",
            "skills": ["Budget Planning"],
        },
        {
            "name": "Risk Assessment & Mitigation",
            "duration": "3–4 Weeks",
            "description": "Maintain risk registers, assess impact probabilities, and execute mitigation plans.",
            "skills": ["Risk Management", "Stakeholder Management"],
        },
        {
            "name": "Delivery Leadership & Project Governance",
            "duration": "2–3 Weeks",
            "description": "Lead multidisciplinary project teams and conduct post-implementation evaluations.",
            "skills": ["Leadership"],
        },
    ],
}


def _get_career_stages(career_name, required_skills):
    """
    Returns a list of stage dicts specifically tailored for this career.
    Every required skill is allocated to an appropriate stage.
    """
    key = (career_name or "").strip().lower()
    all_skills = [s.strip() for s in required_skills if s.strip()]

    if key in CAREER_ROADMAP_TEMPLATES:
        template = [
            {
                "name": s["name"],
                "duration": s["duration"],
                "description": s["description"],
                "skills": list(s["skills"]),
            }
            for s in CAREER_ROADMAP_TEMPLATES[key]
        ]
        # Ensure all required_skills of this career definition are represented
        placed_skills = set(
            sk.lower() for stage in template for sk in stage["skills"]
        )
        for skill in all_skills:
            if skill.lower() not in placed_skills:
                target_stage = template[1] if len(template[1]["skills"]) < 3 else template[2]
                target_stage["skills"].append(skill)
                placed_skills.add(skill.lower())

        return [s for s in template if s["skills"]]

    # Dynamic fallback for custom or unlisted career names
    cname = career_name or "Target Career"
    stages = [
        {
            "name": f"{cname} Fundamentals & Tools",
            "duration": "2–3 Weeks",
            "description": f"Build a solid foundation in core concepts and essential tools for a {cname}.",
            "skills": [],
        },
        {
            "name": f"Core {cname} Technical Skills",
            "duration": "3–4 Weeks",
            "description": f"Develop primary technical competencies and practical workflows required for a {cname}.",
            "skills": [],
        },
        {
            "name": f"Advanced {cname} Specialization",
            "duration": "3–4 Weeks",
            "description": f"Deepen your expertise with specialized methodologies and advanced practices in {cname}.",
            "skills": [],
        },
        {
            "name": f"{cname} Capstone & Portfolio",
            "duration": "2–3 Weeks",
            "description": f"Apply your accumulated knowledge to real-world projects and build a compelling {cname} portfolio.",
            "skills": [],
        },
    ]

    total_skills = len(all_skills)
    if total_skills == 0:
        return stages

    chunk_size = max(1, (total_skills + 3) // 4)
    for i in range(4):
        start = i * chunk_size
        end = min((i + 1) * chunk_size, total_skills)
        if start < total_skills:
            stages[i]["skills"] = all_skills[start:end]

    return [s for s in stages if s["skills"]]


def generate_roadmap_for_user(user_id, career):
    """
    Rebuilds this user's roadmap for a specific CareerDefinition instance.
    Stores career_name on each stage so different careers have distinct roadmaps.
    """
    career_name = career.name if hasattr(career, 'name') else str(career)
    RoadmapStage.objects.filter(user_id=user_id, career_name=career_name).delete()

    all_skills = career.skills_list() if hasattr(career, 'skills_list') else []
    if not all_skills:
        return

    stages_data = _get_career_stages(career_name, all_skills)
    if not stages_data:
        return

    # Check student's matched skills if assessment recommendation exists
    matched_set = set()
    rec = CareerRecommendation.objects.filter(user_id=user_id, career_name=career_name).first()
    if rec and rec.matched_skills:
        matched_set = set(s.strip().lower() for s in rec.matched_skills.split(',') if s.strip())

    current_assigned = False
    today = datetime.date.today()
    stage_days = [14, 28, 45, 60]

    for stage_index, s_data in enumerate(stages_data):
        stage = RoadmapStage.objects.create(
            user_id=user_id,
            career_name=career_name,
            name=s_data["name"],
            description=s_data["description"],
            duration=s_data["duration"],
            status='upcoming',
            order=stage_index + 1,
        )

        stage_statuses = []
        deadline_date = today + datetime.timedelta(days=stage_days[min(stage_index, len(stage_days) - 1)])

        for skill_name in s_data["skills"]:
            is_matched = skill_name.strip().lower() in matched_set

            if is_matched:
                status = 'completed'
                progress = 100
            elif not current_assigned:
                status = 'current'
                progress = 0
                current_assigned = True
            else:
                status = 'upcoming'
                progress = 0

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

            # Ensure an AI recommended learning task exists for this skill
            if not Task.objects.filter(user_id=user_id, skill__iexact=skill_name).exists():
                Task.objects.create(
                    user_id=user_id,
                    title=f"Master {skill_name}: Core Concepts & Practice",
                    description=f"Follow structured module lessons and practical assignments for {skill_name} in stage '{stage.name}'.",
                    skill=skill_name,
                    course_name=f"{skill_name} Fundamentals Course",
                    deadline=deadline_date,
                    completed_lessons=0,
                    total_lessons=8,
                    priority='High' if stage_index == 0 else ('Medium' if stage_index == 1 else 'Low'),
                    ai_recommended=True,
                    status='Not Started',
                )

        if stage_statuses and all(s == 'completed' for s in stage_statuses):
            stage.status = 'completed'
        elif 'current' in stage_statuses:
            stage.status = 'current'
        else:
            stage.status = 'upcoming'
        stage.save()


def sync_roadmap_progress(user_id, career_name=None):
    """
    Keeps the roadmap in step with the student's learning tasks.
    Can be scoped to a specific career_name or run for all stages of a user.
    """
    qs = RoadmapStage.objects.filter(user_id=user_id)
    if career_name:
        qs = qs.filter(career_name=career_name)
    stages = list(qs.order_by('order', 'id').prefetch_related('skills'))
    if not stages:
        return

    pct_by_skill = defaultdict(list)
    for task in Task.objects.filter(user_id=user_id):
        if task.skill:
            pct_by_skill[task.skill.strip().lower()].append(task.percent)

    ordered = [(stage, sk) for stage in stages for sk in sorted(stage.skills.all(), key=lambda x: x.id)]

    for _, sk in ordered:
        values = pct_by_skill.get(sk.name.strip().lower())
        if values:
            sk.progress = round(sum(values) / len(values))

    active = next((sk for _, sk in ordered if sk.progress < 100), None)
    for _, sk in ordered:
        if sk.progress >= 100:
            sk.status = 'completed'
        elif sk.progress > 0 or sk is active:
            sk.status = 'current'
        else:
            sk.status = 'upcoming'

    RoadmapSkill.objects.bulk_update([sk for _, sk in ordered], ['progress', 'status'])

    for stage in stages:
        statuses = [sk.status for sk in stage.skills.all()]
        if statuses and all(x == 'completed' for x in statuses):
            new_status = 'completed'
        elif 'current' in statuses:
            new_status = 'current'
        else:
            new_status = 'upcoming'
        if stage.status != new_status:
            stage.status = new_status
            stage.save(update_fields=['status'])
