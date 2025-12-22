from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, TodoTypeViewSet

router = DefaultRouter()
router.register(r'todos', TodoViewSet, basename='todo')
router.register(r'todo-types', TodoTypeViewSet, basename='todo-type')

urlpatterns = [
    path('', include(router.urls)),
]
