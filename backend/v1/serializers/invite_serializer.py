from django.conf import settings
from rest_framework import serializers

from ..models import UserInvite


class InviteSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    invite_url = serializers.SerializerMethodField()

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
