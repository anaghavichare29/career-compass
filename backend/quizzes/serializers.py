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
            'career_name', 'created_at', 'status_label', 'question_count',
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
    """Pending student quizzes as a mentor sees them."""
    questions = QuizQuestionSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()

    def get_student_name(self, obj):
        names = self.context.get('student_names') or {}
        return names.get(obj.user_id, f"Student #{obj.user_id}")

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'skill', 'difficulty', 'duration_minutes',
            'user_id', 'student_name', 'created_at', 'questions',
        ]


class MyQuizSubmissionSerializer(serializers.ModelSerializer):
    """A student's own submitted quiz with its review status."""
    question_count = serializers.SerializerMethodField()

    def get_question_count(self, obj):
        return obj.questions.count()

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'skill', 'difficulty', 'status', 'review_notes',
            'question_count', 'created_at',
        ]
