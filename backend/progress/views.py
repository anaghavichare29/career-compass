from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ProgressSummary
from .serializers import ProgressSummarySerializer
from students.views import StudentCareerReadinessView, StudentSkillGapView


class ProgressSummaryView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        summary, _ = ProgressSummary.objects.get_or_create(user_id=user_id)
        return Response(ProgressSummarySerializer(summary).data)


class ProgressInsightsView(APIView):
    """GET /api/progress/insights/?user_id=X"""
    def get(self, request):
        readiness_resp = StudentCareerReadinessView().get(request)
        skillgap_resp = StudentSkillGapView().get(request)

        r_data = readiness_resp.data if hasattr(readiness_resp, 'data') else {}
        s_data = skillgap_resp.data if hasattr(skillgap_resp, 'data') else {}

        combined = {
            "has_data": bool(r_data.get("has_data", False)),
            "target_career": r_data.get("target_career", "Not selected"),
            "targetCareer": r_data.get("target_career", "Not selected"),
            "career_match": r_data.get("career_match", 0),
            "careerMatch": r_data.get("career_match", 0),
            "readiness": r_data.get("readiness", {}),
            "skills": s_data.get("skills", []),
            "skill_summary": s_data.get("skill_summary", {}),
            "summary": s_data.get("skill_summary", {}),
            "skill_insight": s_data.get("skill_insight", {}),
            "insight": s_data.get("insight", {}),
            "categories": r_data.get("categories", []),
            "strengths": r_data.get("strengths", []),
            "improvement_areas": r_data.get("improvement_areas", []),
            "improvementAreas": r_data.get("improvement_areas", []),
            "next_steps": r_data.get("next_steps", []),
        }
        return Response(combined, status=status.HTTP_200_OK)