from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TodoType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Todo(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todos')
    todo_type = models.ForeignKey(TodoType, on_delete=models.SET_NULL, null=True, blank=True, related_name='todos')

    def __str__(self):
        return self.title
