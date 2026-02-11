from rest_framework import serializers

from ..models import Company, Project


class ProjectSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False)
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())

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

    def to_representation(self, instance):
        # Chamamos a representação padrão (que traria o ID)
        representation = super().to_representation(instance)

        # Substituímos o valor do ID pelo nome do fornecedor apenas no JSON de saída
        if instance.company:
            representation["company"] = instance.company.name

        return representation
