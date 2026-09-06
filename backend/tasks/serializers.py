from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'skill', 'course_name', 'deadline',
            'completed_lessons', 'total_lessons', 'priority', 'ai_recommended', 'status',
        ]

    def get_status(self, obj):
        if obj.completed_lessons >= obj.total_lessons:
            return "Completed"
        if obj.completed_lessons > 0:
            return "In Progress"
        return "Not Started"