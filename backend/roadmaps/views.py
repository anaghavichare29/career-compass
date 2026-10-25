from rest_framework.generics import ListAPIView
from .models import RoadmapStage
from .serializers import RoadmapStageSerializer
from .services import sync_roadmap_progress, generate_roadmap_for_user
from careers.models import CareerDefinition, CareerRecommendation


class RoadmapListView(ListAPIView):
    serializer_class = RoadmapStageSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        career_name = self.request.query_params.get('career_name')
        if not user_id:
            return RoadmapStage.objects.none()

        # If career_name is not provided, pick top recommended career or first available career
        if not career_name or career_name == 'undefined' or career_name == 'null':
            top_rec = CareerRecommendation.objects.filter(user_id=user_id).order_by("-match_percent", "id").first()
            if top_rec:
                career_name = top_rec.career_name
            else:
                first_career = CareerDefinition.objects.first()
                if first_career:
                    career_name = first_career.name

        if career_name:
            stages = RoadmapStage.objects.filter(user_id=user_id, career_name=career_name)
            if not stages.exists():
                career_def = CareerDefinition.objects.filter(name__iexact=career_name).first()
                if career_def:
                    generate_roadmap_for_user(user_id, career_def)
                stages = RoadmapStage.objects.filter(user_id=user_id, career_name=career_name)

            sync_roadmap_progress(user_id, career_name=career_name)
            return RoadmapStage.objects.filter(user_id=user_id, career_name=career_name).order_by('order')

        sync_roadmap_progress(user_id)
        return RoadmapStage.objects.filter(user_id=user_id).order_by('order')