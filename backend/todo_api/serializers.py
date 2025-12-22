from rest_framework import serializers
from .models import Todo, TodoType

class TodoTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoType
        fields = ['id', 'name', 'description']

class TodoSerializer(serializers.ModelSerializer):
    todo_type_id = serializers.PrimaryKeyRelatedField(
        queryset=TodoType.objects.all(), source='todo_type', write_only=True, required=False, allow_null=True
    )
    todo_type = TodoTypeSerializer(read_only=True)

    class Meta:
        model = Todo
        fields = ['id', 'title', 'description', 'completed', 'created_at', 'updated_at', 'todo_type', 'todo_type_id']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
