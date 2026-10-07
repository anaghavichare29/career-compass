from django.urls import path
from .views import (
    StudentProfileView,
    StudentSkillManageView,
    StudentSkillGapView,
    StudentCareerReadinessView,
    StudentProgressView,
)

urlpatterns = [
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
    path('skills/', StudentSkillManageView.as_view(), name='student-skills'),
    path('skill-gap/', StudentSkillGapView.as_view(), name='student-skill-gap'),
    path('career-readiness/', StudentCareerReadinessView.as_view(), name='student-readiness'),
    path('progress/', StudentProgressView.as_view(), name='student-progress'),
]
