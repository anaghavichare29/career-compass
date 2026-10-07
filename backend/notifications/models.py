from django.db import models


class Notification(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.IntegerField()
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=50, default='general')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        managed = False
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} for user {self.user_id}"
