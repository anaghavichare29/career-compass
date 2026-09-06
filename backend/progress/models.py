from django.db import models


class ProgressSummary(models.Model):
    user_id = models.IntegerField(unique=True)
    skill_progress_percent = models.PositiveIntegerField(default=0)
    quiz_progress_percent = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'progress_summary'

    def __str__(self):
        return f"user {self.user_id}"