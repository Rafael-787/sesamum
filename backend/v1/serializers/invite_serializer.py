from django.conf import settings
from rest_framework import serializers
from ..models import Company, UserInvite


class InviteSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    invite_url = serializers.SerializerMethodField()
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())

    class Meta:
        model = UserInvite
        fields = [
            "id",
            "company",
            "email",
            "role",
            "expires_at",
            "status",
            "invite_url",
        ]
        read_only_fields = ["id", "created_by", "expires_at", "used_by"]

    def get_invite_url(self, obj):
        # Exemplo de URL de frontend
        return f"{settings.FRONTEND_URL}/signup?invite={obj.id}"

    def to_representation(self, instance):
        # Chamamos a representação padrão (que traria o ID)
        representation = super().to_representation(instance)

        # Substituímos o valor do ID pelo nome do fornecedor apenas no JSON de saída
        if instance.company:
            representation["company"] = instance.company.name

        return representation
