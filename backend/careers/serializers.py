# backend/careers/serializers.py
from rest_framework import serializers
from .models import CareerRecommendation

class CareerRecommendationSerializer(serializers.ModelSerializer):
    matched_skills = serializers.SerializerMethodField()
    missing_skills = serializers.SerializerMethodField()

    class Meta:
        model = CareerRecommendation
        fields = ['id', 'career_name', 'match_percent', 'description', 'matched_skills', 'missing_skills']

    def get_matched_skills(self, obj):
        return [s.strip() for s in obj.matched_skills.split(',') if s.strip()]

    def get_missing_skills(self, obj):
        return [s.strip() for s in obj.missing_skills.split(',') if s.strip()]