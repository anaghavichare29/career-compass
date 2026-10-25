from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Q
from .models import Quiz, QuizQuestion, QuizAttempt
from .serializers import (
    QuizListSerializer, QuizDetailSerializer, QuizAttemptSerializer,
    QuizReviewListSerializer, MyQuizSubmissionSerializer,
)
from .generator import (
    generate_initial_quizzes, generate_quiz_for_skill, get_skills_for_user,
    normalize_career_name,
)

INITIAL_QUIZ_COUNT = 10


class QuizListView(ListAPIView):
    """GET /api/quizzes/?user_id=X&career_name=Y
    Returns this student's approved quizzes (AI + their own approved ones).
    Auto-generates career-specific quizzes if needed."""
    serializer_class = QuizListSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        career_name = self.request.query_params.get('career_name')
        if not user_id:
            return Quiz.objects.none()

        aptitude_skills = [
            "General Aptitude", "Logical Reasoning", "Verbal Reasoning",
            "Quantitative Aptitude", "Numerical Reasoning", "Abstract Reasoning",
            "Critical Thinking", "Data Interpretation"
        ]

        if career_name and career_name not in ('undefined', 'null'):
            resolved_career = normalize_career_name(career_name)
            has_career_quizzes = Quiz.objects.filter(
                user_id=user_id,
                source='ai',
                career_name__iexact=resolved_career
            ).exists()
            if not has_career_quizzes:
                generate_initial_quizzes(user_id, count=INITIAL_QUIZ_COUNT, career_name=resolved_career)

            return Quiz.objects.filter(
                Q(user_id=user_id, status='approved') & (
                    Q(career_name__iexact=resolved_career) |
                    Q(source='student') |
                    Q(skill__in=aptitude_skills) |
                    Q(career_name='Aptitude')
                )
            ).order_by('-created_at')

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
    """POST /api/quizzes/generate-new/  body: { user_id, section, career_name }
    Generates a new quiz based on section:
      - section='career': generates a quiz for a career skill
      - section='aptitude': generates a general aptitude quiz"""

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        section = request.data.get('section', 'career').lower()
        career_name = request.data.get('career_name', '')
        resolved_career = normalize_career_name(career_name) if career_name else ""

        import random

        if section == 'aptitude':
            aptitude_skills = [
                "General Aptitude", "Logical Reasoning", "Verbal Reasoning",
                "Quantitative Aptitude", "Numerical Reasoning", "Abstract Reasoning",
                "Critical Thinking", "Data Interpretation"
            ]
            skill = random.choice(aptitude_skills)
            quiz_career = "Aptitude"
        else:
            # Career section: use career-specific skills
            skills = get_skills_for_user(user_id, career_name=resolved_career)
            if not skills and resolved_career:
                skills = [resolved_career]
            skill = random.choice(skills) if skills else (resolved_career or "Software Development")
            quiz_career = resolved_career

        try:
            quiz = generate_quiz_for_skill(user_id, skill, source='ai', status='approved', career_name=quiz_career)
        except Exception as exc:
            return Response(
                {"detail": "Quiz generation failed. Please try again.", "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(QuizListSerializer(quiz, context={'user_id': user_id}).data, status=status.HTTP_201_CREATED)


class SubmitQuizAttemptView(APIView):
    """POST /api/quizzes/<id>/submit/  body: { user_id, answers: {question_id: selected_index, ...}, is_time_bound, time_taken_seconds }"""

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

        user_id = request.data.get('user_id')
        answers = request.data.get('answers', {})  # { "12": 1, "13": 0, ... }
        is_time_bound = request.data.get('is_time_bound', True)
        time_taken_seconds = request.data.get('time_taken_seconds', 0)

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
            is_time_bound=is_time_bound,
            time_taken_seconds=time_taken_seconds,
        )

        # Update progress summary
        from progress.models import ProgressSummary
        total_quizzes = Quiz.objects.filter(user_id=user_id, status='approved').count()
        if total_quizzes > 0:
            distinct_attempted = QuizAttempt.objects.filter(user_id=user_id).values('quiz_id').distinct().count()
            quiz_percent = min(100, round((distinct_attempted / total_quizzes) * 100))
            ps, _ = ProgressSummary.objects.get_or_create(user_id=user_id)
            ps.quiz_progress_percent = quiz_percent
            ps.save()

        # Add notification
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                    [
                        user_id,
                        f"Quiz Result: {quiz.title}",
                        f"You scored {score}/{questions.count()} on {quiz.title} ({'Time-Bound' if is_time_bound else 'Self-Paced'} mode).",
                        "quiz",
                    ]
                )
        except Exception:
            pass

        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class CreateStudentQuizView(APIView):
    """POST /api/quizzes/create/  body:
    { user_id, title, skill, description, questions: [{question, options, correct_index}, ...] }
    Saved as pending and sent to the student's mentor(s) for review."""

    def post(self, request):
        data = request.data
        required = ['user_id', 'title', 'skill', 'questions']
        if not all(data.get(f) for f in required):
            return Response({"detail": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        questions = data['questions']
        if not isinstance(questions, list) or not questions:
            return Response({"detail": "Add at least one question."}, status=status.HTTP_400_BAD_REQUEST)
        clean = []
        for i, q in enumerate(questions, start=1):
            try:
                options = [str(o).strip() for o in q['options']]
                correct = int(q['correct_index'])
                text = str(q['question']).strip()
            except (KeyError, TypeError, ValueError):
                return Response({"detail": f"Question {i} is malformed."}, status=status.HTTP_400_BAD_REQUEST)
            if not text or len(options) != 4 or any(not o for o in options) or not 0 <= correct < 4:
                return Response({"detail": f"Question {i} needs text, four options and a correct answer."},
                                status=status.HTTP_400_BAD_REQUEST)
            clean.append(QuizQuestion(question=text, options=options, correct_index=correct))

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
        for q in clean:
            q.quiz = quiz
        QuizQuestion.objects.bulk_create(clean)

        from mentorship.services import notify, notify_student_mentors
        from accounts.models import User
        student = User.objects.filter(user_id=data['user_id']).first()
        student_name = f"{student.first_name} {student.last_name or ''}".strip() if student else f"Student #{data['user_id']}"
        mentors_notified = notify_student_mentors(
            data['user_id'],
            f"Quiz awaiting review: {quiz.title}",
            f"{student_name} created the quiz \"{quiz.title}\" ({quiz.skill}) and sent it for your review.",
            "quiz",
        )
        notify(
            data['user_id'],
            f"Quiz '{quiz.title}' submitted for review",
            ("Your quiz was sent to your mentor. You'll be notified when it is approved or needs changes."
             if mentors_notified else
             "Your quiz is saved. You are not connected with a mentor yet; a mentor will see it once they accept your guidance request."),
            "quiz",
        )

        return Response(
            {"detail": "Quiz submitted for mentor review.", "quiz_id": quiz.id, "mentors_notified": mentors_notified},
            status=status.HTTP_201_CREATED,
        )


class MyQuizSubmissionsView(ListAPIView):
    """GET /api/quizzes/my-submissions/?user_id=X - the student's own quizzes sent for review (any status)."""
    serializer_class = MyQuizSubmissionSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if not user_id:
            return Quiz.objects.none()
        return Quiz.objects.filter(user_id=user_id, source='student').order_by('-created_at')


class PendingReviewQuizListView(ListAPIView):
    """GET /api/quizzes/pending-review/?mentor_user_id=X
    Student-created quizzes waiting for review. With mentor_user_id, only quizzes from
    that mentor's students are returned."""
    serializer_class = QuizReviewListSerializer

    def get_queryset(self):
        qs = Quiz.objects.filter(source='student', status='pending').order_by('created_at').prefetch_related('questions')
        mentor_user_id = self.request.query_params.get('mentor_user_id')
        if mentor_user_id and str(mentor_user_id).isdigit():
            from mentorship.services import student_ids_for_mentor
            qs = qs.filter(user_id__in=student_ids_for_mentor(int(mentor_user_id)))
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        from accounts.models import User
        ids = Quiz.objects.filter(source='student', status='pending').values_list('user_id', flat=True)
        context['student_names'] = {
            u.user_id: f"{u.first_name} {u.last_name or ''}".strip() for u in User.objects.filter(user_id__in=set(ids))
        }
        return context


class ReviewQuizView(APIView):
    """POST /api/quizzes/<id>/review/  body: { reviewer_user_id, decision: 'approved'|'rejected', notes }"""

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

        if quiz.source != 'student':
            return Response({"detail": "Only student-created quizzes can be reviewed."}, status=status.HTTP_400_BAD_REQUEST)

        decision = request.data.get('decision')
        if decision not in ('approved', 'rejected'):
            return Response({"detail": "decision must be 'approved' or 'rejected'."}, status=status.HTTP_400_BAD_REQUEST)

        quiz.status = decision
        quiz.reviewed_by_user_id = request.data.get('reviewer_user_id')
        quiz.review_notes = request.data.get('notes', '')
        quiz.save()

        try:
            from django.db import connection
            with connection.cursor() as cursor:
                notes_msg = f" Notes: {quiz.review_notes}" if quiz.review_notes else ""
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                    [
                        quiz.user_id,
                        f"Quiz Evaluation: {quiz.title} {decision.capitalize()}",
                        f"Your submitted quiz was {decision} by an industry expert.{notes_msg}",
                        "quiz",
                    ]
                )
        except Exception:
            pass

        return Response({"detail": f"Quiz {decision}."}, status=status.HTTP_200_OK)

class MyQuizAttemptsView(ListAPIView):
    """GET /api/quizzes/my-attempts/?user_id=X — used for stats (avg score, completed count)."""
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return QuizAttempt.objects.filter(user_id=user_id)


class MiniQuizQuestionsView(APIView):
    """
    GET /api/quizzes/mini-quiz/?skill=<skill_name>&user_id=<user_id>&count=8
    Generates or retrieves authentic, skill-specific questions for Learning Workspace mini quizzes.
    Includes question, 4 options, and correct_index so the workspace can evaluate answers accurately.
    """

    def get(self, request):
        skill = (request.query_params.get("skill") or "").strip()
        count = int(request.query_params.get("count", 8))
        if not skill:
            return Response({"detail": "skill parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Generate questions specifically for this skill via Gemini or fallback bank
        from .generator import _generate_with_gemini, _build_question_pool_offline
        questions = _generate_with_gemini(skill, "Intermediate", count=count)
        if not questions or len(questions) < min(count, 4):
            questions = _build_question_pool_offline(skill, count=count)

        data = [
            {
                "id": idx + 1,
                "question": q["question"],
                "options": q["options"],
                "correct_index": q["correct_index"],
            }
            for idx, q in enumerate(questions[:count])
        ]
        return Response({"skill": skill, "questions": data}, status=status.HTTP_200_OK)