from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'skill', 'course_name', 'deadline',
            'completed_lessons', 'total_lessons', 'priority', 'ai_recommended',
            'status', 'mentor_id', 'assigned_by_mentor', 'submission_notes',
            'submission_file', 'mentor_feedback', 'submitted_at',
        ]