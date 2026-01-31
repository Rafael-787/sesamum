from rest_framework import serializers

from ..models import Project


class ProjectSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "date_begin",
            "date_end",
            "status",
            "company",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]
