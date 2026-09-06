from rest_framework import serializers
from .models import RoadmapStage, RoadmapSkill


class RoadmapSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapSkill
        fields = ['id', 'name', 'status', 'progress']


class RoadmapStageSerializer(serializers.ModelSerializer):
    skills = RoadmapSkillSerializer(many=True, read_only=True)

    class Meta:
        model = RoadmapStage
        fields = ['id', 'name', 'description', 'duration', 'status', 'order', 'skills']