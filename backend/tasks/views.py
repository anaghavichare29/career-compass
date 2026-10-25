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
    """Called after any task change: refresh the summary AND the roadmap."""
    from roadmaps.services import sync_roadmap_progress

    tasks = list(Task.objects.filter(user_id=user_id))
    skill_percent = round(sum(t.percent for t in tasks) / len(tasks)) if tasks else 0

    summary, _ = ProgressSummary.objects.get_or_create(user_id=user_id)
    summary.skill_progress_percent = skill_percent
    summary.save(update_fields=['skill_progress_percent'])

    sync_roadmap_progress(user_id)


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
    """POST /api/tasks/<id>/submit-assignment/  body: { user_id, submission_notes, submission_file }
    At least one of notes / file link is required."""

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        notes = (request.data.get('submission_notes') or '').strip()
        file_url = (request.data.get('submission_file') or '').strip()
        if not notes and not file_url:
            return Response(
                {"detail": "Add a project link or a few notes before submitting."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task.submission_notes = notes
        task.submission_file = file_url
        task.submitted_at = timezone.now()
        task.status = 'Submitted'
        task.completed_lessons = task.total_lessons
        task.save()

        _recalculate_user_progress(task.user_id)

        from mentorship.services import notify, notify_student_mentors
        from accounts.models import User
        student = User.objects.filter(user_id=task.user_id).first()
        student_name = f"{student.first_name} {student.last_name or ''}".strip() if student else f"Student #{task.user_id}"
        mentors_notified = notify_student_mentors(
            task.user_id,
            f"New task submission: {task.title}",
            f"{student_name} submitted work for \"{task.title}\" and is waiting for your review.",
            "task",
        )
        notify(
            task.user_id,
            f"Assignment Submitted: {task.title}",
            (
                f"You submitted your work for {task.course_name or task.title}. "
                + ("It has been sent to your mentor for feedback."
                   if mentors_notified else
                   "You are not connected with a mentor yet; it will appear for a mentor once they accept your guidance request.")
            ),
            "task",
        )

        data = dict(TaskSerializer(task).data)
        data["mentors_notified"] = mentors_notified
        return Response(data, status=status.HTTP_200_OK)


class SubmitPracticeWorkView(APIView):
    """
    POST /api/tasks/submit-practice/
    body: { user_id, skill, project_link, code_snippet, mentor_id }
    Submitted from the Learning Workspace. Links to or creates a Task for the skill,
    records submission, recalculates user progress, and notifies the selected mentor.
    """

    def post(self, request):
        user_id = request.data.get('user_id')
        skill = (request.data.get('skill') or '').strip()
        project_link = (request.data.get('project_link') or '').strip()
        code_snippet = (request.data.get('code_snippet') or '').strip()
        mentor_id = request.data.get('mentor_id')

        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not project_link and not code_snippet:
            return Response({"detail": "Project link or code snippet is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Find or create task for this skill
        task = Task.objects.filter(user_id=user_id, skill__iexact=skill).first()
        if not task:
            task = Task.objects.create(
                user_id=user_id,
                title=f"{skill} Practice Project",
                description=f"Practical implementation and project work for {skill}.",
                skill=skill,
                course_name="Learning Workspace",
                priority="Medium",
                total_lessons=1,
                completed_lessons=1,
            )

        task.submission_file = project_link
        task.submission_notes = code_snippet
        task.submitted_at = timezone.now()
        task.status = 'Submitted'
        task.completed_lessons = task.total_lessons
        if mentor_id:
            try:
                task.mentor_id = int(mentor_id)
            except (ValueError, TypeError):
                pass
        task.save()

        _recalculate_user_progress(user_id)

        from mentorship.services import notify
        from accounts.models import User
        student = User.objects.filter(user_id=user_id).first()
        student_name = f"{student.first_name} {student.last_name or ''}".strip() if student else f"Student #{user_id}"

        mentor_name = ""
        if mentor_id:
            mentor_user = User.objects.filter(user_id=mentor_id).first()
            mentor_name = f"{mentor_user.first_name} {mentor_user.last_name or ''}".strip() if mentor_user else "Mentor"
            notify(
                int(mentor_id),
                f"New Practice Submission: {skill}",
                f"{student_name} submitted work for {skill} ({task.title}) and requested your review.",
                "task",
            )
            notify(
                user_id,
                f"Practice Work Submitted: {skill}",
                f"Your {skill} project has been submitted to {mentor_name} for review.",
                "task",
            )
        else:
            notify(
                user_id,
                f"Practice Work Saved: {skill}",
                f"Your work for {skill} has been saved to your learning workspace.",
                "task",
            )

        return Response({
            "detail": "Practice work submitted successfully.",
            "task_id": task.id,
            "mentor_id": task.mentor_id,
            "mentor_name": mentor_name,
        }, status=status.HTTP_200_OK)



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
    """
    GET /api/tasks/submissions/?mentor_id=<mentor user id>

    Submitted work from the mentor's students (students who sent them a guidance
    request that was not rejected), plus any task the mentor assigned themselves.
    Work still awaiting review is listed first.
    """

    def get(self, request):
        mentor_id = request.query_params.get('mentor_id')
        if not mentor_id or not str(mentor_id).isdigit():
            return Response([], status=status.HTTP_200_OK)

        from django.db.models import Q
        from accounts.models import User
        from mentorship.services import student_ids_for_mentor

        student_ids = student_ids_for_mentor(int(mentor_id))
        submitted = Q(submitted_at__isnull=False) | Q(status__in=['Submitted', 'Needs Revision']) | ~Q(submission_notes='') | ~Q(submission_file='')
        mine = Q(user_id__in=student_ids) | Q(mentor_id=int(mentor_id))
        tasks = list(Task.objects.filter(submitted & mine).distinct())

        tasks.sort(key=lambda t: (t.status != 'Submitted', -(t.submitted_at.timestamp() if t.submitted_at else 0)))

        users = {u.user_id: u for u in User.objects.filter(user_id__in={t.user_id for t in tasks})}
        results = []
        for t in tasks:
            student = users.get(t.user_id)
            results.append({
                "id": t.id,
                "userId": t.user_id,
                "studentName": f"{student.first_name} {student.last_name or ''}".strip() if student else f"Student #{t.user_id}",
                "studentEmail": student.email if student else "",
                "title": t.title,
                "skill": t.skill,
                "courseName": t.course_name,
                "status": t.status,
                "awaitingReview": t.status == 'Submitted',
                "submissionNotes": t.submission_notes,
                "submissionFile": t.submission_file,
                "mentorFeedback": t.mentor_feedback,
                "submittedAt": t.submitted_at.strftime("%d %b %Y, %I:%M %p") if t.submitted_at else "Recently",
            })
        return Response(results, status=status.HTTP_200_OK)
