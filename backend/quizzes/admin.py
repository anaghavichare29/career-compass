from django.contrib import admin
from .models import Quiz, QuizQuestion, QuizAttempt


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 0


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill', 'source', 'status', 'user_id', 'created_at')
    list_filter = ('source', 'status', 'skill')
    inlines = [QuizQuestionInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'quiz', 'score', 'total_questions', 'completed_at')