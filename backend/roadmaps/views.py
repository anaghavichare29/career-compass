from rest_framework.generics import ListAPIView
from .models import RoadmapStage
from .serializers import RoadmapStageSerializer
from .services import sync_roadmap_progress


class RoadmapListView(ListAPIView):
    serializer_class = RoadmapStageSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            sync_roadmap_progress(user_id)
        return RoadmapStage.objects.filter(user_id=user_id).order_by('order')