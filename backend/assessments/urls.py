from django.urls import path
from .views import AssessmentSubmitView

urlpatterns = [
    path('submit/', AssessmentSubmitView.as_view(), name='assessment-submit'),
]