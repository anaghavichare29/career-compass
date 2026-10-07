from django.db import models


class StudentProfile(models.Model):
    student_id = models.AutoField(primary_key=True)
    user_id = models.IntegerField(unique=True)
    college = models.CharField(max_length=150, null=True, blank=True)
    course = models.CharField(max_length=100, null=True, blank=True)
    year = models.IntegerField(null=True, blank=True)
    academic_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    location = models.CharField(max_length=150, null=True, blank=True)
    career_goal = models.CharField(max_length=150, null=True, blank=True)

    class Meta:
        db_table = 'students'
        managed = False

    def __str__(self):
        return f"StudentProfile user_id={self.user_id}"


class Skill(models.Model):
    skill_id = models.AutoField(primary_key=True)
    skill_name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'skills'
        managed = False

    def __str__(self):
        return self.skill_name


class StudentSkill(models.Model):
    student_skill_id = models.AutoField(primary_key=True)
    student_id = models.IntegerField()
    skill_id = models.IntegerField()
    proficiency_level = models.CharField(max_length=20, default='INTERMEDIATE')

    class Meta:
        db_table = 'student_skills'
        managed = False

    def __str__(self):
        return f"StudentSkill student={self.student_id} skill={self.skill_id}"
