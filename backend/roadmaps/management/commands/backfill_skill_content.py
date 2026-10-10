from django.core.management.base import BaseCommand

from roadmaps.models import RoadmapSkill
from roadmaps.skill_content import get_skill_content


class Command(BaseCommand):
    help = "Fills what_to_learn, why_it_matters and resources for existing roadmap skills"

    def handle(self, *args, **options):
        updated = 0
        for skill in RoadmapSkill.objects.all():
            content = get_skill_content(skill.name)
            skill.what_to_learn = content["what_to_learn"]
            skill.why_it_matters = content["why_it_matters"]
            skill.resources = content["resources"]
            skill.save(update_fields=["what_to_learn", "why_it_matters", "resources"])
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"Updated {updated} roadmap skills."))