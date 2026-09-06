from django.db import models


class RoadmapStage(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('current', 'Current'),
        ('upcoming', 'Upcoming'),
    ]

    user_id = models.IntegerField()
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=50, blank=True)  # e.g. "2–3 Weeks"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'roadmap_stages'
        ordering = ['order']

    def __str__(self):
        return f"{self.name} ({self.status})"


class RoadmapSkill(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('current', 'Current'),
        ('upcoming', 'Upcoming'),
    ]

    stage = models.ForeignKey(RoadmapStage, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    progress = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'roadmap_skills'

    def __str__(self):
        return f"{self.name} ({self.progress}%)"