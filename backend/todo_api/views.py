from rest_framework import viewsets, permissions
from .models import Todo, TodoType
from .serializers import TodoSerializer, TodoTypeSerializer

class TodoTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TodoType.objects.all()
    serializer_class = TodoTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Todo.objects.filter(owner=self.request.user).order_by('-created_at')
