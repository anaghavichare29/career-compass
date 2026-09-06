from rest_framework.generics import ListAPIView
from .models import Task
from .serializers import TaskSerializer


class TaskListView(ListAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return Task.objects.filter(user_id=user_id)