from django.urls import path
from .views import (
    TaskListView,
    TaskProgressUpdateView,
    TaskSubmitAssignmentView,
    TaskMentorFeedbackView,
    TaskSubmissionsListView,
    SubmitPracticeWorkView,
)

urlpatterns = [
    path('', TaskListView.as_view(), name='task-list'),
    path('submissions/', TaskSubmissionsListView.as_view(), name='task-submissions'),
    path('submit-practice/', SubmitPracticeWorkView.as_view(), name='task-submit-practice'),
    path('<int:pk>/progress/', TaskProgressUpdateView.as_view(), name='task-progress'),
    path('<int:pk>/submit-assignment/', TaskSubmitAssignmentView.as_view(), name='task-submit-assignment'),
    path('<int:pk>/feedback/', TaskMentorFeedbackView.as_view(), name='task-mentor-feedback'),
]