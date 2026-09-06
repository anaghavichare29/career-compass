from django.urls import path
from .views import ProgressSummaryView

urlpatterns = [
    path('', ProgressSummaryView.as_view(), name='progress-summary'),
]