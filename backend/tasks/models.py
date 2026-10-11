from django.db import models


class Task(models.Model):
    PRIORITY_CHOICES = [('High', 'High'), ('Medium', 'Medium'), ('Low', 'Low')]

    user_id = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    skill = models.CharField(max_length=100, blank=True)
    course_name = models.CharField(max_length=200, blank=True)
    deadline = models.DateField(null=True, blank=True)
    completed_lessons = models.PositiveIntegerField(default=0)
    total_lessons = models.PositiveIntegerField(default=1)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    ai_recommended = models.BooleanField(default=False)
    status = models.CharField(max_length=30, default='Not Started')
    mentor_id = models.IntegerField(null=True, blank=True)
    assigned_by_mentor = models.BooleanField(default=False)
    submission_notes = models.TextField(blank=True, default='')
    submission_file = models.CharField(max_length=255, blank=True, default='')
    mentor_feedback = models.TextField(blank=True, default='')
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'tasks'

    @property
    def percent(self):
        """0-100 completion of this task, used by roadmap, skill-gap and readiness."""
        if self.status == 'Completed':
            return 100
        pct = min(100, round(self.completed_lessons / max(self.total_lessons, 1) * 100))
        if self.status == 'Needs Revision':
            pct = min(pct, 60)
        return pct

    def __str__(self):
        return self.title