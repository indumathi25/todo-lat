from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, TodoTypeViewSet, youtube_search_suggestions

router = DefaultRouter()
router.register(r'todos', TodoViewSet, basename='todo')
router.register(r'todo-types', TodoTypeViewSet, basename='todo-type')

urlpatterns = [
    path('', include(router.urls)),
    path('youtube/search/', youtube_search_suggestions, name='youtube-search'),
]
