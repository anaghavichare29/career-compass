from django.contrib import admin
from .models import CareerDefinition, CareerRecommendation


@admin.register(CareerDefinition)
class CareerDefinitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'required_skills', 'tags')
    search_fields = ('name',)


@admin.register(CareerRecommendation)
class CareerRecommendationAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'career_name', 'match_percent')
    list_filter = ('career_name',)