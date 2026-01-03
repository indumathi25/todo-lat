import logging
import requests
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def youtube_search_suggestions(request):
    """
    Get YouTube search suggestions from Google's autocomplete API.
    Query parameter: q (search query)
    """
    query = request.GET.get('q', '')

    if not query:
        return Response(
            {'error': 'Query parameter "q" is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        logger.info(f"Fetching YouTube suggestions for query: {query}")

        # Call Google's YouTube autocomplete API
        api_url = 'http://suggestqueries.google.com/complete/search'
        params = {
            'client': 'firefox',
            'ds': 'yt',
            'q': query
        }

        response = requests.get(api_url, params=params, timeout=5)
        response.raise_for_status()

        # The API returns a JSON array where the second element contains suggestions
        suggestions = response.json()

        logger.debug(f"Retrieved {len(suggestions[1]) if len(suggestions) > 1 else 0} suggestions")

        return Response({
            'query': query,
            'suggestions': suggestions[1] if len(suggestions) > 1 else []
        }, status=status.HTTP_200_OK)

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching YouTube suggestions: {str(e)}")
        return Response(
            {'error': 'Failed to fetch suggestions from YouTube API'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        logger.error(f"Unexpected error in YouTube suggestions: {str(e)}")
        return Response(
            {'error': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
