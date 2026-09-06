# backend/careers/models.py
from django.db import models

class CareerRecommendation(models.Model):
    user_id = models.IntegerField()
    career_name = models.CharField(max_length=150)
    match_percent = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    matched_skills = models.CharField(max_length=300, blank=True)   # comma-separated
    missing_skills = models.CharField(max_length=300, blank=True)   # comma-separated

    class Meta:
        db_table = 'career_recommendations'

    def __str__(self):
        return f"{self.career_name} ({self.match_percent}%)"

class CareerDefinition(models.Model):
    """Master catalog of careers used to generate recommendations."""

    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)

    # Comma-separated skill names, e.g. "Python,SQL,Statistics,Excel"
    required_skills = models.CharField(max_length=500)

    # Comma-separated tags that map to assessment answer tags,
    # e.g. "data,analytics,logical,independent"
    tags = models.CharField(max_length=500)

    class Meta:
        db_table = 'career_definitions'

    def __str__(self):
        return self.name

    def skills_list(self):
        return [s.strip() for s in self.required_skills.split(',') if s.strip()]

    def tags_list(self):
        return [t.strip().lower() for t in self.tags.split(',') if t.strip()]