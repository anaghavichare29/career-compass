from rest_framework import serializers
from .models import Quiz, QuizQuestion, QuizAttempt


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question', 'options', 'correct_index']


class QuizQuestionPublicSerializer(serializers.ModelSerializer):
    """Used when a student is TAKING a quiz — hides the correct answer."""
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question', 'options']


class QuizListSerializer(serializers.ModelSerializer):
    status_label = serializers.SerializerMethodField()
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'skill', 'difficulty',
            'duration_minutes', 'source', 'status', 'ai_recommended',
            'created_at', 'status_label', 'question_count',
        ]

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_status_label(self, obj):
        user_id = self.context.get('user_id')
        completed = QuizAttempt.objects.filter(quiz=obj, user_id=user_id).exists()
        return "Completed" if completed else "Available"


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuizQuestionPublicSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'skill', 'difficulty', 'duration_minutes', 'questions']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'score', 'total_questions', 'completed_at']


class QuizReviewListSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'skill', 'difficulty',
            'user_id', 'created_at', 'questions',
        ]