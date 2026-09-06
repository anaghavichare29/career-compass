# backend/careers/management/commands/seed_careers.py
from django.core.management.base import BaseCommand
from careers.models import CareerDefinition


CAREERS = [
    {
        "name": "Data Analyst",
        "description": "Analyzes data to find patterns and support business decisions.",
        "required_skills": "Excel,SQL,Statistics,Python,Data Visualization",
        "tags": "data,analytics,logical,independent",
    },
    {
        "name": "Data Scientist",
        "description": "Builds predictive models and extracts insights from complex data.",
        "required_skills": "Python,Statistics,Machine Learning,SQL,Data Visualization",
        "tags": "data,analytics,ai,machine learning,logical",
    },
    {
        "name": "Software Engineer",
        "description": "Designs, builds and maintains software applications.",
        "required_skills": "Programming,Data Structures,Algorithms,Git,Problem Solving",
        "tags": "software,development,building,technical,independent",
    },
    {
        "name": "Product Manager",
        "description": "Plans product strategy and works across teams to deliver features.",
        "required_skills": "Communication,Prioritization,Market Research,Roadmapping,Analytics",
        "tags": "product,planning,people,collaborative,strategy",
    },
    {
        "name": "UX/UI Designer",
        "description": "Designs user experiences and interfaces that are simple and useful.",
        "required_skills": "Wireframing,Figma,User Research,Prototyping,Visual Design",
        "tags": "design,creative,people,user experience",
    },
    {
        "name": "Cybersecurity Analyst",
        "description": "Protects systems and data from security threats.",
        "required_skills": "Networking,Security Fundamentals,Risk Assessment,Linux,Incident Response",
        "tags": "security,cybersecurity,technical,structured,logical",
    },
    {
        "name": "Cloud Engineer",
        "description": "Builds and manages scalable cloud infrastructure.",
        "required_skills": "AWS,Docker,Kubernetes,Networking,Linux",
        "tags": "cloud,infrastructure,technical,systems",
    },
    {
        "name": "AI/ML Engineer",
        "description": "Builds and deploys machine learning and AI systems.",
        "required_skills": "Python,Machine Learning,Deep Learning,Statistics,Model Deployment",
        "tags": "ai,machine learning,data,technical,experimentation",
    },
    {
        "name": "Full Stack Developer",
        "description": "Builds both frontend and backend of web applications.",
        "required_skills": "JavaScript,React,Node.js,Databases,APIs",
        "tags": "web,software,development,building,technical",
    },
]


class Command(BaseCommand):
    help = "Seeds the career_definitions table with starter careers"

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