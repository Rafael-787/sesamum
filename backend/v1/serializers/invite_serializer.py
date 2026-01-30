from django.db import transaction
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from ..models import (
    Check,
    Company,
    Event,
    EventsStaff,
    Project,
    Staff,
    User,
    UserInvite,
)
from ..utils import sanitize_digits


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
        read_only_fields = ["id", "created_by", "used_by"]

    def get_invite_url(self, obj):
        # Exemplo de URL de frontend
        return f"https://app.sesamum.com/register/{obj.id}"
