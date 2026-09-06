from django.db import models


class Quiz(models.Model):
    SOURCE_CHOICES = [
        ('ai', 'AI Generated'),
        ('student', 'Student Created'),
    ]
    STATUS_CHOICES = [
        ('approved', 'Approved'),
        ('pending', 'Pending Review'),
        ('rejected', 'Rejected'),
    ]
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    # For AI quizzes: the student this quiz was generated for.
    # For student-created quizzes: the student who created it.
    user_id = models.IntegerField()

    title = models.CharField(max_length=200)
    skill = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Beginner')
    duration_minutes = models.PositiveIntegerField(default=10)

    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='ai')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='approved')

    # Only relevant when source='student'
    reviewed_by_user_id = models.IntegerField(null=True, blank=True)
    review_notes = models.TextField(blank=True)

    ai_recommended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quizzes'

    def __str__(self):
        return f"{self.title} ({self.status})"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    options = models.JSONField()          # e.g. ["SELECT", "GET", "FETCH", "READ"]
    correct_index = models.PositiveIntegerField()  # index into options

    class Meta:
        db_table = 'quiz_questions'

    def __str__(self):
        return self.question[:50]


class QuizAttempt(models.Model):
    user_id = models.IntegerField()
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.PositiveIntegerField()          # number correct
    total_questions = models.PositiveIntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz_attempts'

    def __str__(self):
        return f"User {self.user_id} — {self.quiz.title} — {self.score}/{self.total_questions}"