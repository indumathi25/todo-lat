import logging
from rest_framework import viewsets, permissions
from .models import Todo, TodoType
from .serializers import TodoSerializer, TodoTypeSerializer

logger = logging.getLogger(__name__)

class TodoTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TodoType.objects.all()
    serializer_class = TodoTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        logger.debug(f"Fetching todos for user: {self.request.user}")
        return Todo.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        logger.info(f"Creating new todo for user: {self.request.user}")
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        logger.info(f"Updating todo {serializer.instance.id} for user: {self.request.user}")
        serializer.save()

    def perform_destroy(self, instance):
        logger.info(f"Deleting todo {instance.id} for user: {self.request.user}")
        instance.delete()
