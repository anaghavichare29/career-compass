from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ProgressSummary
from .serializers import ProgressSummarySerializer


class ProgressSummaryView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        summary, _ = ProgressSummary.objects.get_or_create(user_id=user_id)
        return Response(ProgressSummarySerializer(summary).data)