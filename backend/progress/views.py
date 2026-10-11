from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ProgressSummary
from .serializers import ProgressSummarySerializer
from .insights import build_insights


class ProgressSummaryView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        summary, _ = ProgressSummary.objects.get_or_create(user_id=user_id)
        return Response(ProgressSummarySerializer(summary).data)


class ProgressInsightsView(APIView):
    """GET /api/progress/insights/?user_id=X  - skill gap + career readiness in one payload."""

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id or not str(user_id).isdigit():
            return Response({"detail": "A valid user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(build_insights(int(user_id)), status=status.HTTP_200_OK)
