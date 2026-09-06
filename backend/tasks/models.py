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

    class Meta:
        db_table = 'tasks'

    def __str__(self):
        return self.title