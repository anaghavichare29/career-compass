from rest_framework import serializers
from .models import StudentProfile, Skill, StudentSkill


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'student_id', 'user_id', 'college', 'course', 'year',
            'academic_score', 'bio', 'phone', 'location', 'career_goal'
        ]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['skill_id', 'skill_name', 'category']


class StudentSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSkill
        fields = ['student_skill_id', 'student_id', 'skill_id', 'proficiency_level']
