from django.contrib import admin
from .models import AssessmentSubmission


@admin.register(AssessmentSubmission)
class AssessmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'submitted_at')