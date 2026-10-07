from django.db import models


class ProfessionalProfile(models.Model):
    professional_id = models.AutoField(primary_key=True)
    user_id = models.IntegerField(unique=True)
    company = models.CharField(max_length=150, null=True, blank=True)
    designation = models.CharField(max_length=150, null=True, blank=True)
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    skills = models.TextField(null=True, blank=True)
    guidance_topics = models.TextField(null=True, blank=True)
    journey = models.JSONField(null=True, blank=True)
    interview_tips = models.JSONField(null=True, blank=True)
    workplace_expectations = models.TextField(null=True, blank=True)
    is_verified = models.BooleanField(default=True)

    class Meta:
        db_table = 'professionals'
        managed = False

    def __str__(self):
        return f"{self.designation} at {self.company}"


class GuidanceRequest(models.Model):
    student_id = models.IntegerField()
    mentor_id = models.IntegerField()
    topic = models.CharField(max_length=200)
    message = models.TextField()
    goals = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, default='pending')
    reply = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'guidance_requests'
        managed = False

    def __str__(self):
        return f"Request by {self.student_id} to {self.mentor_id}: {self.topic}"
