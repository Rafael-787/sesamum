from rest_framework import serializers

from ..models import (
    Event,
    Project,
)


class EventSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        required=False,
        queryset=Project.objects.all(),
        error_messages={"does_not_exist": "O projeto não foi encontrado."},
    )
    status = serializers.CharField(required=False)

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "description",
            "date_begin",
            "date_end",
            "location",
            "project",
            "status",
        ]
        read_only_fields = ["created_by", "created_at"]
