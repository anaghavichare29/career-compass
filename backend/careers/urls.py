# backend/careers/urls.py
from django.urls import path
from .views import CareerRecommendationListView

urlpatterns = [
    path('', CareerRecommendationListView.as_view(), name='career-list'),
]