from rest_framework import serializers
from .models import RoadmapStage, RoadmapSkill


class RoadmapSkillSerializer(serializers.ModelSerializer):
    mini_quiz = serializers.SerializerMethodField()

    class Meta:
        model = RoadmapSkill
        fields = [
            'id', 'name', 'status', 'progress',
            'what_to_learn', 'why_it_matters', 'resources', 'mini_quiz',
        ]

    def get_mini_quiz(self, obj):
        """Finds the student's own approved quiz for this skill, if there is one."""
        from quizzes.models import Quiz, QuizAttempt

        user_id = obj.stage.user_id
        quiz = (
            Quiz.objects.filter(user_id=user_id, skill=obj.name, status='approved')
            .order_by('-ai_recommended', '-created_at')
            .first()
        )
        if not quiz:
            return None

        return {
            "id": quiz.id,
            "title": quiz.title,
            "completed": QuizAttempt.objects.filter(user_id=user_id, quiz=quiz).exists(),
        }

class RoadmapStageSerializer(serializers.ModelSerializer):
    skills = RoadmapSkillSerializer(many=True, read_only=True)

    class Meta:
        model = RoadmapStage
        fields = ['id', 'name', 'description', 'duration', 'status', 'order', 'skills']