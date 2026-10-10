from django.urls import path
from .views import ProgressSummaryView, ProgressInsightsView

urlpatterns = [
    path('', ProgressSummaryView.as_view(), name='progress-summary'),
    path('insights/', ProgressInsightsView.as_view(), name='progress-insights'),
]