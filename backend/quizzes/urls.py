from .views import (
    QuizListView, QuizDetailView, GenerateNewQuizView, SubmitQuizAttemptView,
    CreateStudentQuizView, PendingReviewQuizListView, ReviewQuizView,
    MyQuizAttemptsView, MyQuizSubmissionsView, MiniQuizQuestionsView,
)
from django.urls import path

urlpatterns = [
    path('', QuizListView.as_view(), name='quiz-list'),
    path('mini-quiz/', MiniQuizQuestionsView.as_view(), name='quiz-mini-quiz'),
    path('my-attempts/', MyQuizAttemptsView.as_view(), name='quiz-my-attempts'),
    path('generate-new/', GenerateNewQuizView.as_view(), name='quiz-generate-new'),
    path('create/', CreateStudentQuizView.as_view(), name='quiz-create'),
    path('my-submissions/', MyQuizSubmissionsView.as_view(), name='quiz-my-submissions'),
    path('pending-review/', PendingReviewQuizListView.as_view(), name='quiz-pending-review'),
    path('<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('<int:pk>/submit/', SubmitQuizAttemptView.as_view(), name='quiz-submit'),
    path('<int:pk>/review/', ReviewQuizView.as_view(), name='quiz-review'),
]