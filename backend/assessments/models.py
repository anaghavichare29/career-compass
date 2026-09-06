from django.db import models


class AssessmentSubmission(models.Model):
    user_id = models.IntegerField()
    answers = models.JSONField()
    academic_info = models.JSONField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assessment_submissions'

    def __str__(self):
        return f"Submission by user {self.user_id} on {self.submitted_at}"