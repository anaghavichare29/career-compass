# backend/careers/management/commands/seed_careers.py
from django.core.management.base import BaseCommand
from careers.models import CareerDefinition


CAREERS = [
    {
        "name": "Data Analyst",
        "description": "Analyzes data to find patterns, trends and insights that support business decisions and strategy.",
        "required_skills": "Excel,SQL,Statistics,Python,Data Visualization,Tableau,Power BI",
        "tags": "data,analytics,logical,independent,business intelligence",
    },
    {
        "name": "Data Scientist",
        "description": "Builds predictive models and machine learning solutions to extract actionable insights from complex datasets.",
        "required_skills": "Python,Statistics,Machine Learning,SQL,Data Visualization,Scikit-learn,Deep Learning",
        "tags": "data,analytics,ai,machine learning,logical,experimentation",
    },
    {
        "name": "Software Engineer",
        "description": "Designs, builds and maintains software applications and systems at scale.",
        "required_skills": "Programming,Data Structures,Algorithms,Git,Problem Solving,System Design,Testing",
        "tags": "software,development,building,technical,independent",
    },
    {
        "name": "Product Manager",
        "description": "Plans product strategy, aligns cross-functional teams, and delivers features that meet user and business needs.",
        "required_skills": "Communication,Prioritization,Market Research,Roadmapping,Analytics,Agile,User Research",
        "tags": "product,planning,people,collaborative,strategy,management",
    },
    {
        "name": "UX/UI Designer",
        "description": "Designs intuitive user experiences and interfaces that are accessible, beautiful and simple to use.",
        "required_skills": "Wireframing,Figma,User Research,Prototyping,Visual Design,Accessibility,Design Systems",
        "tags": "design,creative,people,user experience,communication",
    },
    {
        "name": "Cybersecurity Analyst",
        "description": "Protects systems, networks and data from cyber threats through monitoring, analysis and incident response.",
        "required_skills": "Networking,Security Fundamentals,Risk Assessment,Linux,Incident Response,SIEM,Ethical Hacking",
        "tags": "security,cybersecurity,technical,structured,logical,systems",
    },
    {
        "name": "Cloud Engineer",
        "description": "Builds, manages and optimizes scalable cloud infrastructure for modern applications.",
        "required_skills": "AWS,Docker,Kubernetes,Networking,Linux,Terraform,CI/CD",
        "tags": "cloud,infrastructure,technical,systems,building",
    },
    {
        "name": "AI/ML Engineer",
        "description": "Designs, trains and deploys machine learning and AI models at production scale.",
        "required_skills": "Python,Machine Learning,Deep Learning,Statistics,Model Deployment,TensorFlow,PyTorch",
        "tags": "ai,machine learning,data,technical,experimentation,logical",
    },
    {
        "name": "Full Stack Developer",
        "description": "Builds both the frontend and backend of web applications from end to end.",
        "required_skills": "JavaScript,React,Node.js,Databases,APIs,HTML,CSS,Git",
        "tags": "web,software,development,building,technical",
    },
    {
        "name": "DevOps Engineer",
        "description": "Automates software delivery pipelines and manages infrastructure to accelerate development cycles.",
        "required_skills": "Linux,Docker,Kubernetes,CI/CD,Shell Scripting,Monitoring,Git",
        "tags": "systems,infrastructure,technical,building,cloud,structured",
    },
    {
        "name": "Business Analyst",
        "description": "Bridges the gap between business needs and technical solutions by gathering requirements and driving decisions.",
        "required_skills": "Excel,SQL,Communication,Process Mapping,Stakeholder Management,Data Visualization,Business Intelligence",
        "tags": "analytics,logical,people,collaborative,planning,business intelligence,communication",
    },
    {
        "name": "Mobile App Developer",
        "description": "Creates native and cross-platform mobile applications for iOS and Android.",
        "required_skills": "Swift,Kotlin,React Native,Flutter,APIs,UI Design,Git",
        "tags": "software,development,building,technical,design,web",
    },
    {
        "name": "Data Engineer",
        "description": "Designs and maintains data pipelines and infrastructure that enable analytics and data science at scale.",
        "required_skills": "Python,SQL,Apache Spark,Kafka,Cloud Platforms,Data Warehousing,ETL",
        "tags": "data,analytics,systems,technical,logical,infrastructure",
    },
    {
        "name": "Network Engineer",
        "description": "Plans, builds and manages enterprise network infrastructure and connectivity solutions.",
        "required_skills": "Networking,TCP/IP,Cisco,Firewalls,Linux,Network Security,Troubleshooting",
        "tags": "systems,infrastructure,technical,cybersecurity,structured",
    },
    {
        "name": "Embedded Systems Engineer",
        "description": "Develops software and firmware for hardware devices, IoT systems and real-time embedded platforms.",
        "required_skills": "C,C++,Microcontrollers,RTOS,Hardware Debugging,Communication Protocols,Assembly",
        "tags": "technical,systems,building,structured,logical,independent",
    },
    {
        "name": "Game Developer",
        "description": "Designs and builds interactive video games for multiple platforms using game engines and programming.",
        "required_skills": "C#,Unity,Game Design,Physics Simulation,3D Modeling,Scripting,UI Design",
        "tags": "software,creative,building,technical,design,experimentation",
    },
    {
        "name": "Digital Marketing Analyst",
        "description": "Drives digital growth through data-informed campaigns, SEO, content strategy and performance analytics.",
        "required_skills": "Google Analytics,SEO,Content Strategy,Social Media Marketing,Data Visualization,A/B Testing,Email Marketing",
        "tags": "analytics,communication,people,strategy,creative,business intelligence",
    },
    {
        "name": "Scrum Master",
        "description": "Facilitates Agile ceremonies, removes team blockers and coaches teams towards continuous improvement.",
        "required_skills": "Agile,Scrum,Communication,Conflict Resolution,Project Management,Jira,Stakeholder Management",
        "tags": "people,collaborative,planning,management,communication,structured",
    },
    {
        "name": "Blockchain Developer",
        "description": "Builds decentralized applications and smart contracts using blockchain technology.",
        "required_skills": "Solidity,Ethereum,Smart Contracts,Cryptography,JavaScript,Web3,APIs",
        "tags": "software,technical,building,logical,experimentation,independent",
    },
    {
        "name": "IT Project Manager",
        "description": "Leads technology projects from planning through delivery, managing teams, timelines and stakeholder expectations.",
        "required_skills": "Project Management,Risk Management,Communication,Agile,Budget Planning,Stakeholder Management,Leadership",
        "tags": "planning,management,people,collaborative,structured,strategy,communication",
    },
]


class Command(BaseCommand):
    help = "Seeds the career_definitions table with expanded career list"

    def handle(self, *args, **options):
        created_count = 0
        for career in CAREERS:
            obj, created = CareerDefinition.objects.update_or_create(
                name=career["name"],
                defaults={
                    "description": career["description"],
                    "required_skills": career["required_skills"],
                    "tags": career["tags"],
                },
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(CAREERS)} careers ({created_count} new)."
            )
        )