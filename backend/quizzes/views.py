from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status

from .models import Quiz, QuizQuestion, QuizAttempt
from .serializers import (
    QuizListSerializer, QuizDetailSerializer, QuizAttemptSerializer,
    QuizReviewListSerializer,
)
from .generator import generate_initial_quizzes, generate_quiz_for_skill, get_skills_for_user

INITIAL_QUIZ_COUNT = 10


class QuizListView(ListAPIView):
    """GET /api/quizzes/?user_id=X
    Returns this student's approved quizzes (AI + their own approved ones).
    Auto-generates the initial 10 the first time this is called."""
    serializer_class = QuizListSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        has_any = Quiz.objects.filter(user_id=user_id, source='ai').exists()
        if not has_any and user_id:
            generate_initial_quizzes(user_id, count=INITIAL_QUIZ_COUNT)

        return Quiz.objects.filter(user_id=user_id, status='approved').order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user_id'] = self.request.query_params.get('user_id')
        return context


class QuizDetailView(RetrieveAPIView):
    """GET /api/quizzes/<id>/ — used by the quiz-taking page."""
    queryset = Quiz.objects.all()
    serializer_class = QuizDetailSerializer


class GenerateNewQuizView(APIView):
    """POST /api/quizzes/generate-new/  body: { user_id }
    Only allowed once the student has completed ALL their current
    approved AI quizzes."""

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        approved_ai_quizzes = Quiz.objects.filter(user_id=user_id, source='ai', status='approved')
        completed_quiz_ids = set(
            QuizAttempt.objects.filter(user_id=user_id).values_list('quiz_id', flat=True)
        )

        remaining = [q for q in approved_ai_quizzes if q.id not in completed_quiz_ids]
        if remaining:
            return Response(
                {"detail": f"You still have {len(remaining)} quiz(zes) left to complete before generating a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        skills = get_skills_for_user(user_id)
        import random
        skill = random.choice(skills)
        quiz = generate_quiz_for_skill(user_id, skill, source='ai', status='approved')

        return Response(QuizListSerializer(quiz, context={'user_id': user_id}).data, status=status.HTTP_201_CREATED)


class SubmitQuizAttemptView(APIView):
    """POST /api/quizzes/<id>/submit/  body: { user_id, answers: {question_id: selected_index, ...} }"""

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

        user_id = request.data.get('user_id')
        answers = request.data.get('answers', {})  # { "12": 1, "13": 0, ... }

        questions = quiz.questions.all()
        score = 0
        for q in questions:
            selected = answers.get(str(q.id))
            if selected is not None and int(selected) == q.correct_index:
                score += 1

        attempt = QuizAttempt.objects.create(
            user_id=user_id,
            quiz=quiz,
            score=score,
            total_questions=questions.count(),
        )

        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class CreateStudentQuizView(APIView):
    """POST /api/quizzes/create/  body:
    { user_id, title, skill, description, questions: [{question, options, correct_index}, ...] }
    Saved as pending — only visible to the student until an expert approves it."""

    def post(self, request):
        data = request.data
        required = ['user_id', 'title', 'skill', 'questions']
        if not all(data.get(f) for f in required):
            return Response({"detail": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        quiz = Quiz.objects.create(
            user_id=data['user_id'],
            title=data['title'],
            skill=data['skill'],
            description=data.get('description', ''),
            difficulty=data.get('difficulty', 'Beginner'),
            duration_minutes=data.get('duration_minutes', 10),
            source='student',
            status='pending',
        )

        QuizQuestion.objects.bulk_create([
            QuizQuestion(
                quiz=quiz,
                question=q['question'],
                options=q['options'],
                correct_index=q['correct_index'],
            )
            for q in data['questions']
        ])

        return Response({"detail": "Quiz submitted for expert review.", "quiz_id": quiz.id}, status=status.HTTP_201_CREATED)


class PendingReviewQuizListView(ListAPIView):
    """GET /api/quizzes/pending-review/ — for industry experts."""
    serializer_class = QuizReviewListSerializer
    queryset = Quiz.objects.filter(source='student', status='pending').order_by('created_at')


class ReviewQuizView(APIView):
    """POST /api/quizzes/<id>/review/  body: { reviewer_user_id, decision: 'approved'|'rejected', notes }"""

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

        decision = request.data.get('decision')
        if decision not in ('approved', 'rejected'):
            return Response({"detail": "decision must be 'approved' or 'rejected'."}, status=status.HTTP_400_BAD_REQUEST)

        quiz.status = decision
        quiz.reviewed_by_user_id = request.data.get('reviewer_user_id')
        quiz.review_notes = request.data.get('notes', '')
        quiz.save()

        return Response({"detail": f"Quiz {decision}."}, status=status.HTTP_200_OK)

class MyQuizAttemptsView(ListAPIView):
    """GET /api/quizzes/my-attempts/?user_id=X — used for stats (avg score, completed count)."""
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return QuizAttempt.objects.filter(user_id=user_id)