from django.urls import path
from .views import (
    IndustryExpertsListView,
    IndustryExpertDetailView,
    GuidanceRequestCreateView,
    GuidanceRequestListView,
    GuidanceRequestReplyView,
    GuidanceRequestActionView,
    MentorProfileView,
    MentorStudentsListView,
    MentorStudentProgressView,
    MentorAssignTaskView,
    MentorAssignRoadmapView,
    LearningResourcesView,
    MyMentorsView,
    MentorMessageListView,
    MentorMessageSendView,
)

urlpatterns = [
    path('experts/', IndustryExpertsListView.as_view(), name='mentorship-experts'),
    path('experts/<int:pk>/', IndustryExpertDetailView.as_view(), name='mentorship-expert-detail'),
    path('profile/', MentorProfileView.as_view(), name='mentorship-profile'),
    path('requests/', GuidanceRequestCreateView.as_view(), name='mentorship-request-create'),
    path('requests/list/', GuidanceRequestListView.as_view(), name='mentorship-request-list'),
    path('requests/<int:pk>/reply/', GuidanceRequestReplyView.as_view(), name='mentorship-request-reply'),
    path('requests/<int:pk>/action/', GuidanceRequestActionView.as_view(), name='mentorship-request-action'),
    path('my-students/', MentorStudentsListView.as_view(), name='mentorship-my-students'),
    path('student-progress/<int:student_id>/', MentorStudentProgressView.as_view(), name='mentorship-student-progress'),
    path('assign-task/', MentorAssignTaskView.as_view(), name='mentorship-assign-task'),
    path('assign-roadmap/', MentorAssignRoadmapView.as_view(), name='mentorship-assign-roadmap'),
    path('resources/', LearningResourcesView.as_view(), name='mentorship-resources'),
    path('my-mentors/', MyMentorsView.as_view(), name='mentorship-my-mentors'),
    # Mentor chat messages
    path('messages/', MentorMessageListView.as_view(), name='mentor-messages-list'),
    path('messages/send/', MentorMessageSendView.as_view(), name='mentor-messages-send'),
]
