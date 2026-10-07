import datetime
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status

from .models import Task
from .serializers import TaskSerializer
from progress.models import ProgressSummary


def _generate_default_tasks_for_user(user_id):
    from roadmaps.models import RoadmapStage
    stages = RoadmapStage.objects.filter(user_id=user_id).order_by('order')
    if not stages.exists():
        return

    today = datetime.date.today()
    stage_days = [14, 28, 42, 60]

    for stage_idx, stage in enumerate(stages):
        deadline_date = today + datetime.timedelta(days=stage_days[min(stage_idx, len(stage_days) - 1)])
        for skill_obj in stage.skills.all():
            skill_name = skill_obj.name
            priority = 'High' if stage_idx == 0 else ('Medium' if stage_idx == 1 else 'Low')
            Task.objects.create(
                user_id=user_id,
                title=f"Complete {skill_name} Fundamentals & Practical Course",
                description=f"Develop core understanding, follow structured lessons, and complete exercises for {skill_name} in your roadmap stage '{stage.name}'.",
                skill=skill_name,
                course_name=f"{skill_name} Masterclass",
                deadline=deadline_date,
                completed_lessons=0,
                total_lessons=8,
                priority=priority,
                ai_recommended=True,
                status='Not Started',
            )


def _recalculate_user_progress(user_id):
    tasks = Task.objects.filter(user_id=user_id)
    if not tasks.exists():
        return

    completed_count = tasks.filter(status='Completed').count()
    skill_percent = round((completed_count / tasks.count()) * 100)

    summary, _ = ProgressSummary.objects.get_or_create(user_id=user_id)
    summary.skill_progress_percent = skill_percent
    summary.save()


class TaskListView(ListAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if not user_id:
            return Task.objects.none()

        existing = Task.objects.filter(user_id=user_id)
        if not existing.exists():
            _generate_default_tasks_for_user(user_id)
            existing = Task.objects.filter(user_id=user_id)

        return existing.order_by('id')


class TaskProgressUpdateView(APIView):
    """POST /api/tasks/<id>/progress/  body: { user_id, increment: 1 } or { user_id, completed_lessons: 5 }"""

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        increment = request.data.get('increment')
        completed_lessons = request.data.get('completed_lessons')

        if completed_lessons is not None:
            task.completed_lessons = min(int(completed_lessons), task.total_lessons)
        elif increment is not None:
            task.completed_lessons = min(task.completed_lessons + int(increment), task.total_lessons)
        else:
            task.completed_lessons = min(task.completed_lessons + 1, task.total_lessons)

        if task.completed_lessons >= task.total_lessons:
            task.status = 'Completed'
        elif task.completed_lessons > 0:
            task.status = 'In Progress'

        task.save()
        _recalculate_user_progress(task.user_id)

        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)


class TaskSubmitAssignmentView(APIView):
    """POST /api/tasks/<id>/submit-assignment/  body: { user_id, submission_notes, submission_file }"""

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        notes = request.data.get('submission_notes', '')
        file_url = request.data.get('submission_file', '')

        task.submission_notes = notes
        task.submission_file = file_url
        task.submitted_at = timezone.now()
        task.status = 'Submitted'
        task.completed_lessons = task.total_lessons
        task.save()

        _recalculate_user_progress(task.user_id)

        # Notify
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                    [
                        task.user_id,
                        f"Assignment Submitted: {task.title}",
                        f"You successfully submitted your work for {task.course_name or task.title}. It has been sent for mentor feedback.",
                        "task",
                    ]
                )
        except Exception:
            pass

        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)


class TaskMentorFeedbackView(APIView):
    """POST /api/tasks/<id>/feedback/  body: { mentor_id, feedback, status: 'Completed'|'Needs Revision' }"""

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        mentor_id = request.data.get('mentor_id')
        feedback = request.data.get('feedback', '')
        decision = request.data.get('status', 'Completed')

        task.mentor_id = mentor_id
        task.mentor_feedback = feedback
        task.status = decision
        task.save()

        _recalculate_user_progress(task.user_id)

        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                    [
                        task.user_id,
                        f"Mentor Feedback on: {task.title}",
                        f"A mentor provided feedback on your submission: \"{feedback[:100]}\"",
                        "feedback",
                    ]
                )
        except Exception:
            pass

        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)


class TaskSubmissionsListView(APIView):
    """GET /api/tasks/submissions/?mentor_id=X - Returns student task submissions for review"""

    def get(self, request):
        mentor_id = request.query_params.get('mentor_id')
        tasks = Task.objects.filter(submission_notes__isnull=False).exclude(submission_notes='').order_by('-submitted_at')
        if mentor_id:
            from mentorship.models import ProfessionalProfile
            # include tasks assigned by this mentor or generally submitted tasks
            mentor_tasks = tasks.filter(mentor_id=mentor_id)
            if mentor_tasks.exists():
                tasks = mentor_tasks

        from accounts.models import User
        results = []
        for t in tasks:
            student = User.objects.filter(user_id=t.user_id).first()
            results.append({
                "id": t.id,
                "userId": t.user_id,
                "studentName": f"{student.first_name} {student.last_name or ''}".strip() if student else f"Student #{t.user_id}",
                "studentEmail": student.email if student else "",
                "title": t.title,
                "skill": t.skill,
                "courseName": t.course_name,
                "status": t.status,
                "submissionNotes": t.submission_notes,
                "submissionFile": t.submission_file,
                "mentorFeedback": t.mentor_feedback,
                "submittedAt": t.submitted_at.strftime("%d %b %Y, %I:%M %p") if t.submitted_at else "Recently",
            })
        return Response(results, status=status.HTTP_200_OK)