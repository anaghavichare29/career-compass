from django.urls import path
from .views import RoadmapListView

urlpatterns = [
    path('', RoadmapListView.as_view(), name='roadmap-list'),
]