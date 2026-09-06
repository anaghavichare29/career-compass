from rest_framework import serializers
from .models import ProgressSummary


class ProgressSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressSummary
        fields = ['skill_progress_percent', 'quiz_progress_percent']