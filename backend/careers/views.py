# backend/careers/views.py
from rest_framework.generics import ListAPIView
from .models import CareerRecommendation
from .serializers import CareerRecommendationSerializer

class CareerRecommendationListView(ListAPIView):
    serializer_class = CareerRecommendationSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return CareerRecommendation.objects.filter(user_id=user_id).order_by('-match_percent')